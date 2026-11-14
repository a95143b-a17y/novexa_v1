"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = { mode: "sign-in" | "sign-up"; nextPath?: string };

const providers = [
  {id:"google",label:"Continuer avec Google",symbol:"G"},
  {id:"microsoft",label:"Continuer avec Microsoft",symbol:"▦"},
  {id:"apple",label:"Continuer avec Apple",symbol:"●"}
] as const;

export default function AuthForm({ mode, nextPath = "/app" }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [socialBusy,setSocialBusy] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage(""); setBusy(true);
    try {
      const endpoint = isSignUp ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const body = isSignUp ? {name:name.trim(),email:email.trim(),password,callbackURL:nextPath} : {email:email.trim(),password,callbackURL:nextPath};
      const response = await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data = await response.json().catch(()=>({}));
      if (!response.ok) throw new Error(data.message || data.error?.message || data.error || "La demande n'a pas abouti.");
      if (isSignUp) { setMessage("Un e-mail de vérification a été envoyé. Confirme ton adresse avant de te connecter."); setPassword(""); }
      else window.location.assign(nextPath.startsWith("/")&&!nextPath.startsWith("//")?nextPath:"/app");
    } catch(cause) { setError(cause instanceof Error?cause.message:"Une erreur est survenue."); }
    finally { setBusy(false); }
  }

  async function socialSignIn(provider:"google"|"microsoft"|"apple") {
    setError(""); setSocialBusy(provider);
    try {
      const result = await authClient.signIn.social({provider,callbackURL:nextPath});
      if (result.error) throw new Error(result.error.message || "Connexion externe indisponible.");
    } catch(cause) { setError(cause instanceof Error?cause.message:"Connexion externe indisponible."); setSocialBusy(""); }
  }

  return (
    <main className="auth-shell auth-editorial">
      <section className="auth-card auth-card-wide">
        <div className="auth-split">
          <div className="auth-art"><Link className="auth-brand" href="/">NOV<span className="auth-brand-x">X</span>EXA</Link><p className="auth-art-kicker">APPRENDRE SANS LIMITES</p><h2>Un espace<br/><i>à votre image.</i></h2><p>Votre parcours commence avec une expérience qui vous ressemble.</p><span className="auth-art-foot">NOVEXA · LE SAVOIR EN MOUVEMENT</span></div>
          <div className="auth-content">
            <p className="auth-eyebrow">VOTRE ESPACE ÉDUCATIF</p>
            <h1>{isSignUp?"Créer votre espace":"Heureux de vous revoir"}</h1>
            <p className="auth-muted">{isSignUp?"Quelques instants pour commencer votre parcours.":"Connectez-vous pour retrouver votre espace personnalisé."}</p>
            <div className="social-auth-list">{providers.map(p=><button key={p.id} type="button" className="social-auth-button" onClick={()=>socialSignIn(p.id)} disabled={Boolean(socialBusy)||busy}><span className={"social-symbol social-"+p.id}>{p.symbol}</span>{socialBusy===p.id?"Redirection…":p.label}</button>)}</div>
            <div className="auth-divider"><span/>OU AVEC VOTRE E-MAIL<span/></div>
            <form className="auth-form" onSubmit={submit}>
              {isSignUp&&<><label htmlFor="auth-name">Nom affiché</label><input id="auth-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></>}
              <label htmlFor="auth-email">Adresse e-mail</label><input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/>
              <label htmlFor="auth-password">Mot de passe</label><input id="auth-password" name="password" type="password" autoComplete={isSignUp?"new-password":"current-password"} minLength={isSignUp?12:1} maxLength={128} required value={password} onChange={e=>setPassword(e.target.value)}/>
              {isSignUp&&<p className="auth-hint">12 caractères minimum. Le compte est créé avec le rôle apprenant.</p>}
              {error&&<p className="auth-error" role="alert">{error}</p>}{message&&<p className="auth-success" role="status">{message}</p>}
              <button className="auth-submit" type="submit" disabled={busy}>{busy?"Traitement…":isSignUp?"Créer mon compte":"Se connecter"} <span>↗</span></button>
            </form>
            <p className="auth-switch">{isSignUp?"Vous avez déjà un compte ?":"Pas encore de compte ?"} <Link href={isSignUp?"/connexion":"/inscription"}>{isSignUp?"Se connecter":"Créer un compte"}</Link></p>
            <Link className="auth-back-link" href="/">← Retour à l’accueil</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
