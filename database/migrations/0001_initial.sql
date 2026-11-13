-- NOVEXA V1 — initial PostgreSQL schema
-- Review and apply only after provisioning a dedicated database.
-- This migration is NOT applied automatically by the application.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('learner', 'parent', 'teacher', 'institution_admin', 'platform_admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE record_status AS ENUM ('draft', 'active', 'suspended', 'archived', 'deleted');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE review_status AS ENUM ('discovered', 'source_verified', 'fetched', 'extracted', 'quality_check', 'review_required', 'approved', 'published', 'rejected', 'superseded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Better Auth owns the credential/session tables.
-- profiles.id must equal the corresponding Better Auth user ID.
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'learner',
  status record_status NOT NULL DEFAULT 'active',
  preferred_language VARCHAR(12) NOT NULL DEFAULT 'fr',
  timezone VARCHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution_type VARCHAR(40) NOT NULL,
  country_code CHAR(2) NOT NULL,
  status record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS institution_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  membership_role VARCHAR(32) NOT NULL CHECK (membership_role IN ('institution_admin','teacher','learner')),
  status record_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, user_id)
);

CREATE TABLE IF NOT EXISTS guardian_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  learner_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  relationship_label VARCHAR(40),
  status VARCHAR(24) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','revoked')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (guardian_user_id <> learner_user_id),
  UNIQUE (guardian_user_id, learner_user_id)
);

CREATE TABLE IF NOT EXISTS curriculum_authorities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  territory_code VARCHAR(32),
  authority_name TEXT NOT NULL,
  official_domain TEXT NOT NULL,
  verification_status VARCHAR(20) NOT NULL DEFAULT 'candidate' CHECK (verification_status IN ('candidate','verified','rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country_code, territory_code, official_domain)
);

CREATE TABLE IF NOT EXISTS curriculum_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  authority_id UUID NOT NULL REFERENCES curriculum_authorities(id),
  source_url TEXT NOT NULL,
  source_title TEXT NOT NULL,
  source_kind VARCHAR(40) NOT NULL,
  original_language VARCHAR(12) NOT NULL,
  publication_date DATE,
  revision_date DATE,
  reuse_rights_status VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK (reuse_rights_status IN ('verified','restricted','unknown')),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'candidate' CHECK (verification_status IN ('candidate','verified','rejected')),
  fetched_at TIMESTAMPTZ,
  content_sha256 CHAR(64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (authority_id, source_url)
);

CREATE TABLE IF NOT EXISTS curricula (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  territory_code VARCHAR(32),
  authority_id UUID REFERENCES curriculum_authorities(id),
  curriculum_code VARCHAR(100) NOT NULL,
  official_title TEXT NOT NULL,
  education_stage VARCHAR(80) NOT NULL,
  language VARCHAR(12) NOT NULL,
  status record_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country_code, territory_code, curriculum_code)
);

CREATE TABLE IF NOT EXISTS curriculum_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  source_id UUID NOT NULL REFERENCES curriculum_sources(id),
  version_label VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  publication_date DATE,
  effective_from DATE,
  effective_until DATE,
  original_language VARCHAR(12) NOT NULL,
  rights_review_status VARCHAR(20) NOT NULL DEFAULT 'unknown' CHECK (rights_review_status IN ('verified','restricted','unknown')),
  review_status review_status NOT NULL DEFAULT 'discovered',
  approved_by TEXT REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (curriculum_id, version_label, academic_year)
);

CREATE TABLE IF NOT EXISTS curriculum_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_version_id UUID NOT NULL REFERENCES curriculum_versions(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  node_type VARCHAR(32) NOT NULL CHECK (node_type IN ('level','subject','topic','competency','learning_outcome','assessment_guide','other')),
  node_code VARCHAR(100),
  title TEXT NOT NULL,
  description TEXT,
  source_locator TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by TEXT REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  curriculum_node_id UUID REFERENCES curriculum_nodes(id),
  title TEXT NOT NULL,
  description TEXT,
  language VARCHAR(12) NOT NULL DEFAULT 'fr',
  status record_status NOT NULL DEFAULT 'draft',
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('private','institution','public')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0,
  estimated_minutes INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  author_id TEXT REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  title TEXT NOT NULL,
  assessment_type VARCHAR(32) NOT NULL CHECK (assessment_type IN ('quiz','practice','mock_exam','diagnostic','other')),
  duration_minutes INTEGER,
  status record_status NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  item_type VARCHAR(32) NOT NULL,
  prompt JSONB NOT NULL,
  grading_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  position INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS learner_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  completion_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percent >= 0 AND completion_percent <= 100),
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (learner_id, course_id)
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id),
  learner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score NUMERIC(7,2),
  maximum_score NUMERIC(7,2),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  feedback JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS admin_agent_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  administrator_id TEXT NOT NULL REFERENCES profiles(id),
  agent_id VARCHAR(24) NOT NULL CHECK (agent_id IN ('nexus','finora','aegis','orbis','pulse','atlas')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  archived_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS admin_agent_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES admin_agent_conversations(id) ON DELETE CASCADE,
  speaker VARCHAR(16) NOT NULL CHECK (speaker IN ('administrator','agent','system')),
  content TEXT NOT NULL,
  source_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id TEXT REFERENCES profiles(id),
  agent_id VARCHAR(24) CHECK (agent_id IS NULL OR agent_id IN ('nexus','finora','aegis','orbis','pulse','atlas')),
  action VARCHAR(120) NOT NULL,
  target_type VARCHAR(80),
  target_id TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','proposed','approved','rejected','executed','failed')),
  requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
  approved_by TEXT REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id),
  institution_id UUID REFERENCES institutions(id),
  provider VARCHAR(40) NOT NULL,
  provider_subscription_id TEXT,
  plan_code VARCHAR(64) NOT NULL,
  status VARCHAR(24) NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider VARCHAR(40) NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type VARCHAR(120) NOT NULL,
  status VARCHAR(24) NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (provider, provider_event_id)
);

CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  owner_user_id TEXT REFERENCES profiles(id),
  provider VARCHAR(48) NOT NULL,
  external_account_ref TEXT,
  secret_reference TEXT,
  status VARCHAR(24) NOT NULL DEFAULT 'pending',
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memberships_user ON institution_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_guardian_learner ON guardian_links(learner_user_id, status);
CREATE INDEX IF NOT EXISTS idx_curricula_country_stage ON curricula(country_code, education_stage, status);
CREATE INDEX IF NOT EXISTS idx_curriculum_versions_review ON curriculum_versions(review_status, academic_year);
CREATE INDEX IF NOT EXISTS idx_curriculum_nodes_parent ON curriculum_nodes(parent_id, position);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status, visibility);
CREATE INDEX IF NOT EXISTS idx_progress_learner ON learner_progress(learner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_learner ON assessment_attempts(learner_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation ON admin_agent_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_events_provider ON billing_events(provider, provider_event_id);

-- Before using this schema with real users:
-- 1. Configure the authentication adapter and verify profiles are synchronized.
-- 2. Add PostgreSQL Row-Level Security policies for every user-scoped table.
-- 3. Add explicit role and institution checks in server services.
-- 4. Define retention/deletion procedures and backup/restore tests.
-- 5. Never store payment card data or raw API credentials in these tables.
