-- NOVEXA V1 — per-lesson learner progress
-- Apply after 0001_initial.sql through 0003_seed_france_curriculum_sources.sql.

CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_unit_id UUID NOT NULL REFERENCES course_units(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (learner_id, course_unit_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_learner
  ON lesson_progress(learner_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_unit
  ON lesson_progress(course_unit_id);
