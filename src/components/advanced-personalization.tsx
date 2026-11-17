"use client";

import { useEffect, useMemo, useState } from "react";

type Choice = { key: string; label: string; help: string; values?: string[]; initial: string | boolean };
type Category = { title: string; description: string; fields: Choice[] };
const select = (key: string, label: string, help: string, values: string[], initial: string): Choice => ({ key, label, help, values, initial });
const toggle = (key: string, label: string, help: string, initial: boolean): Choice => ({ key, label, help, initial });

const categories: Category[] = [
  { title: "Lecture et présentation", description: "Ajuste la manière dont les contenus sont mis en page.", fields: [
    select("noteLayout","Mise en page des notes","Choisis la structure de tes notes.",["Carnet","Plan structuré","Fiche de révision","Document libre"],"Carnet"),
    select("headingStyle","Style des titres","Présentation des titres et sous-titres.",["Classique","Éditorial","Numéroté","Minimaliste"],"Éditorial"),
    select("lineLength","Largeur des lignes","Confort de lecture des paragraphes.",["Courte","Moyenne","Large","Automatique"],"Moyenne"),
    select("paragraphSpacing","Espacement des paragraphes","Aère les textes longs.",["Serré","Normal","Aéré"],"Aéré"),
    select("pageMargins","Marges des documents","Espace autour des documents.",["Étroit","Normal","Large"],"Normal"),
    select("iconStyle","Style des icônes","Aspect des icônes de navigation.",["Linéaire","Plein","Discret","Sans icônes"],"Linéaire"),
    select("progressDisplay","Affichage de progression","Comment visualiser l’avancement.",["Pourcentage","Barre","Étapes","Combiné"],"Combiné"),
    select("sidebarPosition","Position du menu","Emplacement de la navigation principale.",["À gauche","En haut","Réduit"],"À gauche"),
    select("dateFormat","Format des dates","Affichage des dates dans ton espace.",["JJ/MM/AAAA","AAAA-MM-JJ","Texte long"],"JJ/MM/AAAA"),
    select("numberFormat","Format des nombres","Séparateur et présentation des nombres.",["Français (1 234,5)","Anglais (1,234.5)","Automatique"],"Français (1 234,5)")
  ]},
  { title: "Méthodes de travail", description: "Définis les formats d’entraînement que NOVEXA doit favoriser.", fields: [
    select("memoryMode","Type de mémorisation","Méthode de rappel à privilégier.",["Rappel actif","Répétition espacée","Association d’idées","Alternance"],"Rappel actif"),
    select("questionOrder","Ordre des questions","Ordre de présentation des exercices.",["Progressif","Aléatoire","Du plus difficile au plus simple","Adaptatif"],"Progressif"),
    select("hintPolicy","Gestion des indices","Quand afficher des aides.",["Après une tentative","Sur demande","Avant la correction","Jamais automatiquement"],"Après une tentative"),
    select("challengeLevel","Défis supplémentaires","Niveau des défis proposés.",["Aucun","Occasionnel","Régulier","Adapté à mes résultats"],"Occasionnel"),
    select("masteryThreshold","Seuil de maîtrise","Résultat indicatif avant de considérer une notion maîtrisée.",["70 %","80 %","85 %","90 %"],"80 %"),
    toggle("adaptivePacing","Rythme adaptatif","Adapter la progression aux résultats.",true),
    select("vocabularyMethod","Apprentissage du vocabulaire","Format pour les mots et définitions.",["Cartes mémoire","Listes thématiques","Exemples en contexte","Dictées"],"Cartes mémoire"),
    select("oralPractice","Pratique orale","Type d’activité orale préféré.",["Questions-réponses","Exposé guidé","Prononciation","Aucune"],"Questions-réponses"),
    select("writingPractice","Pratique écrite","Type de production écrite.",["Réponses courtes","Paragraphes","Dissertations","Exercices guidés"],"Réponses courtes"),
    select("reviewPriorities","Priorité des révisions","Notions à revoir en premier.",["Notions oubliées","Notions difficiles","Échéances proches","Mélange équilibré"],"Notions oubliées")
  ]},
  { title: "Planning et temps", description: "Règle les détails de ton calendrier de travail.", fields: [
    select("planningStartDay","Début de la semaine","Premier jour affiché dans le planning.",["Lundi","Dimanche","Samedi"],"Lundi"),
    select("dueDateAlerts","Alertes d’échéance","Moment des rappels avant une échéance.",["La veille","Deux jours avant","Une semaine avant","Personnalisé","Désactivé"],"La veille"),
    select("taskBatching","Regroupement des tâches","Comment organiser les tâches proches.",["Par matière","Par durée","Par priorité","Sans regroupement"],"Par matière"),
    select("calendarStartHour","Début de journée affiché","Heure de départ du calendrier.",["06:00","07:00","08:00","09:00","10:00"],"07:00"),
    select("calendarEndHour","Fin de journée affichée","Heure de fin du calendrier.",["17:00","18:00","19:00","20:00","22:00"],"20:00"),
    select("studyDays","Jours de travail privilégiés","Jours à proposer dans le planning.",["Lundi au vendredi","Tous les jours","Semaine et samedi","Jours personnalisés"],"Lundi au vendredi"),
    select("focusTimer","Minuteur de concentration","Durée indicative d’un cycle.",["15 min","25 min","40 min","50 min","Sans minuteur"],"25 min"),
    select("planningFlexibility","Souplesse du planning","Marge laissée aux changements.",["Fixe","Souple","Très flexible"],"Souple"),
    select("missedSessionPolicy","Séance manquée","Que faire lorsqu’une séance est reportée.",["Replacer automatiquement","Me demander","Ignorer la séance","Répartir sur la semaine"],"Me demander"),
    toggle("examCountdown","Compte à rebours des examens","Afficher le temps restant avant les examens.",true)
  ]},
  { title: "Comportement de l’assistant IA", description: "Personnalise les réponses et les initiatives de ton assistant.", fields: [
    select("assistantInitiative","Prise d’initiative","Fréquence des propositions spontanées.",["Uniquement si je demande","Suggestions occasionnelles","Suggestions régulières"],"Suggestions occasionnelles"),
    select("responseLength","Longueur des réponses","Taille habituelle des explications.",["Très courte","Courte","Moyenne","Détaillée","Selon le sujet"],"Selon le sujet"),
    select("correctionTone","Tonalité des corrections","Comment présenter les erreurs et pistes de progrès.",["Neutre","Encourageante","Directe","Très détaillée"],"Directe"),
    select("ambiguityHandling","Question ambiguë","Comportement lorsque la demande manque de précision.",["Poser une question","Expliquer les hypothèses","Proposer plusieurs interprétations"],"Poser une question"),
    select("webCitationStyle","Présentation des sources","Façon d’afficher les références.",["Liens en fin de réponse","Sources près des affirmations","Bibliographie courte","Selon le sujet"],"Sources près des affirmations"),
    select("codeStyle","Présentation du code","Format des exemples informatiques.",["Avec commentaires","Minimal","Étape par étape","Exemple puis exercice"],"Avec commentaires"),
    toggle("languageCorrection","Correction de langue","Signaler les erreurs de langue dans les textes.",false),
    toggle("multilingualSupport","Aide multilingue","Autoriser les explications dans plusieurs langues.",true),
    toggle("voiceInteraction","Interaction vocale","Afficher les commandes vocales lorsqu’elles seront disponibles.",false),
    toggle("sourceReminders","Rappel de vérification","Signaler lorsqu’une information doit être vérifiée auprès d’une source officielle.",true)
  ]},
  { title: "Documents et médias", description: "Configure le rangement et la lecture de tes ressources.", fields: [
    toggle("resourcePreview","Aperçu des ressources","Afficher un aperçu avant ouverture.",true),
    select("documentNaming","Nom des documents","Règle de nommage des nouveaux documents.",["Nom d’origine","Date + nom","Matière + nom","Personnalisé"],"Nom d’origine"),
    toggle("autoSaveDrafts","Sauvegarde automatique","Sauvegarder les brouillons lorsque la fonction sera disponible.",true),
    select("backupReminder","Rappel de sauvegarde","Fréquence des rappels de sauvegarde.",["Chaque semaine","Chaque mois","Avant une échéance","Désactivé"],"Chaque semaine"),
    select("exportFormat","Format d’exportation","Format à privilégier pour les documents.",["PDF","DOCX","TXT","Format au choix"],"PDF"),
    select("printableLayout","Mise en page imprimable","Présentation des documents destinés à l’impression.",["A4 classique","Fiche compacte","Éditoriale","Sans mise en page"],"A4 classique"),
    select("videoPlaybackSpeed","Vitesse vidéo par défaut","Vitesse de lecture préférée.",["0,75×","1×","1,25×","1,5×","2×"],"1×"),
    select("transcriptDisplay","Affichage des transcriptions","Où afficher les transcriptions vidéo.",["Sous la vidéo","À côté","Masquées par défaut"],"Sous la vidéo"),
    select("readingMode","Mode de lecture","Présentation des contenus longs.",["Page classique","Lecture sans distraction","Plein écran"],"Lecture sans distraction"),
    toggle("offlinePreparation","Préparation hors ligne","Prévoir le téléchargement hors ligne lorsque ce service sera disponible.",false)
  ]}
];

const defaults = Object.fromEntries(categories.flatMap(category => category.fields.map(field => [field.key, field.initial]))) as Record<string, string | boolean>;

export default function AdvancedPersonalization() {
  const [values, setValues] = useState<Record<string, string | boolean>>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const total = useMemo(() => categories.reduce((sum, category) => sum + category.fields.length, 0), []);

  useEffect(() => {
    let active = true;
    try {
      const local = JSON.parse(localStorage.getItem("novexa-advanced-preferences") || "{}");
      if (local && typeof local === "object") setValues(current => ({ ...current, ...local }));
    } catch {}
    fetch("/api/profile/advanced-preferences", { cache: "no-store" })
      .then(async response => response.ok ? response.json() : null)
      .then(payload => { if (active && payload?.advancedSettings) setValues(current => ({ ...current, ...payload.advancedSettings })); })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  function update(key: string, value: string | boolean) {
    setValues(current => ({ ...current, [key]: value }));
    setMessage("");
  }

  async function save() {
    setSaving(true); setError(""); setMessage("");
    try {
      localStorage.setItem("novexa-advanced-preferences", JSON.stringify(values));
      const response = await fetch("/api/profile/advanced-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ advancedSettings: values })
      });
      await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage("Les 50 choix sont enregistrés sur cet appareil. La synchronisation du compte sera disponible lorsque la base NOVEXA sera connectée.");
      } else {
        setMessage("Tes 50 choix avancés sont enregistrés dans ton compte.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible d’enregistrer ces réglages.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="advanced-personalization">
    <div className="advanced-count"><strong>{total} choix supplémentaires</strong><span>5 catégories distinctes · Modifiables à tout moment</span></div>
    {categories.map((category, index) => <section className="personalization-panel" key={category.title}>
      <div className="personalization-section-heading"><span>{String(index + 1).padStart(2, "0")}</span><div><h2>{category.title}</h2><p>{category.description}</p></div></div>
      <div className="personalization-options-grid">
        {category.fields.map(field => <label className="personalization-option" key={field.key}>
          <span><strong>{field.label}</strong><small>{field.help}</small></span>
          {field.values
            ? <select value={String(values[field.key] ?? field.initial)} onChange={event => update(field.key, event.target.value)}>{field.values.map(value => <option key={value}>{value}</option>)}</select>
            : <input type="checkbox" checked={Boolean(values[field.key] ?? field.initial)} onChange={event => update(field.key, event.target.checked)}/>}
        </label>)}
      </div>
    </section>)}
    {loading && <p className="personalization-status">Chargement des préférences enregistrées…</p>}
    {error && <p className="auth-error" role="alert">{error}</p>}
    {message && <p className="auth-success" role="status">{message}</p>}
    <button className="auth-submit" onClick={save} disabled={loading || saving}>{saving ? "Enregistrement…" : "Enregistrer mes 50 choix"} <span>↗</span></button>
  </div>;
}
