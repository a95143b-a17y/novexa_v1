"use client";

import { useMemo, useState } from "react";
import type { OfficialSource, FranceSourceKind } from "@/data/curricula/france";

const kindLabels: Record<FranceSourceKind, string> = {
  normative_publication: "Textes officiels",
  national_curriculum_index: "Programmes par discipline",
  implementation_guidance: "Calendrier et accompagnement",
  higher_education_index: "Enseignement supérieur"
};

const kindDescriptions: Record<FranceSourceKind, string> = {
  normative_publication: "Point de contrôle prioritaire pour retrouver les textes adoptés et leurs dates d’application.",
  national_curriculum_index: "Portail de découverte permettant de repérer les programmes par niveau et discipline.",
  implementation_guidance: "Ressources et informations utiles pour suivre le calendrier de mise en œuvre.",
  higher_education_index: "Point d’entrée pour cartographier les diplômes et formations, à compléter par les accréditations et maquettes des établissements."
};

export default function FranceSourceExplorer({ sources }: { sources: readonly OfficialSource[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("fr");
    return sources.filter(source => {
      const matchesKind = kind === "all" || source.kind === kind;
      const haystack = [source.title, source.authority, source.intendedUse].join(" ").toLocaleLowerCase("fr");
      return matchesKind && (!normalized || haystack.includes(normalized));
    });
  }, [sources, query, kind]);

  return (
    <>
      <div className="catalog-filter-panel">
        <div className="catalog-search-field">
          <label htmlFor="catalog-source-search">Rechercher une matière, une autorité ou un sujet</label>
          <input id="catalog-source-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ex. NSI, SES, collège…" />
        </div>
        <div className="catalog-filter-field">
          <label htmlFor="catalog-source-kind">Type de référence</label>
          <select id="catalog-source-kind" value={kind} onChange={event => setKind(event.target.value)}>
            <option value="all">Toutes les références</option>
            {Object.entries(kindLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <p className="catalog-filter-count" aria-live="polite">{filtered.length} référence(s) affichée(s) sur {sources.length}</p>
      </div>
      <div className="catalog-source-list">
        {filtered.map((source,index) => (
          <article className="catalog-source" key={source.id}>
            <div className="catalog-source-top">
              <span className="catalog-source-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="catalog-source-kind">{kindLabels[source.kind]}</span>
              <span className="catalog-source-status">Vérification du document requise</span>
            </div>
            <h3>{source.title}</h3>
            <p className="catalog-authority">{source.authority}</p>
            <p className="catalog-description">{source.intendedUse}</p>
            <p className="catalog-kind-description">{kindDescriptions[source.kind]}</p>
            <a className="catalog-source-link" href={source.url} target="_blank" rel="noreferrer">
              Consulter la source officielle <span aria-hidden="true">↗</span>
            </a>
          </article>
        ))}
        {filtered.length === 0 && <div className="catalog-empty"><h3>Aucune référence trouvée</h3><p>Essaie un autre mot-clé ou sélectionne un autre type de source.</p></div>}
      </div>
    </>
  );
}
