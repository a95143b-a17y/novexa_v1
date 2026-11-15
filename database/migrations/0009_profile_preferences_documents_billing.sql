-- NOVEXA — profil d'apprentissage, documents privés et liens Stripe.
-- À appliquer manuellement après sauvegarde de la base et vérification de l'environnement.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS provider_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_provider_subscription
  ON subscriptions (provider, provider_subscription_id)
  WHERE provider_subscription_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS user_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blob_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0 AND file_size_bytes <= 4194304),
  image_width INTEGER,
  image_height INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_documents_user_created
  ON user_documents (user_id, created_at DESC);