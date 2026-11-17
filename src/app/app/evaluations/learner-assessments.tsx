"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Assessment = { id: string; title: string; duration_minutes: number; question_count: number; attempts: number; last_score: number | null; last_maximum_score: number | null };

export default function LearnerAssessments() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/learning/assessments", { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Chargement impossible.");
        setItems(data.assessments || []);
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <p className="learning-notice">Chargement des évaluations…</p>;
  if (error) return <p className="learning-notice" role="alert">{error}</p>;
  if (!items.length) return <div className="learning-empty"><h2>Aucune évaluation publiée</h2><p>Les quiz apparaîtront ici dès qu'un enseignant en publiera.</p></div>;
  return <div className="learning-course-grid">
    {items.map(item => <article className="learning-course-card" key={item.id}>
      <p className="learning-course-kicker">QUIZ · ÉVALUATION</p>
      <h3>{item.title}</h3>
      <p>{item.question_count} question(s) · {item.duration_minutes} minutes</p>
      <div className="learning-course-meta"><span>{item.attempts} tentative(s)</span><strong>{item.last_score !== null && item.last_maximum_score ? `Dernier résultat : ${item.last_score}/${item.last_maximum_score}` : "Disponible"}</strong></div>
      <Link href={`/app/evaluations/${item.id}`} className="learning-open-course">Commencer le quiz <span>→</span></Link>
    </article>)}
  </div>;
}
