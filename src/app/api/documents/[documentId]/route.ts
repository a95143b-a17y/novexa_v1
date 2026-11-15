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
    const result=await pool.query(
      "DELETE FROM user_documents WHERE id=$1 AND user_id=$2 RETURNING blob_path",
      [documentId,session.user.id]
    );
    if(result.rowCount!==1)return NextResponse.json({error:"Document introuvable."},{status:404});

    // Remove the database reference first so a storage deletion failure cannot
    // leave a visible document record pointing to a missing private blob.
    try {
      await del(result.rows[0].blob_path);
    } catch {
      return NextResponse.json({success:true,storageCleanupPending:true});
    }
    return NextResponse.json({success:true});
  }catch{
    return NextResponse.json({error:"Impossible de supprimer le document."},{status:503});
  }
}