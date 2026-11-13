-- ATLAS France pilot: subject-level institutional curriculum indexes.
-- These are discovery sources, not imported or approved curriculum content.

INSERT INTO curriculum_sources
  (authority_id, source_url, source_title, source_kind, original_language, reuse_rights_status, verification_status)
SELECT a.id, s.source_url, s.source_title, 'national_curriculum_index', 'fr', 'unknown', 'verified'
FROM (VALUES
  ('Programmes et ressources en numérique et sciences informatiques', 'https://eduscol.education.gouv.fr/5823/programmes-et-ressources-en-numerique-et-sciences-informatiques-voie-g'),
  ('Programmes et ressources en sciences économiques et sociales', 'https://eduscol.education.gouv.fr/5838/programmes-et-ressources-en-sciences-economiques-et-sociales-voie-gt'),
  ('Programmes et ressources en histoire-géographie', 'https://eduscol.education.gouv.fr/5799/programmes-et-ressources-en-histoire-geographie-voie-gt'),
  ('Programmes et ressources en sciences numériques et technologie', 'https://eduscol.education.gouv.fr/5841/programmes-et-ressources-en-sciences-numeriques-et-technologie-voie-gt')
) AS s(source_title, source_url)
JOIN curriculum_authorities a
  ON a.country_code = 'FR'
 AND a.territory_code = ''
 AND a.official_domain = 'eduscol.education.gouv.fr'
ON CONFLICT (authority_id, source_url) DO UPDATE
SET source_title = EXCLUDED.source_title,
    source_kind = EXCLUDED.source_kind,
    verification_status = 'verified';
