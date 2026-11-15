import { NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function GET(request:NextRequest,context:{params:Promise<{documentId:string}>}) {
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connexion requise."},{status:401});
  if(!isDatabaseConfigured()||!process.env.BLOB_READ_WRITE_TOKEN)return NextResponse.json({error:"Stockage non configuré."},{status:503});
  const {documentId}=await context.params;
  if(!/^[0-9a-f-]{36}$/i.test(documentId))return NextResponse.json({error:"Identifiant invalide."},{status:400});
  try{
    const result=await getDatabasePool().query(
      "SELECT blob_path,file_name,content_type FROM user_documents WHERE id=$1 AND user_id=$2 LIMIT 1",
      [documentId,session.user.id]
    );
    if(result.rowCount!==1)return NextResponse.json({error:"Document introuvable."},{status:404});
    const file=await get(result.rows[0].blob_path,{access:"private"});
    if(!file||file.statusCode!==200)return NextResponse.json({error:"Fichier indisponible."},{status:404});
    const inline=request.nextUrl.searchParams.get("inline")==="1"&&String(result.rows[0].content_type).startsWith("image/");
    const name=encodeURIComponent(String(result.rows[0].file_name));
    return new NextResponse(file.stream,{
      headers:{
        "Content-Type":String(result.rows[0].content_type),
        "Content-Disposition":`${inline?"inline":"attachment"}; filename*=UTF-8''${name}`,
        "X-Content-Type-Options":"nosniff",
        "Cache-Control":"private, no-store"
      }
    });
  }catch{
    return NextResponse.json({error:"Impossible de lire ce document."},{status:503});
  }
}