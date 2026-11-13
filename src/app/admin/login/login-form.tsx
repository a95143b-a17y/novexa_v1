"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Connexion impossible.");
      window.location.assign("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card">
        <Link href="/" className="admin-brand"><span className="admin-brand-mark">N</span>NOVEXA<span className="admin-brand-dot">.</span></Link>
        <p className="admin-kicker">CONSOLE DE COMMANDE</p>
        <h1>Accès administrateur</h1>
        <p className="admin-muted">Connecte-toi avec les identifiants administrateur configurés sur le serveur.</p>
        <form onSubmit={submit} className="admin-login-form">
          <label htmlFor="admin-email">Adresse e-mail</label>
          <input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          <label htmlFor="admin-password">Mot de passe</label>
          <input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary-button" type="submit" disabled={loading}>{loading ? "Connexion…" : "Accéder à la console"} <span>→</span></button>
        </form>
        <p className="admin-auth-foot">Session protégée · Durée maximale : 8 heures</p>
      </section>
    </main>
  );
}
