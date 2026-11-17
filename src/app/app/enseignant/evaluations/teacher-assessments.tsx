"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Assessment = { id: string; title: string; assessment_type: string; duration_minutes: number; status: string; item_count: number };
const emptyOptions = [{ id: "A", text: "" }, { id: "B", text: "" }, { id: "C", text: "" }, { id: "D", text: "" }];

export default function TeacherAssessments() {
  const [items, setItems] = useState<Assessment[]>([]);
  const [selected, setSelected] = useState("");
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("20");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(emptyOptions);
  const [correct, setCorrect] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/assessments", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement impossible.");
      setItems(data.assessments || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de chargement."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function createAssessment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/teacher/assessments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, durationMinutes: Number(duration) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création impossible.");
      setSelected(data.assessment.id); setTitle(""); setMessage("Évaluation créée en brouillon. Ajoute tes questions.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur."); }
    finally { setBusy(false); }
  }

  async function addQuestion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/teacher/assessments/${selected}/items`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, options: options.filter(option => option.text.trim()), correctOptionId: correct, explanation })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ajout impossible.");
      setQuestion(""); setOptions(emptyOptions); setCorrect("A"); setExplanation("");
      setMessage("Question enregistrée.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur."); }
    finally { setBusy(false); }
  }

  async function publish(id: string) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch(`/api/teacher/assessments/${id}/publish`, { method: "PATCH" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Publication impossible.");
      setMessage("Évaluation publiée. Elle est maintenant disponible dans l'espace apprenant.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur."); }
    finally { setBusy(false); }
  }

  const active = items.find(item => item.id === selected && item.status === "draft");
  return (
    <main className="teacher-shell">
      <header className="teacher-top"><Link href="/app" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link><Link href="/app/enseignant" className="user-home-link">← Espace enseignant</Link></header>
      <section className="teacher-content">
        <p className="auth-eyebrow">ÉVALUATIONS & QUIZ</p><h1>Créer une évaluation</h1>
        <p className="teacher-lead">Prépare un quiz à choix unique, ajoute des questions et publie-le lorsque tu l'as vérifié. Les réponses correctes restent privées jusqu'à la correction côté serveur.</p>
        {error && <p className="teacher-error" role="alert">{error}</p>}
        {message && <p className="teacher-success" role="status">{message}</p>}
        <div className="teacher-grid">
          <section className="teacher-panel">
            <h2>Nouvelle évaluation</h2>
            <form className="teacher-form" onSubmit={createAssessment}>
              <label htmlFor="assessment-title">Titre</label><input id="assessment-title" value={title} onChange={e=>setTitle(e.target.value)} minLength={4} maxLength={160} required />
              <label htmlFor="assessment-duration">Durée (minutes)</label><input id="assessment-duration" type="number" min="1" max="240" value={duration} onChange={e=>setDuration(e.target.value)} required />
              <button disabled={busy || title.trim().length<4}>{busy ? "Enregistrement…" : "Créer le quiz"}</button>
            </form>
            <h2 className="teacher-subheading">Mes évaluations</h2>
            <div className="teacher-course-list">
              {items.length===0 && <p>Aucune évaluation créée.</p>}
              {items.map(item=><button type="button" key={item.id} className={selected===item.id?"teacher-course-choice selected":"teacher-course-choice"} onClick={()=>setSelected(item.id)}><b>{item.title}</b><span>{item.status} · {item.item_count} question(s)</span></button>)}
            </div>
          </section>
          <section className="teacher-panel">
            <h2>{active ? active.title : "Questions"}</h2>
            {!active ? <p className="teacher-placeholder">Sélectionne un brouillon pour ajouter des questions. Les évaluations publiées ne sont plus modifiables.</p> : <>
              <form className="teacher-form teacher-unit-form" onSubmit={addQuestion}>
                <label htmlFor="assessment-question">Question</label><textarea id="assessment-question" rows={3} value={question} onChange={e=>setQuestion(e.target.value)} minLength={8} maxLength={2000} required />
                {options.map((option,index)=><div className="assessment-option-editor" key={option.id}>
                  <label htmlFor={`option-${option.id}`}>Proposition {option.id}</label>
                  <input id={`option-${option.id}`} value={option.text} onChange={e=>setOptions(current=>current.map((item,i)=>i===index?{...item,text:e.target.value}:item))} maxLength={500} />
                </div>)}
                <label htmlFor="assessment-correct">Bonne réponse</label>
                <select id="assessment-correct" value={correct} onChange={e=>setCorrect(e.target.value)}>{options.map(option=><option key={option.id} value={option.id}>{option.id}</option>)}</select>
                <label htmlFor="assessment-explanation">Explication (facultative)</label><textarea id="assessment-explanation" rows={3} value={explanation} onChange={e=>setExplanation(e.target.value)} maxLength={2000} />
                <button disabled={busy || question.trim().length<8 || options.filter(o=>o.text.trim()).length<2}>{busy ? "Enregistrement…" : "Ajouter la question"}</button>
              </form>
              <button className="teacher-publish" disabled={busy || active.item_count<1} onClick={()=>publish(active.id)}>Publier l'évaluation</button>
            </>}
          </section>
        </div>
      </section>
    </main>
  );
}
