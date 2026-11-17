"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Course = { id: string; title: string; description: string; status: string; visibility: string; unit_count: number };
type Unit = { id: string; title: string; position: number; estimated_minutes: number };

export default function TeacherWorkspace({ isAdmin }: { isAdmin: boolean }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selected, setSelected] = useState("");
  const [units, setUnits] = useState<Unit[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitTitle, setUnitTitle] = useState("");
  const [unitText, setUnitText] = useState("");
  const [minutes, setMinutes] = useState("20");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/teacher/courses", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Chargement des cours impossible.");
      setCourses(data.courses || []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de chargement."); }
  }, []);

  const loadUnits = useCallback(async (courseId: string) => {
    const response = await fetch("/api/teacher/courses/" + courseId + "/units", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Chargement des leçons impossible.");
    setUnits(data.units || []);
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function createCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/teacher/courses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, language: "fr" })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Création du cours impossible.");
      setTitle(""); setDescription(""); setSelected(data.course.id);
      setMessage("Brouillon créé. Ajoute maintenant une première leçon.");
      await load();
      await loadUnits(data.course.id);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de création."); }
    finally { setBusy(false); }
  }

  async function createUnit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!selected) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/teacher/courses/" + selected + "/units", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: unitTitle, text: unitText, estimatedMinutes: Number(minutes) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Ajout de la leçon impossible.");
      setUnitTitle(""); setUnitText(""); setMessage("Leçon ajoutée au brouillon.");
      await loadUnits(selected); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur d'ajout."); }
    finally { setBusy(false); }
  }

  async function publish(course: Course) {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/teacher/courses/" + course.id + "/publish", { method: "PATCH" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Publication impossible.");
      setMessage("Cours publié dans le catalogue public.");
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de publication."); }
    finally { setBusy(false); }
  }

  async function selectCourse(id: string) {
    setSelected(id); setError(""); setMessage("");
    try { await loadUnits(id); } catch (cause) { setError(cause instanceof Error ? cause.message : "Erreur de chargement."); }
  }

  const active = courses.find((course) => course.id === selected);

  return (
    <main className="teacher-shell">
      <header className="teacher-top"><Link href="/app" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link><div className="teacher-header-links"><Link href="/app/enseignant/evaluations" className="user-home-link">Créer des évaluations ↗</Link><Link href="/app" className="user-home-link">Mon apprentissage ↗</Link></div></header>
      <section className="teacher-content">
        <p className="auth-eyebrow">CRÉATION PÉDAGOGIQUE</p>
        <h1>Espace enseignant</h1>
        <p className="teacher-lead">Prépare des cours en brouillon et ajoute des leçons. La publication publique nécessite une validation administrateur.</p>
        {error && <p className="teacher-error" role="alert">{error}</p>}
        {message && <p className="teacher-success" role="status">{message}</p>}
        <div className="teacher-grid">
          <section className="teacher-panel">
            <h2>Créer un cours</h2>
            <form className="teacher-form" onSubmit={createCourse}>
              <label htmlFor="teacher-course-title">Titre du cours</label>
              <input id="teacher-course-title" value={title} onChange={(event)=>setTitle(event.target.value)} maxLength={160} minLength={4} required />
              <label htmlFor="teacher-course-description">Description</label>
              <textarea id="teacher-course-description" value={description} onChange={(event)=>setDescription(event.target.value)} maxLength={2000} rows={4} />
              <button disabled={busy || title.trim().length<4}>{busy ? "Enregistrement…" : "Créer le brouillon"}</button>
            </form>
            <h2 className="teacher-subheading">Mes cours</h2>
            <div className="teacher-course-list">
              {courses.length===0 && <p>Aucun cours pour le moment.</p>}
              {courses.map((course)=><button type="button" key={course.id} className={selected===course.id?"teacher-course-choice selected":"teacher-course-choice"} onClick={()=>selectCourse(course.id)}><b>{course.title}</b><span>{course.status} · {course.unit_count} leçons</span></button>)}
            </div>
          </section>
          <section className="teacher-panel">
            <h2>{active ? active.title : "Leçons du cours"}</h2>
            {!active ? <p className="teacher-placeholder">Crée un cours ou sélectionne un cours existant pour gérer ses leçons.</p> : <>
              <div className="teacher-unit-list">
                {units.map((unit)=><div className="teacher-unit" key={unit.id}><b>{unit.position+1}. {unit.title}</b><span>{unit.estimated_minutes} min</span></div>)}
                {units.length===0 && <p>Aucune leçon ajoutée.</p>}
              </div>
              {active.status==="draft" && <form className="teacher-form teacher-unit-form" onSubmit={createUnit}>
                <h3>Ajouter une leçon</h3>
                <label htmlFor="teacher-unit-title">Titre</label>
                <input id="teacher-unit-title" value={unitTitle} onChange={(event)=>setUnitTitle(event.target.value)} maxLength={160} required />
                <label htmlFor="teacher-unit-text">Contenu pédagogique</label>
                <textarea id="teacher-unit-text" value={unitText} onChange={(event)=>setUnitText(event.target.value)} maxLength={12000} rows={7} required />
                <label htmlFor="teacher-unit-minutes">Durée estimée (minutes)</label>
                <input id="teacher-unit-minutes" type="number" min="1" max="240" value={minutes} onChange={(event)=>setMinutes(event.target.value)} required />
                <button disabled={busy || unitText.trim().length<20}>{busy ? "Enregistrement…" : "Ajouter la leçon"}</button>
              </form>}
              {isAdmin && active.status==="draft" && <button className="teacher-publish" disabled={busy || units.length===0} onClick={()=>publish(active)}>Publier ce cours dans le catalogue public</button>}
              {!isAdmin && <p className="teacher-publish-note">Un administrateur validera le cours avant sa publication.</p>}
            </>}
          </section>
        </div>
      </section>
    </main>
  );
}
