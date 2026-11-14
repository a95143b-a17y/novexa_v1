"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "sign-in" | "sign-up"; nextPath?: string };
type Theme = "light" | "dark";
type Accent = "violet" | "blue" | "mint" | "rose";
type BackgroundChoice = "aurora" | "paper" | "midnight" | "forest";
type AccountType = "student" | "university" | "teacher" | "institution" | "parent";
const backgroundChoices: {id:BackgroundChoice;label:string;description:string}[] = [
  {id:"aurora",label:"Aurore",description:"Dégradé violet et bleu"},
  {id:"paper",label:"Papier",description:"Texture claire et douce"},
  {id:"midnight",label:"Minuit",description:"Bleu profond et discret"},
  {id:"forest",label:"Forêt",description:"Vert et naturel"}
];

const providers = [
  {id:"google",label:"Continuer avec Google",symbol:"G"},
  {id:"microsoft",label:"Continuer avec Microsoft",symbol:"▦"},
  {id:"apple",label:"Continuer avec Apple",symbol:"●"}
] as const;
const accents: {id:Accent;label:string;color:string}[] = [
  {id:"violet",label:"Violet",color:"#8975dc"},
  {id:"blue",label:"Bleu",color:"#4b91d1"},
  {id:"mint",label:"Menthe",color:"#48a994"},
  {id:"rose",label:"Rose",color:"#d77eaa"}
];

export default function AuthForm({ mode, nextPath = "/app" }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [step,setStep] = useState(1);
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [accountType,setAccountType] = useState<AccountType>("student");
  const [theme,setTheme] = useState<Theme>("light");
  const [accent,setAccent] = useState<Accent>("violet");
  const [writer,setWriter] = useState(true);
  const [motion,setMotion] = useState(true);
  const [background,setBackground] = useState<BackgroundChoice | "custom">("aurora");
  const [customImage,setCustomImage] = useState("");
  const [imageError,setImageError] = useState("");
  const uploadInput=useRef<HTMLInputElement>(null);
  const cameraInput=useRef<HTMLInputElement>(null);
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [socialBusy,setSocialBusy] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("novexa-appearance") || "{}");
      if(saved.backdrop==="night" || saved.theme==="dark") setTheme("dark");
      if(saved.backdrop==="paper" || saved.theme==="light") setTheme("light");
      if(["violet","blue","mint","rose"].includes(saved.accent)) setAccent(saved.accent);
      if(typeof saved.writer==="boolean") setWriter(saved.writer);
      if(typeof saved.motion==="boolean") setMotion(saved.motion);
      if(["aurora","paper","midnight","forest"].includes(saved.background)) setBackground(saved.background);
      if(typeof saved.customImage==="string" && saved.customImage.startsWith("data:image/")) { setCustomImage(saved.customImage); setBackground("custom"); }
    } catch {}
  },[]);

  function savePreferences() {
    const prefs={theme,accent,writer,motion,background,customImage,backdrop:theme==="dark"?"night":"paper"};
    try { localStorage.setItem("novexa-appearance",JSON.stringify(prefs)); } catch {}
    document.documentElement.dataset.novexaTheme=theme;
    document.documentElement.dataset.novexaPalette=accent==="blue"?"ocean":accent==="mint"?"aurora":accent==="rose"?"rose":"violet";
    document.documentElement.dataset.novexaWriter=writer?"on":"off";
    document.documentElement.dataset.novexaMotion=motion?"on":"off";
  }

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file=event.target.files?.[0];
    if(!file) return;
    setImageError("");
    if(!file.type.startsWith("image/")) { setImageError("Choisis un fichier image."); return; }
    if(file.size>15*1024*1024) { setImageError("Image trop volumineuse : 15 Mo maximum."); return; }
    try {
      const source=await new Promise<HTMLImageElement>((resolve,reject)=>{
        const url=URL.createObjectURL(file); const img=new Image();
        img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
        img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Image illisible."));};
        img.src=url;
      });
      const scale=Math.min(1,1920/Math.max(source.width,source.height));
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(source.width*scale));
      canvas.height=Math.max(1,Math.round(source.height*scale));
      const context=canvas.getContext("2d");
      if(!context) throw new Error("Impossible de traiter cette image.");
      context.drawImage(source,0,0,canvas.width,canvas.height);
      const data=canvas.toDataURL("image/webp",0.82);
      if(data.length>2_400_000) throw new Error("Cette image reste trop lourde après optimisation. Essaie une image plus légère.");
      setCustomImage(data); setBackground("custom");
    } catch(cause) { setImageError(cause instanceof Error?cause.message:"Impossible d'utiliser cette image."); }
    event.target.value="";
  }

  function chooseBackground(choice: BackgroundChoice) {
    setBackground(choice); setImageError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true); savePreferences();
    try {
      const endpoint = isSignUp ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const body = isSignUp ? {name:name.trim(),email:email.trim(),password,accountType,callbackURL:nextPath} : {email:email.trim(),password,callbackURL:nextPath};
      const response = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data.message || data.error?.message || data.error || "La demande n'a pas abouti.");
      if (isSignUp) { setMessage("Un e-mail de vérification a été envoyé. Confirme ton adresse avant de te connecter."); setPassword(""); }
      else window.location.assign(nextPath.startsWith("/")&&!nextPath.startsWith("//")?nextPath:"/app");
    } catch(cause) { setError(cause instanceof Error?cause.message:"Une erreur est survenue."); }
    finally { setBusy(false); }
  }

  async function socialSignIn(provider:"google"|"microsoft"|"apple") {
    setError(""); savePreferences(); setSocialBusy(provider);
    try {
      const result = await authClient.signIn.social({provider,callbackURL:nextPath});
      if (result.error) throw new Error(result.error.message || "Connexion externe indisponible.");
    } catch(cause) { setError(cause instanceof Error?cause.message:"Connexion externe indisponible."); setSocialBusy(""); }
  }

  const safeNext=nextPath.startsWith("/")&&!nextPath.startsWith("//")?nextPath:"/app";

  return (
    <main className={"auth-shell auth-editorial onboarding-shell theme-"+theme} data-theme={theme} data-background={background} style={background==="custom"&&customImage?{backgroundImage:"linear-gradient(rgba(8,10,20,.28),rgba(8,10,20,.28)),url("+customImage+")",backgroundSize:"cover",backgroundPosition:"center",backgroundRepeat:"no-repeat"}:undefined}>
      <section className="onboarding-frame">
        <header className="onboarding-header"><Link className="auth-brand" href="/">NOV<span className="auth-brand-x">X</span>EXA</Link><span>VOTRE ESPACE D’APPRENTISSAGE</span></header>
        {isSignUp&&<div className="onboarding-progress"><span style={{width:step===1?"50%":"100%"}}/></div>}
        <div className="onboarding-layout">
          <aside className="onboarding-aside"><p className="auth-art-kicker">APPRENDRE SANS LIMITES</p><h1>Un espace<br/><i>qui vous ressemble.</i></h1><p>Quelques choix pour préparer votre environnement avant votre première session.</p><div className="onboarding-steps"><span className={step===1?"current":""}>01 <b>Vos informations</b></span><span className={step===2?"current":""}>02 <b>Votre apparence</b></span></div><span className="auth-art-foot">NOVEXA · LE SAVOIR EN MOUVEMENT</span></aside>
          <section className="onboarding-content">
            {!isSignUp ? <>
              <p className="auth-eyebrow">BON RETOUR</p><h2>Connectez-vous</h2><p className="auth-muted">Retrouvez votre espace et vos préférences.</p>
              <div className="social-auth-list">{providers.map(p=><button key={p.id} type="button" className="social-auth-button" onClick={()=>socialSignIn(p.id)} disabled={Boolean(socialBusy)||busy}><span className={"social-symbol social-"+p.id}>{p.symbol}</span>{socialBusy===p.id?"Redirection…":p.label}</button>)}</div>
              <div className="auth-divider"><span/>OU AVEC VOTRE E-MAIL<span/></div>
              <form className="auth-form" onSubmit={submit}><label htmlFor="auth-email">Adresse e-mail</label><input id="auth-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/><label htmlFor="auth-password">Mot de passe</label><input id="auth-password" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/>{error&&<p className="auth-error" role="alert">{error}</p>}<button className="auth-submit" disabled={busy}>{busy?"Connexion…":"Se connecter"} <span>↗</span></button></form>
              <p className="auth-switch">Pas encore de compte ? <Link href="/inscription">Créer un compte</Link></p>
            </>:<>
              {step===1?<>
                <p className="auth-eyebrow">ÉTAPE 1 SUR 2 · VOTRE PROFIL</p><h2>Commençons par faire connaissance.</h2><p className="auth-muted">Indiquez votre profil pour adapter votre espace NOVEXA.</p>
                <form className="auth-form onboarding-form" onSubmit={e=>{e.preventDefault();setError("");setStep(2);}}>
                  <label htmlFor="auth-name">Nom et prénom</label><input id="auth-name" name="name" autoComplete="name" required maxLength={80} placeholder="Votre nom" value={name} onChange={e=>setName(e.target.value)}/>
                  <label htmlFor="auth-account-type">Vous êtes…</label>
                  <select id="auth-account-type" name="accountType" className="account-type-select" value={accountType} onChange={e=>setAccountType(e.target.value as AccountType)} required>
                    <option value="student">Élève / étudiant</option>
                    <option value="university">Université / enseignement supérieur</option>
                    <option value="teacher">Professeur / enseignant</option>
                    <option value="institution">Établissement scolaire / organisme de formation</option>
                    <option value="parent">Parent / responsable légal</option>
                  </select>
                  <p className="auth-hint">Ce choix prépare les fonctionnalités adaptées à votre profil. Les accès professionnels et institutionnels peuvent nécessiter une validation.</p>
                  <div className="account-type-admin-divider" role="separator" aria-label="Espace administrateur réservé"><span></span><i>ACCÈS PRIVILÉGIÉ</i><span></span></div>
                  <aside className="account-type-admin-note"><b>Administrateur NOVEXA</b><p>Accès strictement réservé au créateur de la plateforme. Aucun compte administrateur ne peut être créé depuis cette inscription. Les autres demandes de connexion administrateur sont refusées.</p><small>🔒 Espace privé · Créateur uniquement</small></aside>
                  <label htmlFor="auth-email">Adresse e-mail</label><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} placeholder="vous@exemple.fr" value={email} onChange={e=>setEmail(e.target.value)}/>
                  <p className="auth-hint">Votre adresse e-mail servira à sécuriser votre compte et à recevoir les informations importantes.</p>
                  <button className="auth-submit" type="submit">Continuer <span>→</span></button>
                </form>
              </>:<>
                <p className="auth-eyebrow">ÉTAPE 2 SUR 2 · VOTRE PERSONNALISATION</p><h2>Choisissez votre ambiance.</h2><p className="auth-muted">Vous pourrez modifier ces réglages à tout moment.</p>
                <div className="theme-options">
                  <button type="button" className={"theme-option light-option "+(theme==="light"?"chosen":"")} onClick={()=>setTheme("light")} aria-pressed={theme==="light"}><span className="theme-mock light-mock"><i/><i/><i/><b/></span><strong>Clair</strong><small>Une page lumineuse et épurée</small>{theme==="light"&&<em>✓ Sélectionné</em>}</button>
                  <button type="button" className={"theme-option dark-option "+(theme==="dark"?"chosen":"")} onClick={()=>setTheme("dark")} aria-pressed={theme==="dark"}><span className="theme-mock dark-mock"><i/><i/><i/><b/></span><strong>Sombre</strong><small>Un environnement doux pour les yeux</small>{theme==="dark"&&<em>✓ Sélectionné</em>}</button>
                </div>
                <section className="onboarding-background-section">
                  <div className="onboarding-background-heading"><b>Votre image de fond</b><small>Choisissez une ambiance ou utilisez votre propre photo.</small></div>
                  <div className="onboarding-background-grid">{backgroundChoices.map(choice=><button key={choice.id} type="button" className={"background-choice background-"+choice.id+(background===choice.id?" selected":"")} onClick={()=>chooseBackground(choice.id)} aria-pressed={background===choice.id}><span className="background-swatch"/><b>{choice.label}</b><small>{choice.description}</small></button>)}</div>
                  <div className="background-actions">
                    <button type="button" onClick={()=>uploadInput.current?.click()}>↥ Importer un fichier</button>
                    <button type="button" onClick={()=>cameraInput.current?.click()}>◎ Prendre une photo</button>
                    <input ref={uploadInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" onChange={handleImage} hidden aria-label="Importer une image depuis les fichiers"/>
                    <input ref={cameraInput} type="file" accept="image/*" capture="environment" onChange={handleImage} hidden aria-label="Prendre une photo avec la caméra"/>
                  </div>
                  {background==="custom"&&customImage&&<div className="background-preview" style={{backgroundImage:"url("+customImage+")"}}><span>Aperçu de votre photo · adaptation automatique</span><button type="button" onClick={()=>{setCustomImage("");setBackground("aurora");}}>Retirer la photo</button></div>}
                  {imageError&&<p className="auth-error" role="alert">{imageError}</p>}
                  <p className="auth-hint">PNG, JPG, WebP, GIF ou AVIF · 15 Mo maximum. L’image reste dans votre navigateur pour le moment. Elle sera affichée en couvrant l’écran, sans déformation, avec recadrage selon le format de l’appareil.</p>
                </section>
                <div className="onboarding-extra"><span>COULEUR D’ACCENT</span><div className="accent-options">{accents.map(a=><button type="button" key={a.id} aria-label={a.label} aria-pressed={accent===a.id} className={accent===a.id?"active":""} style={{"--accent-swatch":a.color} as React.CSSProperties} onClick={()=>setAccent(a.id)}/>)}</div></div>
                <label className="onboarding-check"><input type="checkbox" checked={writer} onChange={e=>setWriter(e.target.checked)}/><span><b>Style écrivain</b><small>Typographie élégante et mise en page éditoriale</small></span></label>
                <label className="onboarding-check"><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/><span><b>Animations et transitions</b><small>Des mouvements subtils dans l’interface</small></span></label>
                <div className="onboarding-password"><label htmlFor="auth-password">Créer un mot de passe</label><input id="auth-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="12 caractères minimum"/></div>
                {error&&<p className="auth-error" role="alert">{error}</p>}{message&&<p className="auth-success" role="status">{message}</p>}
                <div className="onboarding-actions"><button className="onboarding-back" type="button" onClick={()=>setStep(1)}>← Retour</button><button className="auth-submit" type="button" disabled={busy||password.length<12} onClick={()=>{const form=document.getElementById("onboarding-create") as HTMLFormElement|null;form?.requestSubmit();}}>Créer mon espace <span>↗</span></button></div>
                <form id="onboarding-create" onSubmit={submit} className="onboarding-hidden-form"><button type="submit" disabled={busy}>Créer</button></form>
                <div className="auth-divider"><span/>OU CRÉER UN COMPTE AVEC<span/></div>
                <div className="social-auth-list">{providers.map(p=><button key={p.id} type="button" className="social-auth-button" onClick={()=>socialSignIn(p.id)} disabled={Boolean(socialBusy)||busy}><span className={"social-symbol social-"+p.id}>{p.symbol}</span>{socialBusy===p.id?"Redirection…":p.label}</button>)}</div>
              </>}
              <p className="auth-switch">Déjà inscrit ? <Link href="/connexion">Se connecter</Link></p>
            </>}
            <Link className="auth-back-link" href="/">← Retour à l’accueil</Link>
          </section>
        </div>
      </section>
    </main>
  );
}
