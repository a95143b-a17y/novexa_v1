import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime = "nodejs";

export async function DELETE(request:NextRequest,context:{params:Promise<{documentId:string}>}) {
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connexion requise."},{status:401});
  if(!isDatabaseConfigured()||!process.env.BLOB_READ_WRITE_TOKEN)return NextResponse.json({error:"Stockage non configuré."},{status:503});
  const {documentId}=await context.params;
  if(!/^[0-9a-f-]{36}$/i.test(documentId))return NextResponse.json({error:"Identifiant invalide."},{status:400});
  try{
    const pool=getDatabasePool();
    const result=await pool.query("SELECT blob_path FROM user_documents WHERE id=$1 AND user_id=$2 LIMIT 1",[documentId,session.user.id]);
    if(result.rowCount!==1)return NextResponse.json({error:"Document introuvable."},{status:404});
    await del(result.rows[0].blob_path);
    await pool.query("DELETE FROM user_documents WHERE id=$1 AND user_id=$2",[documentId,session.user.id]);
    return NextResponse.json({success:true});
  }catch{
    return NextResponse.json({error:"Impossible de supprimer le document."},{status:503});
  }
}