"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type AuthFormProps = { mode: "sign-in" | "sign-up"; nextPath?: string };

export default function AuthForm({ mode, nextPath = "/app" }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const endpoint = isSignUp ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const body = isSignUp
        ? { name: name.trim(), email: email.trim(), password, callbackURL: nextPath }
        : { email: email.trim(), password, callbackURL: nextPath };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error?.message || data.error || "La demande n'a pas abouti.");
      }
      if (isSignUp) {
        setMessage("Un e-mail de vérification a été envoyé si l'inscription est valide. Ouvre le lien reçu pour confirmer ton adresse, puis connecte-toi.");
        setPassword("");
      } else {
        window.location.assign(nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/app");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" href="/"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link>
        <p className="auth-eyebrow">ESPACE ÉDUCATIF</p>
        <h1>{isSignUp ? "Créer un compte" : "Bon retour"}</h1>
        <p className="auth-muted">{isSignUp ? "Crée ton espace NOVEXA pour suivre tes apprentissages." : "Connecte-toi à ton espace NOVEXA."}</p>
        <form className="auth-form" onSubmit={submit}>
          {isSignUp && <><label htmlFor="auth-name">Nom affiché</label><input id="auth-name" name="name" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} /></>}
          <label htmlFor="auth-email">Adresse e-mail</label>
          <input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="auth-password">Mot de passe</label>
          <input id="auth-password" name="password" type="password" autoComplete={isSignUp ? "new-password" : "current-password"} minLength={isSignUp ? 12 : 1} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} />
          {isSignUp && <p className="auth-hint">Au moins 12 caractères. Le rôle initial est « apprenant » ; les autres rôles sont attribués par l'administration.</p>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={busy}>{busy ? "Traitement…" : isSignUp ? "Créer mon compte" : "Se connecter"} <span>→</span></button>
        </form>
        <p className="auth-switch">{isSignUp ? "Tu as déjà un compte ?" : "Tu n'as pas encore de compte ?"} <Link href={isSignUp ? "/connexion" : "/inscription"}>{isSignUp ? "Se connecter" : "Créer un compte"}</Link></p>
        <p className="auth-privacy">NOVEXA ne demande pas de date de naissance dans ce formulaire. Ne saisis pas de données personnelles supplémentaires dans les champs libres.</p>
      </section>
    </main>
  );
}
