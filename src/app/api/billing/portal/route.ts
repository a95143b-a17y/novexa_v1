import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";
import { getStripeClient } from "@/lib/stripe";

export const runtime="nodejs";

export async function POST(request:NextRequest){
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connexion requise."},{status:401});
  if(!isDatabaseConfigured())return NextResponse.json({error:"Base de données non configurée."},{status:503});
  try{
    const result=await getDatabasePool().query("SELECT stripe_customer_id FROM profiles WHERE id=$1 LIMIT 1",[session.user.id]);
    const customerId=result.rows[0]?.stripe_customer_id as string|undefined;
    if(!customerId)return NextResponse.json({error:"Aucun client Stripe n’est associé à ce compte."},{status:404});
    const portal=await getStripeClient().billingPortal.sessions.create({
      customer:customerId,
      return_url:new URL("/abonnement",process.env.NEXT_PUBLIC_APP_URL||request.nextUrl.origin).toString()
    });
    return NextResponse.json({url:portal.url});
  }catch{
    return NextResponse.json({error:"Le portail de gestion Stripe n’est pas disponible. Vérifie la configuration du compte de test."},{status:503});
  }
}