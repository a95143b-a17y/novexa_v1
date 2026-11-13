import { betterAuth } from "better-auth";
import { Pool } from "pg";

function createAuth(database: Pool, baseURL: string, secret: string, trustedOrigins: string[]) {
  return betterAuth({
    appName: "NOVEXA",
    baseURL,
    secret,
    database,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 12,
      maxPasswordLength: 128,
      requireEmailVerification: true,
      sendResetPassword: async ({ user, url }) => {
        await sendTransactionalEmail({
          to: user.email,
          subject: "Réinitialiser ton mot de passe NOVEXA",
          text: "Une demande de réinitialisation du mot de passe a été effectuée pour ton compte.",
          actionUrl: url,
          actionLabel: "Réinitialiser mon mot de passe"
        });
      }
    },
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: false,
      expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) => {
        await sendTransactionalEmail({
          to: user.email,
          subject: "Vérifie ton adresse e-mail NOVEXA",
          text: "Pour confirmer que cette adresse e-mail t'appartient, utilise le lien sécurisé ci-dessous.",
          actionUrl: url,
          actionLabel: "Vérifier mon adresse e-mail"
        });
      }
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: true,
          defaultValue: "learner",
          input: false
        }
      }
    }
  });
}

type AuthInstance = ReturnType<typeof createAuth>;
type GlobalWithNovexa = typeof globalThis & {
  novexaPgPool?: Pool;
  novexaAuth?: AuthInstance;
};

const globalForNovexa = globalThis as GlobalWithNovexa;

export function isAuthConfigured(): boolean {
  return Boolean(
    process.env.DATABASE_URL &&
    process.env.BETTER_AUTH_SECRET &&
    process.env.BETTER_AUTH_SECRET.length >= 32
  );
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character] || character);
}

async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
  actionUrl: string;
  actionLabel: string;
}) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error("Le service e-mail NOVEXA n'est pas configuré.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + process.env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [input.to],
      subject: input.subject,
      text: input.text + " " + input.actionUrl,
      html: "<main style=\"font-family:Arial,sans-serif;line-height:1.6;color:#172033\">" +
        "<h2>NOVEXA</h2><p>" + escapeHtml(input.text) + "</p>" +
        "<p><a href=\"" + escapeHtml(input.actionUrl) + "\" style=\"display:inline-block;padding:12px 18px;background:#176b86;color:white;text-decoration:none;border-radius:8px\">" +
        escapeHtml(input.actionLabel) + "</a></p><p>Si tu n'es pas à l'origine de cette demande, ignore ce message.</p></main>"
    }),
    signal: AbortSignal.timeout(15000)
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || "Échec de l'envoi du message e-mail.");
  }
}

export function getAuth(): AuthInstance {
  if (!isAuthConfigured()) {
    throw new Error("Authentification non configurée : renseigne DATABASE_URL et BETTER_AUTH_SECRET côté serveur.");
  }
  if (globalForNovexa.novexaAuth) return globalForNovexa.novexaAuth;

  const secret = process.env.BETTER_AUTH_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  if (!secret || !databaseUrl) {
    throw new Error("Configuration d'authentification incomplète.");
  }

  const pool = globalForNovexa.novexaPgPool ?? new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  globalForNovexa.novexaPgPool = pool;

  const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const trustedOrigins = [...new Set([
    baseURL,
    process.env.NEXT_PUBLIC_APP_URL
  ].filter((value): value is string => Boolean(value)))];

  const auth = createAuth(pool, baseURL, secret, trustedOrigins);
  globalForNovexa.novexaAuth = auth;
  return auth;
}
