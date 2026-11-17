import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { put, del } from "@vercel/blob";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";
const maxSize = 4 * 1024 * 1024;
const allowed: Record<string,string> = {
  ".pdf":"application/pdf",
  ".docx":"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".pptx":"application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",
  ".webp":"image/webp",".gif":"image/gif",".avif":"image/avif",".txt":"text/plain"
};
const extension=(name:string)=>{const i=name.lastIndexOf(".");return i>=0?name.slice(i).toLowerCase():"";};
const safeName=(name:string)=>name.normalize("NFKC").replace(/[\\/\\\\]/g,"_").replace(/[^a-zA-Z0-9._-]/g,"_").slice(-140)||"document";

export async function GET(request:NextRequest){
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connexion requise."},{status:401});
  if(!isDatabaseConfigured())return NextResponse.json({error:"Base de données non configurée."},{status:503});
  try{
    const result=await getDatabasePool().query(
      "SELECT id,file_name,content_type,file_size_bytes,image_width,image_height,created_at FROM user_documents WHERE user_id=$1 ORDER BY created_at DESC LIMIT 100",
      [session.user.id]
    );
    return NextResponse.json({documents:result.rows});
  }catch{
    return NextResponse.json({error:"Applique la migration 0009_profile_preferences_documents_billing.sql."},{status:503});
  }
}

export async function POST(request:NextRequest){
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connexion requise."},{status:401});
  if(!isDatabaseConfigured())return NextResponse.json({error:"Base de données non configurée."},{status:503});
  if(!process.env.BLOB_READ_WRITE_TOKEN)return NextResponse.json({error:"Le stockage privé des fichiers n’est pas connecté à Vercel."},{status:503});
  const form=await request.formData().catch(()=>null);
  const file=form?.get("file");
  if(!(file instanceof File))return NextResponse.json({error:"Sélectionne un fichier."},{status:400});
  if(file.size<1||file.size>maxSize)return NextResponse.json({error:"Chaque fichier doit faire au maximum 4 Mo."},{status:413});
  const ext=extension(file.name),contentType=allowed[ext];
  if(!contentType||(file.type&&file.type!==contentType))return NextResponse.json({error:"Format refusé. Formats acceptés : PDF, DOCX, PPTX, PNG, JPG, WebP, GIF, AVIF et TXT."},{status:415});
  const header=new Uint8Array(await file.slice(0,12).arrayBuffer());
  if(ext===".pdf"&&String.fromCharCode(...header.slice(0,4))!=="%PDF")return NextResponse.json({error:"Le fichier n’est pas un PDF valide."},{status:415});
  if(ext===".png"&&!(header[0]===137&&header[1]===80&&header[2]===78&&header[3]===71))return NextResponse.json({error:"L’image PNG est invalide."},{status:415});
  if((ext===".jpg"||ext===".jpeg")&&!(header[0]===255&&header[1]===216&&header[2]===255))return NextResponse.json({error:"L’image JPEG est invalide."},{status:415});
  if((ext===".docx"||ext===".pptx")&&!(header[0]===80&&header[1]===75))return NextResponse.json({error:"Le document Office est invalide."},{status:415});
  const image=contentType.startsWith("image/");
  const width=Number(form?.get("imageWidth"))||null,height=Number(form?.get("imageHeight"))||null;
  const path=`users/${session.user.id}/documents/${randomUUID()}-${safeName(file.name)}`;
  let blobPath:string|null=null;
  try{
    const blob=await put(path,file,{access:"private",contentType});
    blobPath=blob.pathname;
    const result=await getDatabasePool().query(
      `INSERT INTO user_documents(user_id,blob_path,file_name,content_type,file_size_bytes,image_width,image_height)
       VALUES($1,$2,$3,$4,$5,$6,$7)
       RETURNING id,file_name,content_type,file_size_bytes,image_width,image_height,created_at`,
      [session.user.id,blob.pathname,safeName(file.name),contentType,file.size,image?width:null,image?height:null]
    );
    return NextResponse.json({document:result.rows[0]},{status:201});
  }catch{
    if(blobPath)await del(blobPath).catch(()=>undefined);
    return NextResponse.json({error:"L’importation a échoué. Vérifie le stockage privé et la migration 0009."},{status:503});
  }
}