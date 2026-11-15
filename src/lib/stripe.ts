import Stripe from "stripe";

/**
 * NOVEXA currently accepts Stripe test-mode credentials only.
 * Live payment processing must remain disabled until the platform is owned
 * and operated by an adult/legal entity authorised to accept payments.
 */
export function isStripeTestModeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"));
}

export function getStripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secret.startsWith("sk_test_")) {
    throw new Error("Stripe est indisponible : configure une clé de test sk_test_ côté serveur.");
  }
  return new Stripe(secret);
}

export function getStripePriceId(planCode: "level_2" | "level_3"): string | null {
  const value = planCode === "level_2"
    ? process.env.STRIPE_PRICE_LEVEL_2
    : process.env.STRIPE_PRICE_LEVEL_3;
  return value?.startsWith("price_") ? value : null;
}