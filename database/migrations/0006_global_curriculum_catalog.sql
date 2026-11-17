-- NOVEXA — global curriculum catalogue foundation
-- Adds an internationally comparable layer without flattening national differences.
-- Safe to apply after migrations 0001–0005. Does not import or publish curricula.

CREATE TABLE IF NOT EXISTS education_jurisdictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code CHAR(2) NOT NULL,
  territory_code VARCHAR(32) NOT NULL DEFAULT '',
  parent_id UUID REFERENCES education_jurisdictions(id),
  jurisdiction_name TEXT NOT NULL,
  jurisdiction_kind VARCHAR(24) NOT NULL DEFAULT 'country'
    CHECK (jurisdiction_kind IN ('country','federal_state','province','region','territory','education_authority_area')),
  official_language_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (country_code, territory_code)
);

CREATE TABLE IF NOT EXISTS education_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id UUID NOT NULL REFERENCES education_jurisdictions(id),
  system_code VARCHAR(80) NOT NULL,
  system_name TEXT NOT NULL,
  governance_level VARCHAR(24) NOT NULL DEFAULT 'national'
    CHECK (governance_level IN ('national','federal','state','provincial','regional','international','institutional')),
  official_authority TEXT,
  official_url TEXT,
  language_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'candidate'
    CHECK (status IN ('candidate','verified','inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (jurisdiction_id, system_code)
);

CREATE TABLE IF NOT EXISTS education_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_code VARCHAR(32) NOT NULL UNIQUE,
  stage_name TEXT NOT NULL,
  isced_level VARCHAR(8),
  sequence_order SMALLINT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_field_taxonomy (
  field_code VARCHAR(12) PRIMARY KEY,
  parent_field_code VARCHAR(12) REFERENCES curriculum_field_taxonomy(field_code),
  classification_name VARCHAR(32) NOT NULL DEFAULT 'ISCED-F-2013',
  field_name TEXT NOT NULL,
  field_level SMALLINT NOT NULL CHECK (field_level IN (2,3,4)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES education_stages(id),
  field_code VARCHAR(12) REFERENCES curriculum_field_taxonomy(field_code),
  local_subject_code VARCHAR(100),
  subject_name TEXT NOT NULL,
  language_code VARCHAR(12) NOT NULL,
  subject_kind VARCHAR(24) NOT NULL DEFAULT 'subject'
    CHECK (subject_kind IN ('subject','module','course','learning_area','discipline','workshop')),
  source_node_id UUID REFERENCES curriculum_nodes(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','verified','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (curriculum_id, local_subject_code, language_code)
);

CREATE TABLE IF NOT EXISTS curriculum_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curriculum_id UUID NOT NULL REFERENCES curricula(id) ON DELETE CASCADE,
  stage_id UUID REFERENCES education_stages(id),
  pathway_code VARCHAR(100),
  pathway_name TEXT NOT NULL,
  pathway_kind VARCHAR(24) NOT NULL
    CHECK (pathway_kind IN ('track','specialty','specialisation','stream','major','minor','option','concentration','vocational_pathway','qualification_route')),
  description TEXT,
  language_code VARCHAR(12) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','verified','published','archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (curriculum_id, pathway_code, language_code)
);

CREATE TABLE IF NOT EXISTS curriculum_pathway_subjects (
  pathway_id UUID NOT NULL REFERENCES curriculum_pathways(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES curriculum_subjects(id) ON DELETE CASCADE,
  requirement_kind VARCHAR(20) NOT NULL DEFAULT 'elective'
    CHECK (requirement_kind IN ('mandatory','elective','optional','prerequisite')),
  position INTEGER NOT NULL DEFAULT 0,
  workload_value NUMERIC(8,2),
  workload_unit VARCHAR(24),
  PRIMARY KEY (pathway_id, subject_id)
);

ALTER TABLE curricula
  ADD COLUMN IF NOT EXISTS education_system_id UUID REFERENCES education_systems(id),
  ADD COLUMN IF NOT EXISTS education_stage_id UUID REFERENCES education_stages(id);

CREATE INDEX IF NOT EXISTS idx_education_systems_jurisdiction
  ON education_systems(jurisdiction_id, status);
CREATE INDEX IF NOT EXISTS idx_curriculum_subjects_curriculum
  ON curriculum_subjects(curriculum_id, status);
CREATE INDEX IF NOT EXISTS idx_curriculum_pathways_curriculum
  ON curriculum_pathways(curriculum_id, status);
CREATE INDEX IF NOT EXISTS idx_curriculum_field_parent
  ON curriculum_field_taxonomy(parent_field_code);

INSERT INTO education_stages (stage_code, stage_name, isced_level, sequence_order, description)
VALUES
  ('ISCED-0','Éducation de la petite enfance','0',0,'Programmes éducatifs de la petite enfance et préprimaire.'),
  ('ISCED-1','Enseignement primaire','1',1,'Premier cycle de l’enseignement scolaire.'),
  ('ISCED-2','Premier cycle du secondaire','2',2,'Enseignement secondaire inférieur.'),
  ('ISCED-3','Deuxième cycle du secondaire','3',3,'Enseignement secondaire supérieur, général ou professionnel.'),
  ('ISCED-4','Post-secondaire non supérieur','4',4,'Formations post-secondaires non tertiaires.'),
  ('ISCED-5','Enseignement tertiaire de cycle court','5',5,'Formations tertiaires courtes.'),
  ('ISCED-6','Licence ou équivalent','6',6,'Premier cycle de l’enseignement supérieur.'),
  ('ISCED-7','Master ou équivalent','7',7,'Deuxième cycle de l’enseignement supérieur.'),
  ('ISCED-8','Doctorat ou équivalent','8',8,'Programmes de recherche de niveau doctoral.')
ON CONFLICT (stage_code) DO UPDATE
SET stage_name = EXCLUDED.stage_name,
    isced_level = EXCLUDED.isced_level,
    sequence_order = EXCLUDED.sequence_order,
    description = EXCLUDED.description;

INSERT INTO curriculum_field_taxonomy (field_code, parent_field_code, field_name, field_level)
VALUES
  ('00',NULL,'Programmes généraux et qualifications',2),
  ('01',NULL,'Éducation',2),('011','01','Éducation',3),('018','01','Programmes interdisciplinaires liés à l’éducation',3),
  ('02',NULL,'Arts et lettres',2),('021','02','Arts',3),('022','02','Lettres et sciences humaines',3),('023','02','Langues',3),('028','02','Programmes interdisciplinaires liés aux arts et lettres',3),
  ('03',NULL,'Sciences sociales, journalisme et information',2),('031','03','Sciences sociales et comportementales',3),('032','03','Journalisme et information',3),('038','03','Programmes interdisciplinaires liés aux sciences sociales',3),
  ('04',NULL,'Commerce, administration et droit',2),('041','04','Commerce et administration',3),('042','04','Droit',3),('048','04','Programmes interdisciplinaires liés au commerce et au droit',3),
  ('05',NULL,'Sciences naturelles, mathématiques et statistiques',2),('051','05','Sciences biologiques et disciplines associées',3),('052','05','Environnement',3),('053','05','Sciences physiques',3),('054','05','Mathématiques et statistiques',3),('058','05','Programmes interdisciplinaires liés aux sciences naturelles',3),
  ('06',NULL,'Technologies de l’information et de la communication',2),('061','06','Technologies de l’information et de la communication',3),
  ('07',NULL,'Ingénierie, industries de transformation et construction',2),('071','07','Ingénierie et techniques apparentées',3),('072','07','Industries de transformation et de traitement',3),('073','07','Architecture et construction',3),('078','07','Programmes interdisciplinaires liés à l’ingénierie',3),
  ('08',NULL,'Agriculture, sylviculture, halieutique et sciences vétérinaires',2),('081','08','Agriculture',3),('082','08','Sylviculture',3),('083','08','Pêche',3),('084','08','Sciences vétérinaires',3),('088','08','Programmes interdisciplinaires liés à l’agriculture',3),
  ('09',NULL,'Santé et protection sociale',2),('091','09','Santé',3),('092','09','Protection sociale',3),
  ('10',NULL,'Services',2),('101','10','Services aux particuliers',3),('102','10','Hygiène et santé au travail',3),('103','10','Services de sécurité',3),('104','10','Services de transport',3)
ON CONFLICT (field_code) DO UPDATE
SET parent_field_code = EXCLUDED.parent_field_code,
    field_name = EXCLUDED.field_name,
    field_level = EXCLUDED.field_level;

INSERT INTO education_jurisdictions (country_code, territory_code, jurisdiction_name, jurisdiction_kind, official_language_codes)
VALUES ('FR','', 'France', 'country', '["fr"]'::jsonb)
ON CONFLICT (country_code, territory_code) DO UPDATE
SET jurisdiction_name = EXCLUDED.jurisdiction_name,
    official_language_codes = EXCLUDED.official_language_codes;

INSERT INTO education_systems (jurisdiction_id, system_code, system_name, governance_level, official_authority, official_url, language_codes, status)
SELECT id, 'FR-NATIONAL', 'Système éducatif national français', 'national',
       'Ministère de l’Éducation nationale et Ministère de l’Enseignement supérieur et de la Recherche',
       'https://www.education.gouv.fr/', '["fr"]'::jsonb, 'verified'
FROM education_jurisdictions
WHERE country_code = 'FR' AND territory_code = ''
ON CONFLICT (jurisdiction_id, system_code) DO UPDATE
SET system_name = EXCLUDED.system_name,
    official_authority = EXCLUDED.official_authority,
    official_url = EXCLUDED.official_url,
    language_codes = EXCLUDED.language_codes,
    status = EXCLUDED.status;

UPDATE curricula c
SET education_system_id = es.id
FROM education_systems es
JOIN education_jurisdictions ej ON ej.id = es.jurisdiction_id
WHERE c.country_code = 'FR'
  AND es.system_code = 'FR-NATIONAL'
  AND ej.country_code = c.country_code
  AND (c.territory_code IS NULL OR c.territory_code = '');
