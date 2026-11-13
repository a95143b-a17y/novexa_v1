-- ATLAS France pilot: seed the ministry and public legal-source registry.
-- Domain verification means the authority/domain was reviewed for discovery.
-- Reuse rights stay unknown until each document is separately assessed.

INSERT INTO curriculum_authorities
  (country_code, territory_code, authority_name, official_domain, verification_status, verified_at)
VALUES
  ('FR', '', 'Ministère de l''Éducation nationale', 'education.gouv.fr', 'verified', NOW()),
  ('FR', '', 'Éduscol — Direction générale de l''enseignement scolaire', 'eduscol.education.gouv.fr', 'verified', NOW()),
  ('FR', '', 'Éduscol — ressources institutionnelles', 'eduscol.education.fr', 'verified', NOW()),
  ('FR', '', 'Ministère de l''Enseignement supérieur et de la Recherche', 'enseignementsup-recherche.gouv.fr', 'verified', NOW()),
  ('FR', '', 'Légifrance', 'legifrance.gouv.fr', 'verified', NOW()),
  ('FR', '', 'Journal officiel de la République française', 'journal-officiel.gouv.fr', 'verified', NOW())
ON CONFLICT (country_code, territory_code, official_domain)
DO UPDATE SET authority_name = EXCLUDED.authority_name,
              verification_status = 'verified',
              verified_at = COALESCE(curriculum_authorities.verified_at, NOW());

INSERT INTO curriculum_sources
  (authority_id, source_url, source_title, source_kind, original_language, reuse_rights_status, verification_status)
SELECT a.id, s.source_url, s.source_title, s.source_kind, 'fr', 'unknown', 'verified'
FROM (VALUES
  ('education.gouv.fr', 'https://www.education.gouv.fr/le-bulletin-officiel-de-l-education-nationale-de-la-jeunesse-et-des-sports', 'Bulletin officiel de l''Éducation nationale', 'normative_publication'),
  ('education.gouv.fr', 'https://www.education.gouv.fr/programmes-scolaires-41483', 'Programmes scolaires', 'national_curriculum_index'),
  ('education.gouv.fr', 'https://www.education.gouv.fr/les-programmes-du-college-470408', 'Les programmes du collège', 'national_curriculum_index'),
  ('eduscol.education.gouv.fr', 'https://eduscol.education.gouv.fr/4332/niveaux', 'Éduscol — niveaux et calendrier de mise en œuvre', 'implementation_guidance'),
  ('enseignementsup-recherche.gouv.fr', 'https://www.enseignementsup-recherche.gouv.fr/fr/formations-diplomes-etablissements-103236', 'Formations, diplômes et établissements', 'higher_education_index')
) AS s(domain, source_url, source_title, source_kind)
JOIN curriculum_authorities a
  ON a.country_code = 'FR'
 AND a.territory_code = ''
 AND a.official_domain = s.domain
ON CONFLICT (authority_id, source_url) DO UPDATE
SET source_title = EXCLUDED.source_title,
    source_kind = EXCLUDED.source_kind,
    verification_status = 'verified';
