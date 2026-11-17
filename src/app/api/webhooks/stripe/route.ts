import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const runtime="nodejs";

export async function POST(request:NextRequest){
  const signingSecret=process.env.STRIPE_WEBHOOK_SECRET;
  if(!signingSecret||!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_")){
    return NextResponse.json({error:"Webhook Stripe de test non configuré."},{status:503});
  }
  const signature=request.headers.get("stripe-signature");
  if(!signature)return NextResponse.json({error:"Signature manquante."},{status:400});
  const rawBody=await request.text();
  let event:Stripe.Event;
  try{
    event=getStripeClient().webhooks.constructEvent(rawBody,signature,signingSecret);
  }catch{
    return NextResponse.json({error:"Signature Stripe invalide."},{status:400});
  }
  if(!isDatabaseConfigured())return NextResponse.json({error:"Base de données non configurée."},{status:503});

  const supported=new Set(["customer.subscription.created","customer.subscription.updated","customer.subscription.deleted"]);
  const client=await getDatabasePool().connect();
  try{
    await client.query("BEGIN");
    const recorded=await client.query(
      `INSERT INTO billing_events(provider,provider_event_id,event_type,status,event_data)
       VALUES('stripe',$1,$2,'received',$3::jsonb)
       ON CONFLICT(provider,provider_event_id) DO NOTHING
       RETURNING id`,
      [event.id,event.type,JSON.stringify({livemode:event.livemode})]
    );
    if(recorded.rowCount===0){
      await client.query("COMMIT");
      return NextResponse.json({received:true,duplicate:true});
    }
    if(!supported.has(event.type)){
      await client.query("UPDATE billing_events SET status='ignored' WHERE id=$1",[recorded.rows[0].id]);
      await client.query("COMMIT");
      return NextResponse.json({received:true});
    }

    const subscription=event.data.object as Stripe.Subscription;
    const userId=subscription.metadata?.userId;
    const planCode=subscription.metadata?.planCode;
    if(!userId||(planCode!=="level_2"&&planCode!=="level_3")){
      await client.query("UPDATE billing_events SET status='ignored' WHERE id=$1",[recorded.rows[0].id]);
      await client.query("COMMIT");
      return NextResponse.json({received:true,ignored:true});
    }

    const rawSubscription=subscription as unknown as Record<string,unknown>;
    const periodStart=typeof rawSubscription.current_period_start==="number"?new Date(rawSubscription.current_period_start*1000):null;
    const periodEnd=typeof rawSubscription.current_period_end==="number"?new Date(rawSubscription.current_period_end*1000):null;
    const customerId=typeof subscription.customer==="string"?subscription.customer:subscription.customer.id;
    const status=event.type==="customer.subscription.deleted"?"canceled":subscription.status;
    const saved=await client.query(
      `INSERT INTO subscriptions
        (user_id,provider,provider_customer_id,provider_subscription_id,plan_code,status,current_period_start,current_period_end,cancel_at_period_end)
       VALUES($1,'stripe',$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT(provider,provider_subscription_id) WHERE provider_subscription_id IS NOT NULL
       DO UPDATE SET user_id=EXCLUDED.user_id,provider_customer_id=EXCLUDED.provider_customer_id,
         plan_code=EXCLUDED.plan_code,status=EXCLUDED.status,current_period_start=EXCLUDED.current_period_start,
         current_period_end=EXCLUDED.current_period_end,cancel_at_period_end=EXCLUDED.cancel_at_period_end
       RETURNING id`,
      [userId,customerId,subscription.id,planCode,status,periodStart,periodEnd,subscription.cancel_at_period_end]
    );
    await client.query("UPDATE billing_events SET status='processed',subscription_id=$2 WHERE id=$1",[recorded.rows[0].id,saved.rows[0].id]);
    await client.query("COMMIT");
    return NextResponse.json({received:true});
  }catch{
    await client.query("ROLLBACK").catch(()=>undefined);
    return NextResponse.json({error:"Échec de synchronisation de l’abonnement."},{status:503});
  }finally{
    client.release();
  }
}