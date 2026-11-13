import { NextRequest, NextResponse } from "next/server";
import { toNextJsHandler } from "better-auth/next-js";
import { getAuth, isAuthConfigured, isEmailConfigured } from "@/lib/auth";

export const runtime = "nodejs";

async function handle(request: NextRequest) {
  if (!isAuthConfigured()) {
    return NextResponse.json({
      error: "Authentification indisponible : PostgreSQL et BETTER_AUTH_SECRET doivent être configurés."
    }, { status: 503 });
  }

  const pathname = new URL(request.url).pathname;
  const mailRequired = [
    "/sign-up/email",
    "/send-verification-email",
    "/forget-password",
    "/request-password-reset"
  ].some((path) => pathname.endsWith(path));

  if (mailRequired && !isEmailConfigured()) {
    return NextResponse.json({
      error: "Le service de vérification e-mail n'est pas configuré. Renseigne RESEND_API_KEY et EMAIL_FROM côté serveur."
    }, { status: 503 });
  }

  const handlers = toNextJsHandler(getAuth());
  return request.method === "GET" ? handlers.GET(request) : handlers.POST(request);
}

export const GET = handle;
export const POST = handle;
