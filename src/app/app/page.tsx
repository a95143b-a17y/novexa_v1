import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionFromHeaders } from "@/lib/auth-guards";
import { getDatabasePool, isDatabaseConfigured } from "@/lib/database";

export const metadata: Metadata = { title: "Mon espace" };
export const dynamic = "force-dynamic";

type CourseSummary = {
  id: string;
  title: string;
  description: string;
  unit_count: number;
  completed_count: number;
  completion_percent: number;
};

const roleLabels: Record<string, string> = {
  learner: "Apprenant",
  parent: "Parent / responsable",
  teacher: "Enseignant",
  institution_admin: "Administrateur d'établissement",
  platform_admin: "Administrateur NOVEXA"
};

export default async function LearnerHomePage() {
  const session = await getSessionFromHeaders(await headers());
  if (!session) redirect("/connexion?next=%2Fapp");
  if (session.user.role === "teacher") redirect("/app/enseignant");

  let courses: CourseSummary[] = [];
  let databaseMessage = "";
  if (session.user.role === "learner" && isDatabaseConfigured()) {
    try {
      const result = await getDatabasePool().query(
        `SELECT
           c.id,
           c.title,
           COALESCE(c.description, '') AS description,
           COUNT(DISTINCT cu.id)::int AS unit_count,
           COUNT(DISTINCT lp.course_unit_id)::int AS completed_count,
           CASE
             WHEN COUNT(DISTINCT cu.id) = 0 THEN 0
             ELSE ROUND(
               COUNT(DISTINCT lp.course_unit_id)::numeric
               / COUNT(DISTINCT cu.id)::numeric * 100
             )::int
           END AS completion_percent
         FROM courses c
         LEFT JOIN course_units cu ON cu.course_id = c.id
         LEFT JOIN lesson_progress lp
           ON lp.course_unit_id = cu.id AND lp.learner_id = $1
         WHERE c.status = 'active' AND c.visibility = 'public'
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT 100`,
        [session.user.id]
      );
      courses = result.rows;
    } catch {
      databaseMessage = "Le catalogue n'est pas encore initialisé. Vérifie les migrations PostgreSQL, notamment 0004_lesson_progress.sql.";
    }
  } else if (session.user.role === "learner") {
    databaseMessage = "La base PostgreSQL n'est pas encore connectée. Le catalogue et la progression seront activés après sa configuration.";
  }

  const totalLessons = courses.reduce((sum, course) => sum + course.unit_count, 0);
  const completedLessons = courses.reduce((sum, course) => sum + course.completed_count, 0);

  return (
    <main className="learning-shell">
      <header className="learning-top">
        <Link href="/" className="auth-brand"><span className="auth-brand-mark">N</span>NOVEXA<span className="auth-brand-dot">.</span></Link>
        <nav className="learning-nav">
          {session.user.role === "platform_admin" && <Link href="/admin">Administration</Link>}
          <form action="/api/auth/sign-out" method="post"><button className="user-signout">Se déconnecter</button></form>
        </nav>
      </header>
      <section className="learning-content">
        <p className="auth-eyebrow">TABLEAU DE BORD PERSONNEL</p>
        <h1>Bienvenue, {session.user.name || "sur NOVEXA"}.</h1>
        <p className="learning-lead">Un espace clair pour retrouver tes cours, avancer leçon après leçon et suivre tes apprentissages.</p>

        {session.user.role === "learner" && <div className="learning-shortcut-row"><Link href="/app/evaluations" className="learning-open-course">Mes évaluations et quiz →</Link></div>}
        <div className="learning-overview-grid">
          <article className="learning-overview-card"><span>COURS DISPONIBLES</span><strong>{courses.length}</strong><small>Contenus publiés dans le catalogue</small></article>
          <article className="learning-overview-card"><span>LEÇONS TERMINÉES</span><strong>{completedLessons}</strong><small>Sur {totalLessons} leçon(s) disponibles</small></article>
          <article className="learning-overview-card"><span>RÔLE DU COMPTE</span><strong className="learning-role-value">{roleLabels[session.user.role] || "Utilisateur"}</strong><small>Accès défini par NOVEXA</small></article>
        </div>

        {databaseMessage && <div className="learning-notice" role="status"><strong>Configuration nécessaire</strong><p>{databaseMessage}</p></div>}

        {session.user.role === "learner" && (
          <section className="learning-catalog-section">
            <div className="learning-section-heading"><div><p className="auth-eyebrow">APPRENTISSAGE</p><h2>Mes cours</h2></div><span>{courses.length} COURS</span></div>
            <div className="learning-course-grid">
              {courses.map((course) => (
                <article className="learning-course-card" key={course.id}>
                  <p className="learning-course-kicker">PARCOURS NOVEXA</p>
                  <h3>{course.title}</h3>
                  <p>{course.description || "Un parcours pédagogique publié par un enseignant."}</p>
                  <div className="learning-course-meta"><span>{course.unit_count} leçon(s)</span><strong>{course.completion_percent}%</strong></div>
                  <div className="learning-progress-track"><span style={{ width: `${course.completion_percent}%` }} /></div>
                  <Link href={`/app/cours/${course.id}`} className="learning-open-course">Ouvrir le cours <span>→</span></Link>
                </article>
              ))}
              {courses.length === 0 && !databaseMessage && (
                <div className="learning-empty"><h3>Aucun cours publié pour le moment</h3><p>Les cours apparaîtront ici dès qu'un enseignant les aura préparés et qu'un administrateur les aura validés.</p></div>
              )}
            </div>
          </section>
        )}

        {session.user.role === "parent" && <div className="learning-notice"><strong>Espace famille en préparation</strong><p>Le suivi d'un apprenant sera accessible après la mise en place d'un lien familial vérifié et consenti.</p></div>}
        {session.user.role === "institution_admin" && <div className="learning-notice"><strong>Espace établissement en préparation</strong><p>La gestion des classes et des membres sera activée après configuration des établissements et des autorisations.</p></div>}
        {session.user.role === "platform_admin" && <div className="learning-notice"><strong>Console de pilotage</strong><p>La console d'administration permet de gérer les comptes, les assistants et le pipeline ATLAS.</p><Link href="/admin" className="learning-open-course">Ouvrir la console administrateur →</Link></div>}
      </section>
      <footer className="learning-footer">NOVEXA · Apprendre avec méthode</footer>
    </main>
  );
}
