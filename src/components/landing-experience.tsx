"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Palette = "aurora" | "violet" | "ocean" | "rose";
type Backdrop = "night" | "paper" | "nebula";
const palettes: {id:Palette;label:string;accent:string}[] = [
  {id:"aurora",label:"Aurore",accent:"#78dff2"},
  {id:"violet",label:"Améthyste",accent:"#b5a0ff"},
  {id:"ocean",label:"Océan",accent:"#72b8ff"},
  {id:"rose",label:"Rosée",accent:"#f2a6c7"}
];

export default function LandingExperience() {
  const [palette,setPalette] = useState<Palette>("aurora");
  const [backdrop,setBackdrop] = useState<Backdrop>("night");
  const [writer,setWriter] = useState(true);
  const [motion,setMotion] = useState(true);
  const [customOpen,setCustomOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("novexa-appearance") || "{}");
      if (["aurora","violet","ocean","rose"].includes(saved.palette)) setPalette(saved.palette);
      if (["night","paper","nebula"].includes(saved.backdrop)) setBackdrop(saved.backdrop);
      if (typeof saved.writer === "boolean") setWriter(saved.writer);
      if (typeof saved.motion === "boolean") setMotion(saved.motion);
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.dataset.novexaPalette = palette;
    document.documentElement.dataset.novexaBackdrop = backdrop;
    document.documentElement.dataset.novexaWriter = writer ? "on" : "off";
    document.documentElement.dataset.novexaMotion = motion ? "on" : "off";
    try { localStorage.setItem("novexa-appearance",JSON.stringify({palette,backdrop,writer,motion})); } catch {}
  },[palette,backdrop,writer,motion]);

  return (
    <main className="welcome-experience">
      <header className="welcome-nav">
        <Link href="/" className="welcome-wordmark" aria-label="NOVEXA accueil">NOV<span className="welcome-x">X</span>EXA</Link>
        <nav><a href="#personnaliser">Personnaliser</a><a href="#offres">Abonnements</a><Link href="/connexion">Connexion</Link></nav>
        <Link className="welcome-nav-cta" href="/inscription">Commencer <span>↗</span></Link>
      </header>

      <section className="welcome-hero">
        <div className="hero-orbit orbit-one"/><div className="hero-orbit orbit-two"/>
        <div className="hero-copy">
          <p className="welcome-kicker"><span/> APPRENDRE SANS LIMITES. ÉVOLUER À SON RYTHME.</p>
          <h1>Votre savoir.<br/><em>Votre univers.</em></h1>
          <p className="hero-description">Un espace d’apprentissage qui s’adapte à votre manière d’étudier, à vos objectifs et à votre sens de l’esthétique.</p>
          <div className="hero-actions"><Link href="/inscription" className="welcome-primary">Créer mon espace <span>↗</span></Link><Link href="/connexion" className="welcome-secondary">J’ai déjà un compte</Link></div>
          <div className="hero-proof"><span>✦</span> Une expérience personnalisable dès la première visite</div>
        </div>
        <aside className="hero-preview" aria-label="Aperçu de l’espace personnalisable">
          <div className="preview-top"><span className="preview-lights"><i/><i/><i/></span><span>MON ESPACE · APERÇU</span><span>✧</span></div>
          <div className="preview-paper">
            <div className="preview-overline">CARNET D’APPRENTISSAGE</div>
            <div className="preview-title">L’art de<br/><i>comprendre.</i></div>
            <div className="preview-rule"/>
            <p>Un chemin clair, des idées bien organisées et le plaisir de progresser chaque jour.</p>
            <div className="preview-bottom"><span>CHAPITRE 01</span><span>✦ NOVEXA</span></div>
          </div>
          <div className="preview-float float-a">✧ <span>À votre image</span></div><div className="preview-float float-b">01 — 04 <span>Thèmes</span></div>
        </aside>
      </section>

      <section className="custom-section" id="personnaliser">
        <div className="section-intro"><p className="welcome-kicker">VOTRE ESPACE, VOS RÈGLES</p><h2>Composez votre<br/><em>univers NOVEXA.</em></h2><p>Choisissez une ambiance avant même de commencer. Vos préférences sont enregistrées sur cet appareil et pourront être retrouvées dans votre espace.</p></div>
        <div className="custom-panel">
          <div className="custom-panel-head"><div><span className="panel-index">01 / APPARENCE</span><h3>Votre atmosphère</h3></div><button className="custom-toggle" onClick={()=>setCustomOpen(!customOpen)} aria-expanded={customOpen}>{customOpen?"Réduire":"Personnaliser"} <span>{customOpen?"−":"＋"}</span></button></div>
          <div className="palette-row" aria-label="Choisir une palette de couleurs">{palettes.map(p=><button key={p.id} className={"palette-choice "+(palette===p.id?"selected":"")} onClick={()=>setPalette(p.id)} aria-pressed={palette===p.id}><i style={{background:p.accent}}/><span>{p.label}</span>{palette===p.id&&<b>✓</b>}</button>)}</div>
          {customOpen&&<div className="custom-extra">
            <div className="custom-control"><label htmlFor="novexa-backdrop">Fond du site</label><select id="novexa-backdrop" value={backdrop} onChange={e=>setBackdrop(e.target.value as Backdrop)}><option value="night">Nuit profonde</option><option value="paper">Papier ivoire</option><option value="nebula">Nébuleuse</option></select></div>
            <label className="switch-line"><span><b>Style écrivain</b><small>Typographie à empattements et mise en page éditoriale</small></span><input type="checkbox" checked={writer} onChange={e=>setWriter(e.target.checked)}/></label>
            <label className="switch-line"><span><b>Transitions et animations</b><small>Effets doux lors des changements et interactions</small></span><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/></label>
          </div>}
          <div className="custom-preview-line"><span className="live-dot"/> Aperçu en direct <span className="preview-font">{writer?"Élégance éditoriale":"Interface moderne"}</span><span className="preview-motion">{motion?"Animations activées":"Animations réduites"}</span></div>
        </div>
      </section>

      <section className="offer-section" id="offres">
        <div className="offer-heading"><p className="welcome-kicker">DES POSSIBILITÉS QUI GRANDISSENT AVEC VOUS</p><h2>Choisissez votre<br/><em>formule.</em></h2><p>Les tarifs ci-dessous présentent le modèle envisagé. Le paiement en ligne n’est pas encore activé.</p></div>
        <div className="offer-grid">
          <article className="offer-card"><span className="offer-label">POUR DÉCOUVRIR</span><h3>Essentiel</h3><div className="offer-price">0 € <small>/ toujours</small></div><p>Pour découvrir l’environnement et organiser ses premiers apprentissages.</p><ul><li>Création de compte</li><li>Personnalisation de l’interface</li><li>Accès aux fonctionnalités gratuites</li></ul><Link href="/inscription" className="offer-button secondary-offer">Créer un compte gratuit</Link></article>
          <article className="offer-card featured-offer"><span className="offer-label">FORMULE ENVISAGÉE</span><h3>Plus</h3><div className="offer-price">8 € <small>/ mois</small></div><p>Pour accéder à une expérience d’apprentissage enrichie.</p><ul><li>Fonctionnalités avancées prévues</li><li>Outils de révision approfondis</li><li>Personnalisation complète</li><li>Suivi de progression étendu</li></ul><button className="offer-button" disabled title="Le paiement sera activé après intégration du prestataire">Bientôt disponible</button><small className="offer-note">Aucun paiement n’est prélevé actuellement.</small></article>
        </div>
      </section>

      <section className="welcome-bottom"><p>LE SAVOIR N’A PAS DE FRONTIÈRES.</p><h2>La suite de votre parcours<br/><em>commence ici.</em></h2><Link href="/inscription" className="welcome-primary">Entrer dans NOVEXA <span>↗</span></Link></section>
      <footer className="welcome-footer"><Link href="/" className="welcome-wordmark">NOV<span className="welcome-x">X</span>EXA</Link><span>© NOVEXA · Plateforme en développement</span><div><Link href="/connexion">Connexion</Link><Link href="/abonnement">Offres</Link></div></footer>
    </main>
  );
}
