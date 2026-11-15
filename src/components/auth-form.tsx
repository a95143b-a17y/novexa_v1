"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

type AuthFormProps = {
  mode: "sign-in" | "sign-up";
  nextPath?: string;
};

type AccountType = "student" | "university" | "teacher" | "institution" | "parent";

const providers = [
  { id: "google", label: "Continuer avec Google", symbol: "G" },
  { id: "microsoft", label: "Continuer avec Microsoft", symbol: "▦" },
  { id: "apple", label: "Continuer avec Apple", symbol: "●" }
] as const;

export default function AuthForm({ mode, nextPath }: AuthFormProps) {
  const isSignUp = mode === "sign-up";
  const requestedPath = nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : isSignUp ? "/personnalisation" : "/app";
  const destination = isSignUp && requestedPath === "/app" ? "/personnalisation" : requestedPath;

  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [socialBusy, setSocialBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);

    try {
      const endpoint = isSignUp ? "/api/auth/sign-up/email" : "/api/auth/sign-in/email";
      const body = isSignUp
        ? { name: name.trim(), accountType, email: email.trim(), password, callbackURL: destination }
        : { email: email.trim(), password, callbackURL: destination };

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
        setPassword("");
        setMessage("Un e-mail de vérification a été demandé. Après confirmation de votre adresse, connectez-vous pour terminer votre personnalisation.");
      } else {
        window.location.assign(destination);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  async function socialSignIn(provider: "google" | "microsoft" | "apple") {
    setError("");
    setSocialBusy(provider);
    try {
      const result = await authClient.signIn.social({ provider, callbackURL: destination });
      if (result.error) throw new Error(result.error.message || "Connexion externe indisponible.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Connexion externe indisponible.");
      setSocialBusy("");
    }
  }

  return (
    <main className="auth-shell auth-editorial onboarding-shell">
      <section className="onboarding-frame auth-page-frame">
        <header className="onboarding-header">
          <Link className="auth-brand" href="/">NOV<span className="auth-brand-x">X</span>EXA</Link>
          <span>VOTRE ESPACE D’APPRENTISSAGE</span>
        </header>
        <div className="onboarding-layout auth-single-layout">
          <aside className="onboarding-aside">
            <p className="auth-art-kicker">APPRENDRE SANS LIMITES</p>
            <h1>{isSignUp ? <>Votre parcours.<br /><i>Votre méthode.</i></> : <>Heureux de<br /><i>vous retrouver.</i></>}</h1>
            <p>{isSignUp
              ? "Créez votre compte. Après vérification de votre adresse, NOVEXA vous guidera dans une configuration complète de votre espace."
              : "Connectez-vous pour retrouver vos cours, vos documents et votre environnement personnalisé."}</p>
            <span className="auth-art-foot">NOVEXA · LE SAVOIR EN MOUVEMENT</span>
          </aside>

          <section className="onboarding-content">
            <p className="auth-eyebrow">{isSignUp ? "CRÉATION DE COMPTE" : "ESPACE PERSONNEL"}</p>
            <h2>{isSignUp ? "Créer votre compte." : "Connectez-vous."}</h2>
            <p className="auth-muted">{isSignUp
              ? "Quelques informations pour ouvrir votre espace NOVEXA."
              : "Retrouvez votre espace et votre progression."}</p>

            <div className="social-auth-list">
              {providers.map(provider => (
                <button
                  key={provider.id}
                  type="button"
                  className="social-auth-button"
                  onClick={() => socialSignIn(provider.id)}
                  disabled={Boolean(socialBusy) || busy}
                >
                  <span className={"social-symbol social-" + provider.id}>{provider.symbol}</span>
                  {socialBusy === provider.id ? "Redirection…" : provider.label}
                </button>
              ))}
            </div>

            <div className="auth-divider"><span />OU AVEC VOTRE E-MAIL<span /></div>
            <form className="auth-form onboarding-form" onSubmit={submit}>
              {isSignUp && <>
                <label htmlFor="auth-name">Nom et prénom</label>
                <input id="auth-name" name="name" autoComplete="name" required maxLength={80}
                  placeholder="Votre nom" value={name} onChange={event => setName(event.target.value)} />
                <label htmlFor="auth-account-type">Vous êtes…</label>
                <select id="auth-account-type" name="accountType" className="account-type-select"
                  value={accountType} onChange={event => setAccountType(event.target.value as AccountType)} required>
                  <option value="student">Élève / étudiant</option>
                  <option value="university">Université / enseignement supérieur</option>
                  <option value="teacher">Professeur / enseignant</option>
                  <option value="institution">Établissement scolaire / organisme de formation</option>
                  <option value="parent">Parent / responsable légal</option>
                </select>
              </>}

              <label htmlFor="auth-email">Adresse e-mail</label>
              <input id="auth-email" name="email" type="email" autoComplete="email" required maxLength={254}
                placeholder="vous@exemple.fr" value={email} onChange={event => setEmail(event.target.value)} />
              <label htmlFor="auth-password">Mot de passe</label>
              <input id="auth-password" name="password" type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                minLength={isSignUp ? 12 : undefined} maxLength={128} required
                placeholder={isSignUp ? "12 caractères minimum" : "Votre mot de passe"}
                value={password} onChange={event => setPassword(event.target.value)} />

              {error && <p className="auth-error" role="alert">{error}</p>}
              {message && <p className="auth-success" role="status">{message}</p>}
              <button className="auth-submit" type="submit" disabled={busy}>
                {busy ? "Veuillez patienter…" : isSignUp ? "Créer mon compte" : "Se connecter"} <span>↗</span>
              </button>
            </form>

            <p className="auth-switch">
              {isSignUp ? "Déjà inscrit ?" : "Pas encore de compte ?"}{" "}
              <Link href={isSignUp ? "/connexion?next=%2Fpersonnalisation" : "/inscription"}>
                {isSignUp ? "Se connecter" : "Créer un compte"}
              </Link>
            </p>
            {!isSignUp && <p className="auth-switch"><Link href="/abonnement">Voir les formules NOVEXA</Link></p>}
            <Link className="auth-back-link" href="/">← Retour à l’accueil</Link>
          </section>
        </div>
      </section>
    </main>
  );
}