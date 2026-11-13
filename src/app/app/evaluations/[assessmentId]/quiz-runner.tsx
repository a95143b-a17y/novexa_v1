"use client";

import { useEffect, useState, type FormEvent } from "react";

type Option = { id: string; text: string };
type Item = { id: string; prompt: { question: string; options: Option[] }; position: number };
type Result = { attempt: { score: number; maximum_score: number }; percentage: number; corrections: { itemId: string; question: string; selectedOptionId: string | null; selectedOptionText: string | null; correctOptionId: string; correctOptionText: string; correct: boolean; explanation: string }[] };

export default function QuizRunner({ assessmentId }: { assessmentId: string }) {
  const [assessment, setAssessment] = useState<{ title: string; duration_minutes: number } | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/learning/assessments/${assessmentId}`, { cache: "no-store" })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Évaluation indisponible.");
        setAssessment(data.assessment); setItems(data.items || []);
      })
      .catch(cause => setError(cause instanceof Error ? cause.message : "Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch(`/api/learning/assessments/${assessmentId}/submit`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses: answers })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Correction impossible.");
      setResult(data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de correction."); }
    finally { setBusy(false); }
  }

  if (loading) return <p className="learning-notice">Chargement du quiz…</p>;
  if (error && !assessment) return <p className="learning-notice" role="alert">{error}</p>;
  if (result) return <div className="quiz-result">
    <h1>{assessment?.title}</h1>
    <div className="quiz-score"><strong>{result.percentage}%</strong><span>{result.attempt.score} bonne(s) réponse(s) sur {result.attempt.maximum_score}</span></div>
    <h2>Correction détaillée</h2>
    {result.corrections.map((correction,index)=><article className="quiz-correction" key={correction.itemId}>
      <p className="learning-course-kicker">QUESTION {index+1}</p><h3>{correction.question}</h3>
      <p className={correction.correct?"quiz-correct":"quiz-incorrect"}>{correction.correct?"Bonne réponse":"Réponse incorrecte"}</p>
      <p>Ta réponse : <strong>{correction.selectedOptionText || "Aucune réponse"}</strong></p>
      <p>Bonne réponse : <strong>{correction.correctOptionText}</strong></p>
      {correction.explanation && <p>{correction.explanation}</p>}
    </article>)}
  </div>;

  return <div>
    <h1>{assessment?.title}</h1>
    <p className="learning-lead">{items.length} question(s) · {assessment?.duration_minutes} minutes conseillées</p>
    {error && <p className="teacher-error" role="alert">{error}</p>}
    <form className="quiz-form" onSubmit={submit}>
      {items.map((item,index)=><fieldset className="quiz-question" key={item.id}>
        <legend>{index+1}. {item.prompt.question}</legend>
        {item.prompt.options.map(option=><label className={answers[item.id]===option.id?"quiz-option selected":"quiz-option"} key={option.id}>
          <input type="radio" name={item.id} value={option.id} checked={answers[item.id]===option.id} onChange={()=>setAnswers(current=>({...current,[item.id]:option.id}))} />
          <span><b>{option.id}.</b> {option.text}</span>
        </label>)}
      </fieldset>)}
      <button className="lesson-done-button" type="submit" disabled={busy || items.length===0 || items.some(item=>!answers[item.id])}>{busy?"Correction…":"Valider mes réponses"}</button>
    </form>
  </div>;
}
