import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";
import LessonCompleteButton from "@/app/app/lesson-complete-button";

export const metadata: Metadata = { title: "Cours" };
export const dynamic = "force-dynamic";

type Lesson = {
  id: string;
  title: string;
  text: string;
  position: number;
  estimated_minutes: number | null;
  completed_at: string | null;
};

export default async function LearnerCoursePage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp");
  if (session.user.role !== "learner" && session.user.role !== "platform_admin") {
    redirect("/app");
  }

  const { courseId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(courseId)) notFound();

  if (!isDatabaseConfigured()) {
    return (
      <main className="learning-shell">
        <header className="learning-top"><Link href="/app" className="auth-brand">NOVEXA<span className="auth-brand-dot">.</span></Link></header>
        <section className="learning-content">
          <p className="auth-eyebrow">ESPACE APPRENANT</p>
          <h1>Le cours n'est pas encore accessible</h1>
          <p>La base PostgreSQL de NOVEXA n'est pas configurée. Le cours sera disponible après connexion de la base et application des migrations.</p>
          <Link className="learning-back-link" href="/app">← Retour à mon espace</Link>
        </section>
      </main>
    );
  }

  let course: { id: string; title: string; description: string | null } | undefined;
  let lessons: Lesson[] = [];
  try {
    const pool = getDatabasePool();
    const courseResult = await pool.query(
      "SELECT id, title, description FROM courses WHERE id = $1 AND status = 'active' AND visibility = 'public'",
      [courseId]
    );
    course = courseResult.rows[0];
    if (!course) notFound();

    const lessonResult = await pool.query(
      `SELECT
         cu.id,
         cu.title,
         COALESCE(cu.body->>'text', '') AS text,
         cu.position,
         cu.estimated_minutes,
         lp.completed_at
       FROM course_units cu
       LEFT JOIN lesson_progress lp
         ON lp.course_unit_id = cu.id AND lp.learner_id = $1
       WHERE cu.course_id = $2
       ORDER BY cu.position ASC`,
      [session.user.id, courseId]
    );
    lessons = lessonResult.rows;
  } catch (error) {
    if (error instanceof Error && error.message === "NEXT_HTTP_ERROR_FALLBACK;404") throw error;
    return (
      <main className="learning-shell">
        <header className="learning-top"><Link href="/app" className="auth-brand">NOVEXA<span className="auth-brand-dot">.</span></Link></header>
        <section className="learning-content">
          <p className="auth-eyebrow">ESPACE APPRENANT</p>
          <h1>Catalogue temporairement indisponible</h1>
          <p>La base est configurée, mais les migrations pédagogiques ne sont pas toutes appliquées. Vérifie notamment la migration 0004_lesson_progress.sql.</p>
          <Link className="learning-back-link" href="/app">← Retour à mon espace</Link>
        </section>
      </main>
    );
  }

  const completedCount = lessons.filter((lesson) => lesson.completed_at).length;
  const completion = lessons.length ? Math.round(completedCount / lessons.length * 100) : 0;

  return (
    <main className="learning-shell">
      <header className="learning-top">
        <Link href="/app" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link>
        <Link href="/app" className="learning-back-link">← Mon espace</Link>
      </header>
      <section className="learning-content">
        <p className="auth-eyebrow">PARCOURS PÉDAGOGIQUE</p>
        <h1>{course?.title}</h1>
        {course?.description && <p className="learning-lead">{course.description}</p>}
        <div className="learning-progress-card">
          <div><span>PROGRESSION DU COURS</span><strong>{completion}%</strong></div>
          <div className="learning-progress-track"><span style={{ width: `${completion}%` }} /></div>
          <small>{completedCount} leçon(s) terminée(s) sur {lessons.length}</small>
        </div>
        <div className="learning-lesson-list">
          {lessons.map((lesson) => (
            <article className="learning-lesson" key={lesson.id}>
              <div className="learning-lesson-heading">
                <span className="learning-lesson-number">{String(lesson.position + 1).padStart(2, "0")}</span>
                <div><h2>{lesson.title}</h2><small>{lesson.estimated_minutes ?? 20} min estimées</small></div>
                {lesson.completed_at && <span className="learning-completed-label">Terminée</span>}
              </div>
              <div className="learning-lesson-body">{lesson.text || "Aucun contenu n'a encore été ajouté à cette leçon."}</div>
              <LessonCompleteButton unitId={lesson.id} initiallyCompleted={Boolean(lesson.completed_at)} />
            </article>
          ))}
          {lessons.length === 0 && (
            <div className="learning-empty">
              <h2>Ce cours ne contient pas encore de leçon</h2>
              <p>L'enseignant doit ajouter du contenu avant que le parcours puisse commencer.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
