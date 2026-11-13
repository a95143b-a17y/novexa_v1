import pg from "pg";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error("Usage: npm run auth:promote-admin -- admin@example.com");
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required. Configure it in the secure server environment.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
try {
  const result = await pool.query(
    'UPDATE "user" SET role = $1 WHERE lower(email) = $2 RETURNING id, name, email',
    ["platform_admin", email]
  );
  if (result.rowCount !== 1) {
    throw new Error("Aucun compte unique trouvé. Crée d'abord le compte et vérifie son e-mail.");
  }
  const user = result.rows[0];
  await pool.query(
    "INSERT INTO profiles (id, display_name, role) VALUES ($1, $2, 'platform_admin') ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, role = EXCLUDED.role, updated_at = NOW()",
    [user.id, user.name]
  );
  console.log("Rôle platform_admin attribué à :", user.email);
  console.log("Déconnecte-toi puis reconnecte-toi pour actualiser la session.");
} finally {
  await pool.end();
}
