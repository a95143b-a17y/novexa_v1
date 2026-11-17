import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";
import BillingPlans from "@/components/billing-plans";

export const metadata: Metadata = { title: "Abonnements" };
export const dynamic = "force-dynamic";

export default async function AbonnementPage() {
  const session = await getSessionFromHeaders(await headers());
  const paymentsConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") &&
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_PRICE_LEVEL_2 &&
    process.env.STRIPE_PRICE_LEVEL_3
  );

  let currentPlan: string | null = null;
  let currentStatus: string | null = null;
  let hasCustomer = false;

  if (session && isDatabaseConfigured()) {
    try {
      const [subscription, customer] = await Promise.all([
        getDatabasePool().query(
          "SELECT plan_code, status FROM subscriptions WHERE provider = 'stripe' AND user_id = $1 ORDER BY created_at DESC LIMIT 1",
          [session.user.id]
        ),
        getDatabasePool().query(
          "SELECT stripe_customer_id FROM profiles WHERE id = $1 LIMIT 1",
          [session.user.id]
        )
      ]);
      currentPlan = subscription.rows[0]?.plan_code || null;
      currentStatus = subscription.rows[0]?.status || null;
      hasCustomer = Boolean(customer.rows[0]?.stripe_customer_id);
    } catch {
      // La page reste consultable ; les actions de paiement indiqueront la configuration manquante.
    }
  }

  return (
    <main className="billing-shell">
      <header className="billing-top">
        <Link href="/" className="billing-brand">NOV<span>X</span>EXA</Link>
        <nav><Link href="/">Accueil</Link><Link href="/connexion">Connexion</Link></nav>
        <Link className="billing-top-cta" href={session ? "/app" : "/inscription"}>
          {session ? "Mon espace" : "Créer un compte"}
        </Link>
      </header>
      <section className="billing-content">
        <p className="auth-eyebrow">FORMULES NOVEXA</p>
        <h1>Choisissez votre<br /><em>niveau d’apprentissage.</em></h1>
        <p className="billing-lead">Commencez gratuitement, puis activez les outils avancés lorsque vous en avez besoin. Les fonctionnalités sont accordées par NOVEXA après confirmation serveur du paiement.</p>
        <BillingPlans
          signedIn={Boolean(session)}
          paymentsConfigured={paymentsConfigured}
          currentPlan={currentPlan}
          currentStatus={currentStatus}
          hasCustomer={hasCustomer}
        />
        <p className="billing-footnote">Les paiements sont actuellement préparés en mode test. Aucun paiement réel ne sera accepté par cette version.</p>
      </section>
    </main>
  );
}