-- Apply after Better Auth's own migration and after 0001_initial.sql.
-- Better Auth CLI creates "user", "session", "account", "verification".

ALTER TABLE "user"
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'learner';

DO $$ BEGIN
  ALTER TABLE "user"
    ADD CONSTRAINT user_role_allowed
    CHECK (role IN ('learner','parent','teacher','institution_admin','platform_admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_user_fk
    FOREIGN KEY (id) REFERENCES "user"(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

UPDATE profiles p
SET role = u.role::app_role
FROM "user" u
WHERE p.id = u.id
  AND u.role IN ('learner','parent','teacher','institution_admin','platform_admin');
