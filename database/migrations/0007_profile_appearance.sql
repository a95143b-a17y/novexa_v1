-- Persist user-selected appearance settings (custom wallpaper files remain local until private media storage is configured).
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS appearance JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_profiles_appearance_updated
  ON profiles (updated_at DESC);
