"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useNovexaAppearance, type NovexaAppearance } from "@/components/appearance-provider";
import AppearanceStudio from "@/components/appearance-studio";
import NovaRobot from "@/components/nova-robot";
import NovexaLogo from "@/components/novexa-logo";
import { readableTextColor } from "@/lib/appearance-options";
import styles from "./onboarding-guide.module.css";

const wallpapers = [
  { id: "aurora", name: "Aurore boréale", color: "#101a36", preview: "linear-gradient(135deg,#14274b,#66549b 58%,#79c6d2)" },
  { id: "paper", name: "Papier ivoire", color: "#eee7d8", preview: "linear-gradient(135deg,#f4eddf,#d5c6aa)" },
  { id: "midnight", name: "Minuit", color: "#090f20", preview: "linear-gradient(135deg,#080d1a,#1c3455)" },
  { id: "forest", name: "Forêt calme", color: "#152b28", preview: "linear-gradient(135deg,#152b28,#42695a)" },
  { id: "lavender", name: "Lavande", color: "#29213d", preview: "linear-gradient(135deg,#29213d,#7d6caa)" },
  { id: "ocean", name: "Océan", color: "#112b40", preview: "linear-gradient(135deg,#112b40,#287b91)" },
  { id: "terracotta", name: "Terracotta", color: "#432921", preview: "linear-gradient(135deg,#432921,#c27c5c)" },
  { id: "graphite", name: "Graphite", color: "#22252c", preview: "linear-gradient(135deg,#22252c,#656b74)" }
] as const;

const accents: { id: NovexaAppearance["accent"]; label: string; color: string }[] = [
  { id: "violet", label: "Violet", color: "#9278e6" },
  { id: "blue", label: "Bleu", color: "#5b9fe4" },
  { id: "mint", label: "Menthe", color: "#51b99e" },
  { id: "rose", label: "Rose", color: "#d783ad" }
];

export default function OnboardingGuide() {
  const { appearance, saveAppearance, previewAppearance } = useNovexaAppearance();
  const [draft, setDraft] = useState<NovexaAppearance>(appearance);
  const [step, setStep] = useState(0);
  const [assistantName, setAssistantName] = useState("NOVA");
  const [assistantTone, setAssistantTone] = useState("Calme et pédagogique");
  const [assistantLanguage, setAssistantLanguage] = useState("Français");
  const [status, setStatus] = useState("");
  const stepNames = useMemo(() => ["Bienvenue", "Apparence", "Fond d’écran", "Votre guide", "C’est prêt"], []);

  useEffect(() => { setDraft(appearance); }, [appearance]);
  useEffect(() => { previewAppearance(draft); }, [draft, previewAppearance]);

  function update<K extends keyof NovexaAppearance>(key: K, value: NovexaAppearance[K]) {
    setDraft(current => ({ ...current, [key]: value }));
  }

  function selectWallpaper(wallpaper: typeof wallpapers[number]) {
    setDraft(current => ({
      ...current,
      background: wallpaper.id === "paper" || wallpaper.id === "midnight" || wallpaper.id === "forest" ? wallpaper.id : "aurora",
      theme: readableTextColor(wallpaper.color) === "#18202B" ? "light" : "dark",
      backgroundColor: wallpaper.color,
      backgroundGradient: undefined,
      customImage: undefined
    }));
  }

  function importWallpaper(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setStatus("Choisis une image JPG, PNG ou WebP.");
      event.target.value = "";
      return;
    }
    if (file.size > 1_200_000) {
      setStatus("L’image doit faire 1,2 Mo maximum pour être conservée sur cet appareil.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string" || !reader.result.startsWith("data:image/")) {
        setStatus("Impossible de lire cette image.");
        return;
      }
      setDraft(current => ({ ...current, background: "custom", backgroundGradient: undefined, customImage: reader.result as string }));
      setStatus("Image ajoutée à ton aperçu.");
    };
    reader.onerror = () => setStatus("La lecture de l’image a échoué.");
    reader.readAsDataURL(file);
  }

  async function finishGuide() {
    setStatus("Enregistrement de tes choix…");
    try {
      localStorage.setItem("novexa-guide-preferences", JSON.stringify({
        assistantName: assistantName.trim() || "NOVA",
        assistantTone,
        assistantLanguage
      }));
    } catch {
      setStatus("Le navigateur ne permet pas de conserver tous les choix.");
      return;
    }
    const synced = await saveAppearance(draft);
    setStatus(synced
      ? "Tes choix d’apparence sont synchronisés avec ton compte."
      : "Tes choix sont conservés sur cet appareil. Ils seront synchronisés après connexion si la base NOVEXA est activée.");
    setStep(4);
  }

  const previewStyle = draft.customImage
    ? { backgroundImage: `linear-gradient(120deg,rgba(7,12,25,.35),rgba(7,12,25,.12)),url("${draft.customImage}")` }
    : { background: draft.backgroundColor || wallpapers[0].preview };

  return (
    <main className={styles.shell} style={previewStyle}>
      <header className={styles.topbar}>
        <NovexaLogo href="/" width={178} height={59} className={styles.logoImage} />
        <nav><Link href="/decouvrir">Découvrir</Link><Link href="/abonnement">Abonnements</Link><Link href="/connexion?next=%2Fpersonnalisation">Connexion</Link></nav>
      </header>

      <div className={styles.wrap}>
        <div className={styles.progress}><span style={{ width: `${((step + 1) / 5) * 100}%` }} /></div>
        <div className={styles.progressMeta}><span>GUIDE DE PREMIÈRE VISITE</span><span>{step + 1} / 5 · {stepNames[step]}</span></div>

        <section className={styles.card}>
          <div className={styles.robotRow}>
            <NovaRobot name="NOVA" size="compact" />
            <div><span className={styles.robotLabel}>NOVA · TON GUIDE NOVEXA</span><p className={styles.robotSpeech}>{step === 0
              ? "Bonjour ! Bienvenue sur NOVEXA. Je suis NOVA, ton guide. Je vais t’accompagner pour créer un espace de travail qui te ressemble, étape par étape."
              : step === 4
                ? "Parfait ! Ton univers est prêt. La prochaine étape sera de créer ton compte pour retrouver ton espace et terminer les réglages."
                : "On avance tranquillement. Tu peux modifier tes choix plus tard dans les paramètres de ton espace."}</p></div>
          </div>

          {step === 0 && <div className={styles.stepContent}>
            <p className={styles.eyebrow}>UN ESPACE QUI TE RESSEMBLE</p>
            <h1>Bonjour, bienvenue<br/><em>dans NOVEXA.</em></h1>
            <p className={styles.lead}>Je vais te guider dans quelques choix : 50 typographies, 50 teintes, 20 dégradés et ton espace NOVEXA. Tu verras chaque modification en direct.</p>
            <div className={styles.infoLine}><span>01</span> Choisir l’apparence <span>02</span> Sélectionner un fond <span>03</span> Personnaliser NOVA</div>
          </div>}

          {step === 1 && <div className={styles.stepContent}>
            <p className={styles.eyebrow}>ÉTAPE 1 · APPARENCE</p>
            <h1>Choisis ton<br/><em>style visuel.</em></h1>
            <div className={styles.optionBlock}>
              <h2>Thème général</h2>
              <div className={styles.choiceRow}>
                <button type="button" className={draft.theme === "dark" ? styles.selected : ""} onClick={() => update("theme", "dark")}><span className={styles.themeDark}/>Sombre</button>
                <button type="button" className={draft.theme === "light" ? styles.selected : ""} onClick={() => update("theme", "light")}><span className={styles.themeLight}/>Clair</button>
              </div>
            </div>
            <div className={styles.optionBlock}>
              <h2>Couleur principale</h2>
              <div className={styles.accentRow}>{accents.map(item => <button key={item.id} type="button" aria-label={item.label} aria-pressed={draft.accent === item.id} className={draft.accent === item.id ? styles.accentSelected : ""} style={{ background: item.color }} onClick={() => update("accent", item.id)} />)}</div>
            </div>
            <AppearanceStudio value={draft} onChange={setDraft} sections="typography" />
            <label className={styles.switch}><span><b>Animations et transitions</b><small>Effets discrets lors de la navigation</small></span><input type="checkbox" checked={draft.motion} onChange={e => update("motion", e.target.checked)}/></label>
          </div>}

          {step === 2 && <div className={styles.stepContent}>
            <p className={styles.eyebrow}>ÉTAPE 2 · ARRIÈRE-PLAN</p>
            <h1>Choisis ton<br/><em>fond d’écran.</em></h1>
            <p className={styles.lead}>Choisis parmi 50 couleurs, 20 dégradés, une teinte libre ou une image importée. L’aperçu évolue à chaque clic.</p>
            <div className={styles.wallpaperGrid}>{wallpapers.map(item => <button key={item.id} type="button" className={draft.backgroundColor === item.color && !draft.customImage ? styles.wallpaperSelected : styles.wallpaper} onClick={() => selectWallpaper(item)}><span style={{ background: item.preview }}/><b>{item.name}</b></button>)}</div>
            <AppearanceStudio value={draft} onChange={setDraft} sections="background" />
            <div className={styles.colorUploadRow}>
              <label className={styles.colorPicker}>Ma couleur personnalisée <input type="color" value={draft.backgroundColor || "#101a36"} onChange={e => setDraft(current => ({ ...current, theme: readableTextColor(e.target.value) === "#18202B" ? "light" : "dark", background: "aurora", backgroundColor: e.target.value, customImage: undefined }))}/></label>
              <label className={styles.uploadButton}>Importer une image <input type="file" accept="image/png,image/jpeg,image/webp" onChange={importWallpaper}/></label>
            </div>
            {draft.customImage && <p className={styles.localOnly}>Image importée : conservée sur cet appareil uniquement, jusqu’à synchronisation d’un service de stockage sécurisé.</p>}
          </div>}

          {step === 3 && <div className={styles.stepContent}>
            <p className={styles.eyebrow}>ÉTAPE 3 · TON ASSISTANT</p>
            <h1>Fais connaissance<br/><em>avec ton guide.</em></h1>
            <label className={styles.formField}>Nom de ton assistant<input value={assistantName} onChange={e => setAssistantName(e.target.value)} maxLength={24} placeholder="NOVA"/></label>
            <label className={styles.formField}>Sa manière de te répondre<select value={assistantTone} onChange={e => setAssistantTone(e.target.value)}><option>Calme et pédagogique</option><option>Direct et précis</option><option>Dynamique et motivant</option><option>Concis et méthodique</option><option>Formel et détaillé</option></select></label>
            <label className={styles.formField}>Langue de ton assistant<select value={assistantLanguage} onChange={e => setAssistantLanguage(e.target.value)}><option>Français</option><option>English</option><option>Español</option><option>العربية</option><option>Multilingue</option></select></label>
            <p className={styles.localOnly}>Ces préférences seront reprises dans la configuration avancée après la création de ton compte.</p>
          </div>}

          {step === 4 && <div className={styles.stepContent}>
            <p className={styles.eyebrow}>GUIDE TERMINÉ</p>
            <h1>Ton espace.<br/><em>À ton image.</em></h1>
            <p className={styles.lead}>Tes choix visuels sont enregistrés sur cet appareil. Crée ton compte pour retrouver ton profil et passer aux 110 réglages de personnalisation.</p>
            <div className={styles.finalActions}><Link href="/inscription?next=%2Fpersonnalisation" className={styles.primary}>Créer mon compte <span>↗</span></Link><Link href="/connexion?next=%2Fpersonnalisation" className={styles.secondary}>J’ai déjà un compte</Link></div>
            <Link href="/abonnement" className={styles.pricingLink}>Consulter les trois formules et leurs différences →</Link>
          </div>}

          {status && <p className={styles.status} role="status">{status}</p>}
          {step < 4 && <div className={styles.actions}>
            {step > 0 ? <button type="button" className={styles.back} onClick={() => setStep(step - 1)}>← Retour</button> : <span/>}
            <button type="button" className={styles.primary} onClick={step === 3 ? finishGuide : () => setStep(step + 1)}>{step === 3 ? "Terminer la configuration" : step === 0 ? "Commencer le guide" : "Continuer"} <span>↗</span></button>
          </div>}
        </section>
        <p className={styles.footerNote}>NOVEXA · Apprendre avec méthode · <Link href="/decouvrir">Découvrir la plateforme</Link></p>
      </div>
    </main>
  );
}
