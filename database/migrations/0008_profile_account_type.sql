ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type VARCHAR(32) NOT NULL DEFAULT 'student';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type_status VARCHAR(20) NOT NULL DEFAULT 'active';
DO $$ BEGIN
 ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_allowed CHECK (account_type IN ('student','university','teacher','institution','parent'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
 ALTER TABLE profiles ADD CONSTRAINT profiles_account_type_status_allowed CHECK (account_type_status IN ('active','pending','rejected'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;