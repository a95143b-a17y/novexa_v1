import { NextRequest, NextResponse } from "next/server";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";
import { getStripeClient, getStripePriceId } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request:NextRequest) {
  const session=await getSessionFromHeaders(request.headers);
  if(!session)return NextResponse.json({error:"Connecte-toi avant de choisir une formule."},{status:401});
  if(!isDatabaseConfigured())return NextResponse.json({error:"La base de données n’est pas configurée."},{status:503});
  const body=await request.json().catch(()=>null);
  const planCode=body?.planCode;
  if(planCode!=="level_2"&&planCode!=="level_3")return NextResponse.json({error:"Formule invalide."},{status:400});
  const priceId=getStripePriceId(planCode);
  if(!priceId)return NextResponse.json({error:"Le prix Stripe de cette formule de test n’est pas encore configuré."},{status:503});

  try{
    const pool=getDatabasePool();
    const profile=await pool.query("SELECT stripe_customer_id FROM profiles WHERE id=$1 LIMIT 1",[session.user.id]);
    if(profile.rowCount!==1)return NextResponse.json({error:"Profil introuvable."},{status:404});
    const existing=await pool.query(
      "SELECT status FROM subscriptions WHERE provider='stripe' AND user_id=$1 ORDER BY created_at DESC LIMIT 1",
      [session.user.id]
    );
    if(["active","trialing","past_due","unpaid"].includes(existing.rows[0]?.status)){
      return NextResponse.json({error:"Un abonnement existe déjà. Utilise la gestion de l’abonnement pour le modifier."},{status:409});
    }

    const stripe=getStripeClient();
    let customerId=profile.rows[0].stripe_customer_id as string|null;
    if(!customerId){
      const customer=await stripe.customers.create({
        email:session.user.email,
        name:session.user.name||undefined,
        metadata:{userId:session.user.id}
      });
      customerId=customer.id;
      await pool.query("UPDATE profiles SET stripe_customer_id=$2,updated_at=NOW() WHERE id=$1",[session.user.id,customerId]);
    }

    const baseUrl=process.env.NEXT_PUBLIC_APP_URL||request.nextUrl.origin;
    const checkout=await stripe.checkout.sessions.create({
      mode:"subscription",
      customer:customerId,
      line_items:[{price:priceId,quantity:1}],
      client_reference_id:session.user.id,
      metadata:{userId:session.user.id,planCode},
      subscription_data:{metadata:{userId:session.user.id,planCode}},
      success_url:new URL("/abonnement?checkout=success",baseUrl).toString(),
      cancel_url:new URL("/abonnement?checkout=cancelled",baseUrl).toString()
    });
    if(!checkout.url)return NextResponse.json({error:"Stripe n’a pas fourni de lien de paiement."},{status:502});
    return NextResponse.json({url:checkout.url});
  }catch{
    return NextResponse.json({error:"Impossible de préparer le paiement de test. Vérifie la configuration Stripe et la migration 0009."},{status:503});
  }
}