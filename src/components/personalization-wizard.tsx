"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DocumentLibrary from "@/components/document-library";

type Field = { key: string; label: string; help: string; kind: "select" | "toggle"; values?: string[]; initial: string | boolean };
type Group = { title: string; description: string; fields: Field[] };
const sel=(key:string,label:string,help:string,values:string[],initial:string):Field=>({key,label,help,kind:"select",values,initial});
const tog=(key:string,label:string,help:string,initial:boolean):Field=>({key,label,help,kind:"toggle",initial});
const groups:Group[]=[
{title:"Méthode d’apprentissage",description:"Choisissez la façon dont les leçons et exercices seront présentés.",fields:[
sel("learningMethod","Méthode principale","Format de travail privilégié.",["Exemples puis pratique","Explication puis pratique","Pratique guidée","Lecture et synthèse","Projets pratiques","Mixte"],"Exemples puis pratique"),
sel("explanationDepth","Détail des explications","Longueur et profondeur des réponses.",["Très synthétique","Équilibré","Détaillé","Approfondi"],"Détaillé"),
sel("exampleFrequency","Fréquence des exemples","Présence d’exemples concrets.",["À chaque notion","Souvent","Parfois","Sur demande"],"Souvent"),
sel("correctionDetail","Style de correction","Niveau de justification attendu.",["Réponse courte","Réponse justifiée","Étapes détaillées","Correction complète"],"Correction complète"),
sel("practiceType","Exercices favoris","Format d’entraînement prioritaire.",["QCM","Questions rédigées","Problèmes","Études de cas","Projets","Mélange"],"Mélange"),
sel("revisionMethod","Méthode de révision","Outil de mémorisation privilégié.",["Flashcards","Fiches","Quiz","Répétition espacée","Exercices","Mixte"],"Répétition espacée"),
sel("repetitionInterval","Rythme des révisions","Fréquence de rappel des notions.",["Chaque jour","Tous les 2 jours","Chaque semaine","Selon mes résultats"],"Selon mes résultats"),
sel("sessionDuration","Durée d’une séance","Durée indicative d’un bloc de travail.",["15 min","25 min","30 min","45 min","60 min","90 min"],"45 min"),
sel("difficulty","Difficulté de départ","Niveau initial des activités proposées.",["Accessible","Intermédiaire","Avancé","Adaptatif"],"Adaptatif"),
sel("feedbackStyle","Retour après un exercice","Tonalité des commentaires et conseils.",["Encourageant","Direct et précis","Détaillé","Étape par étape"],"Direct et précis")
]},
{title:"Apparence de l’interface",description:"Configurez l’aspect visuel de votre environnement.",fields:[
sel("theme","Thème","Apparence globale.",["Sombre","Clair","Automatique"],"Sombre"),
sel("accent","Couleur d’accent","Couleur des éléments interactifs.",["Violet","Bleu","Menthe","Rose","Ambre","Monochrome"],"Violet"),
sel("background","Arrière-plan","Ambiance générale des pages.",["Minuit","Aurore","Papier","Forêt","Uni","Personnalisé"],"Minuit"),
sel("fontFamily","Typographie","Style des textes.",["Sans serif","Éditorial / écrivain","Serif classique","Lecture facilitée"],"Sans serif"),
sel("fontSize","Taille du texte","Taille de lecture.",["Petite","Normale","Grande","Très grande"],"Normale"),
sel("displayDensity","Densité de l’interface","Quantité d’informations visibles.",["Compacte","Équilibrée","Aérée"],"Équilibrée"),
sel("dashboardLayout","Disposition du tableau de bord","Organisation de l’accueil.",["Cartes","Liste","Mixte","Planning en priorité"],"Cartes"),
sel("cardStyle","Style des cartes","Présentation des contenus.",["Arrondie","Angulaire","Minimaliste","Éditoriale"],"Arrondie"),
tog("animations","Animations et transitions","Activer les mouvements de l’interface.",true),
tog("compactNavigation","Navigation compacte","Réduire l’espace occupé par les menus.",false)
]},
{title:"Organisation et planning",description:"Aidez NOVEXA à préparer un planning adapté.",fields:[
sel("plannerMode","Mode de planification","Organisation des activités.",["Automatique et modifiable","Manuel","Mixte avec suggestions"],"Automatique et modifiable"),
sel("dailyGoal","Objectif quotidien","Temps de travail indicatif par jour.",["30 min","45 min","1 heure","1 h 30","2 heures","À adapter"],"1 heure"),
sel("weeklyGoal","Objectif hebdomadaire","Volume indicatif de travail.",["2–3 heures","4–5 heures","6–8 heures","9–12 heures","À adapter"],"À adapter"),
sel("preferredTime","Moment préféré","Période de la journée à privilégier.",["Tôt le matin","Matinée","Après-midi","Fin d’après-midi","Soirée","Variable"],"Variable"),
sel("planningView","Vue du planning","Format du calendrier.",["Jour","Semaine","Mois","Agenda"],"Semaine"),
sel("weekendStudy","Travail le week-end","Inclure des sessions le week-end.",["Non","Samedi","Dimanche","Samedi et dimanche","Selon les besoins"],"Selon les besoins"),
sel("breakFrequency","Rappels de pause","Fréquence des rappels.",["25 minutes","45 minutes","60 minutes","Jamais","Selon la séance"],"45 minutes"),
sel("taskPrioritization","Priorité des tâches","Choix de la prochaine activité.",["Échéance proche","Matière moins maîtrisée","Objectif du jour","Suggestion automatique"],"Suggestion automatique"),
tog("studyReminders","Rappels d’étude","Recevoir les rappels du planning.",true),
tog("weeklySummary","Bilan hebdomadaire","Afficher un résumé chaque semaine.",true)
]},
{title:"Assistants et professeurs IA",description:"Définissez la manière dont les assistants virtuels vous accompagnent.",fields:[
sel("assistantName","Nom de l’assistant principal","Nom affiché pour votre assistant.",["NOVI","NEXUS","Astra","Orion","Lumen","À personnaliser"],"NOVI"),
sel("assistantTone","Ton de l’assistant","Style de communication.",["Calme et pédagogique","Direct et précis","Dynamique","Formel","Concis"],"Calme et pédagogique"),
sel("assistantVoice","Voix de l’assistant","Mode vocal préféré.",["Aucune voix","Naturelle","Posée","Dynamique"],"Aucune voix"),
sel("assistantLanguage","Langue des assistants","Langue des explications.",["Français","Anglais","Espagnol","Arabe","Multilingue"],"Français"),
sel("answerFormat","Format des réponses","Organisation des contenus.",["Paragraphes","Étapes numérotées","Listes courtes","Tableaux","Adapté à la question"],"Adapté à la question"),
sel("sourcePreference","Sources et références","Références dans les explications.",["Sources officielles si possible","Pour les sujets récents","Sur demande","Quand nécessaire"],"Sources officielles si possible"),
tog("stepByStep","Explications étape par étape","Décomposer les notions complexes.",true),
tog("examplesByDefault","Exemples automatiques","Ajouter un exemple après une notion.",true),
tog("proactiveHelp","Suggestions de révision","Proposer des révisions utiles.",true),
tog("conversationHistory","Historique des échanges IA","Conserver les conversations dans votre compte.",true)
]},
{title:"Accessibilité et confort",description:"Réglez la lecture, les contrastes et les interactions.",fields:[
sel("contrast","Contraste","Différence entre texte et arrière-plan.",["Standard","Renforcé","Très renforcé"],"Renforcé"),
sel("textSpacing","Espacement du texte","Espace entre les lignes.",["Standard","Confortable","Large"],"Confortable"),
tog("dyslexiaFont","Police de lecture adaptée","Activer une police spécifique si disponible.",false),
tog("captions","Sous-titres vidéo","Afficher les sous-titres par défaut.",true),
tog("transcripts","Transcriptions","Afficher les transcriptions lorsqu’elles existent.",true),
tog("screenReaderLabels","Libellés pour lecteur d’écran","Renforcer les informations accessibles.",true),
tog("keyboardNavigation","Navigation au clavier","Optimiser le parcours au clavier.",true),
sel("colorPalette","Palette de couleurs","Choisir les contrastes et états.",["Standard","Rouge-vert","Bleu-jaune","Niveaux de gris"],"Standard"),
tog("soundEffects","Sons d’interface","Activer les sons de confirmation.",false),
tog("focusMode","Mode concentration","Réduire les éléments non essentiels.",false)
]},
{title:"Images, vidéos et documents",description:"Les proportions sont conservées : aucune image ne sera étirée.",fields:[
sel("imageAspectRatio","Format d’image préféré","Format à privilégier pour créer une image.",["16:9","1:1","9:16","4:3","3:2","Format source"],"16:9"),
tog("preserveImageRatio","Conserver les proportions originales","Ne jamais étirer une image.",true),
tog("autoCrop","Recadrage automatique","Autoriser le recadrage automatique.",false),
sel("imageFit","Ajustement des images","Mode d’affichage dans l’interface.",["Contenir sans recadrer","Couvrir avec recadrage","Taille originale"],"Contenir sans recadrer"),
sel("videoAspectRatio","Format vidéo préféré","Format des vidéos pédagogiques.",["16:9","9:16","1:1","Format source"],"16:9"),
sel("videoQuality","Qualité vidéo","Qualité de lecture souhaitée.",["Économie de données","Standard","Haute définition","Automatique"],"Automatique"),
sel("uploadPrivacy","Confidentialité des importations","Vos documents restent privés à votre compte.",["Privé — mon compte uniquement"],"Privé — mon compte uniquement"),
tog("filePreview","Aperçu des documents","Afficher un aperçu lorsqu’il est disponible.",true),
sel("documentSort","Tri des documents","Organisation de la bibliothèque.",["Date d’ajout","Nom du fichier","Type","Matière"],"Date d’ajout"),
tog("mediaAutoplay","Lecture automatique des médias","Démarrer les médias automatiquement.",false)
]}
];
const defaults=Object.fromEntries(groups.flatMap(g=>g.fields.map(f=>[f.key,f.initial]))) as Record<string,string|boolean>;
const initialEducation={countryCode:"FR",educationSystem:"national",level:"",academicYear:"2026-2027",institutionName:"",className:"",subjects:"",specialities:"",primaryGoal:"",careerTarget:"",preferredLanguage:"fr",timezone:"Europe/Paris"};
type Education=typeof initialEducation;

export default function PersonalizationWizard(){
  const router=useRouter();
  const [education,setEducation]=useState<Education>(initialEducation);
  const [settings,setSettings]=useState<Record<string,string|boolean>>(defaults);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [error,setError]=useState("");
  const total=useMemo(()=>groups.reduce((n,g)=>n+g.fields.length,0),[]);
  useEffect(()=>{
    let active=true;
    fetch("/api/profile/preferences",{cache:"no-store"})
      .then(async r=>r.ok?r.json():null)
      .then(data=>{
        if(!active||!data?.preferences)return;
        const p=data.preferences as {education?:Partial<Education>;settings?:Record<string,string|boolean>};
        if(p.education)setEducation(current=>({...current,...p.education}));
        if(p.settings)setSettings(current=>({...current,...p.settings}));
      }).catch(()=>undefined).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[]);
  function updateEducation<K extends keyof Education>(key:K,value:Education[K]){
    setEducation(current=>({...current,[key]:value}));setSaved(false);
  }
  function updateSetting(key:string,value:string|boolean){
    setSettings(current=>({...current,[key]:value}));setSaved(false);
  }
  async function save(){
    setSaving(true);setSaved(false);setError("");
    try{
      const response=await fetch("/api/profile/preferences",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({preferences:{version:1,education,settings},onboardingCompleted:true})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||"Impossible d’enregistrer vos préférences.");
      setSaved(true);
    }catch(cause){setError(cause instanceof Error?cause.message:"Une erreur est survenue.");}
    finally{setSaving(false);}
  }
  return <div className="personalization-content">
    <header className="personalization-heading">
      <p className="auth-eyebrow">CONFIGURATION INITIALE · VOTRE ESPACE</p>
      <h1>Construisons votre<br/><em>environnement idéal.</em></h1>
      <p>Renseignez votre parcours scolaire puis configurez vos préférences. Chaque choix pourra être modifié ensuite.</p>
      <div className="personalization-count"><strong>{total} réglages</strong><span>6 catégories · Profil modifiable à tout moment</span></div>
    </header>
    <section className="personalization-panel">
      <div className="personalization-section-heading"><span>01</span><div><h2>Vos informations scolaires</h2><p>Ces informations servent à sélectionner les programmes et matières adaptés.</p></div></div>
      <div className="personalization-form-grid">
        <label>Pays<select value={education.countryCode} onChange={e=>updateEducation("countryCode",e.target.value)}><option value="FR">France</option><option value="DZ">Algérie</option><option value="BE">Belgique</option><option value="CH">Suisse</option><option value="CA">Canada</option><option value="MA">Maroc</option><option value="TN">Tunisie</option><option value="GB">Royaume-Uni</option><option value="US">États-Unis</option><option value="ES">Espagne</option><option value="DE">Allemagne</option><option value="OTHER">Autre pays</option></select></label>
        <label>Système éducatif<select value={education.educationSystem} onChange={e=>updateEducation("educationSystem",e.target.value)}><option value="national">Programme national</option><option value="international">Programme international</option><option value="ib">Baccalauréat international</option><option value="cambridge">Cambridge</option><option value="other">Autre</option></select></label>
        <label>Niveau d’études *<select required value={education.level} onChange={e=>updateEducation("level",e.target.value)}><option value="">Sélectionner</option><option value="primary">Primaire</option><option value="middle">Collège</option><option value="secondary">Lycée</option><option value="undergraduate">Licence / Bachelor</option><option value="graduate">Master</option><option value="doctorate">Doctorat</option><option value="continuing">Formation continue</option><option value="other">Autre</option></select></label>
        <label>Année scolaire / universitaire<input value={education.academicYear} onChange={e=>updateEducation("academicYear",e.target.value)} maxLength={20} placeholder="2026-2027"/></label>
        <label>Établissement<input value={education.institutionName} onChange={e=>updateEducation("institutionName",e.target.value)} maxLength={160} placeholder="Nom de votre établissement"/></label>
        <label>Classe, année ou groupe<input value={education.className} onChange={e=>updateEducation("className",e.target.value)} maxLength={80} placeholder="Ex. Terminale, L2…"/></label>
        <label>Langue d’apprentissage<select value={education.preferredLanguage} onChange={e=>updateEducation("preferredLanguage",e.target.value)}><option value="fr">Français</option><option value="en">Anglais</option><option value="es">Espagnol</option><option value="ar">Arabe</option><option value="de">Allemand</option><option value="multi">Multilingue</option></select></label>
        <label>Fuseau horaire<select value={education.timezone} onChange={e=>updateEducation("timezone",e.target.value)}><option>Europe/Paris</option><option>Africa/Algiers</option><option>Europe/Brussels</option><option>Europe/Zurich</option><option>America/Toronto</option><option>America/New_York</option><option>UTC</option></select></label>
        <label>Matières étudiées<textarea value={education.subjects} onChange={e=>updateEducation("subjects",e.target.value)} maxLength={1200} placeholder="Séparez les matières par des virgules."/></label>
        <label>Spécialités et options<textarea value={education.specialities} onChange={e=>updateEducation("specialities",e.target.value)} maxLength={1200} placeholder="Spécialités, options, parcours…"/></label>
        <label>Objectif principal<select value={education.primaryGoal} onChange={e=>updateEducation("primaryGoal",e.target.value)}><option value="">Choisir</option><option>Réussir mon année</option><option>Préparer un examen</option><option>Améliorer mes résultats</option><option>Apprendre une nouvelle matière</option><option>Préparer une orientation</option><option>Développer des compétences</option></select></label>
        <label>Projet d’études ou métier<input value={education.careerTarget} onChange={e=>updateEducation("careerTarget",e.target.value)} maxLength={160} placeholder="Facultatif"/></label>
      </div>
    </section>
    {groups.map((group,index)=><section className="personalization-panel" key={group.title}>
      <div className="personalization-section-heading"><span>{String(index+2).padStart(2,"0")}</span><div><h2>{group.title}</h2><p>{group.description}</p></div></div>
      <div className="personalization-options-grid">{group.fields.map(field=><label className="personalization-option" key={field.key}>
        <span><strong>{field.label}</strong><small>{field.help}</small></span>
        {field.kind==="select"
          ?<select value={String(settings[field.key]??field.initial)} onChange={e=>updateSetting(field.key,e.target.value)}>{field.values?.map(v=><option key={v}>{v}</option>)}</select>
          :<input type="checkbox" checked={Boolean(settings[field.key]??field.initial)} onChange={e=>updateSetting(field.key,e.target.checked)}/>}
      </label>)}</div>
    </section>)}
    <section className="personalization-panel">
      <div className="personalization-section-heading"><span>08</span><div><h2>Importer vos documents</h2><p>Ajoutez vos cours, fiches et programmes. Les documents importés restent privés à votre compte.</p></div></div>
      <DocumentLibrary compact/>
    </section>
    <div className="personalization-save-bar"><div><strong>Votre espace est prêt à être configuré.</strong><small>Vous pourrez modifier ces choix dans les paramètres.</small></div>
      <button className="auth-submit" onClick={save} disabled={saving||loading||!education.level}>{saving?"Enregistrement…":"Enregistrer ma personnalisation"} <span>↗</span></button>
    </div>
    {loading&&<p className="personalization-status">Chargement de vos préférences…</p>}
    {error&&<p className="auth-error" role="alert">{error}</p>}
    {saved&&<div className="personalization-complete" role="status"><div><strong>Personnalisation enregistrée.</strong><p>Vos choix sont sauvegardés sur votre compte.</p></div><button onClick={()=>router.push("/app")}>Accéder à mon espace →</button></div>}
  </div>;
}