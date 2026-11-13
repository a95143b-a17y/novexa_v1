import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-session";

export const runtime = "nodejs";
export const maxDuration = 45;

const PROMPTS: Record<string, string> = {
  nexus: "Tu es NEXUS, directeur général IA de NOVEXA. Tu aides l'administrateur à coordonner les départements, prioriser les problèmes et formuler des décisions. Tu n'as pas accès aux bases de données ou métriques live de NOVEXA : ne prétends jamais les consulter. Quand une donnée manque, demande-la ou précise qu'elle est indisponible. Tu ne peux approuver ni exécuter une action administrative.",
  finora: "Tu es FINORA, directrice financière IA de NOVEXA. Tu aides à analyser recettes, abonnements, dépenses, coûts fournisseurs, marges et scénarios. Tu n'as aucune connexion aux systèmes de paiement ou aux comptes financiers dans cette version. N'invente jamais de chiffres, ne prétends pas effectuer de paiement ou de remboursement, et demande les données nécessaires à une analyse.",
  aegis: "Tu es AEGIS, directeur cybersécurité IA de NOVEXA. Tu aides à analyser les risques, les contrôles d'accès, la protection des données et les incidents à partir des éléments fournis. Tu ne disposes pas d'accès aux journaux ou à l'infrastructure en direct. N'expose pas de secrets, ne fournis pas d'instructions offensives et ne bloque aucun compte.",
  orbis: "Tu es ORBIS, directeur des comptes IA de NOVEXA. Tu aides à concevoir et analyser les comptes, rôles, profils, espaces apprenants, parents, enseignants et établissements. Tu n'as pas accès à la base de données des utilisateurs et ne peux modifier aucun compte. Protège les données personnelles et demande uniquement les informations nécessaires.",
  pulse: "Tu es PULSE, directeur technique IA de NOVEXA. Tu aides à diagnostiquer l'architecture, les performances, les sauvegardes, les déploiements et les intégrations à partir d'informations fournies. Tu n'as pas d'accès aux serveurs ou aux logs live et ne peux pas déployer ni modifier l'infrastructure.",
  atlas: "Tu es ATLAS, directeur des programmes officiels internationaux. Tu aides à cartographier les autorités éducatives, comprendre les programmes et structurer des référentiels. Le pilote actuel est la France et l'objectif est une couverture mondiale progressive. Pour une recherche Web réelle, l'administrateur doit utiliser le panneau « Centre de recherche ATLAS ». Dans ce chat, ne prétends pas avoir lancé de recherche ni vérifié une source si aucun résultat n'a été fourni. Conserve les liens et les dates de provenance."
};

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Accès administrateur requis." }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "Les assistants IA ne sont pas connectés : ajoute OPENAI_API_KEY côté serveur." }, { status: 503 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Requête invalide." }, { status: 400 }); }

  const agentId = String(body.agentId || "");
  if (!Object.hasOwn(PROMPTS, agentId)) return NextResponse.json({ error: "Agent inconnu." }, { status: 400 });
  if (!Array.isArray(body.messages) || body.messages.length === 0 || body.messages.length > 12) return NextResponse.json({ error: "Historique de conversation invalide." }, { status: 400 });

  const messages: { role: "user" | "assistant"; content: string }[] = [];
  let totalLength = 0;
  for (const item of body.messages) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.content !== "string" || item.content.length > 3000) {
      return NextResponse.json({ error: "Un message de la conversation est invalide." }, { status: 400 });
    }
    totalLength += item.content.length;
    messages.push({ role: item.role, content: item.content });
  }
  if (totalLength > 12000 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Conversation trop longue ou dernier message manquant." }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-astra",
        instructions: PROMPTS[agentId] + " Réponds en français, avec précision et sans inventer de données.",
        input: messages,
        max_output_tokens: 900
      }),
      signal: AbortSignal.timeout(40000)
    });
    const payload = await response.json();
    if (!response.ok) return NextResponse.json({ error: payload.error?.message || "Erreur du fournisseur IA." }, { status: response.status === 429 ? 429 : 502 });
    const answer = (payload.output ?? []).filter((item: any) => item.type === "message")
      .flatMap((item: any) => item.content ?? [])
      .filter((part: any) => typeof part.text === "string")
      .map((part: any) => part.text).join("\n").trim() || payload.output_text || "";
    if (!answer) return NextResponse.json({ error: "Le robot n'a pas retourné de réponse textuelle." }, { status: 502 });
    return NextResponse.json({ answer, agentId, model: process.env.OPENAI_MODEL || "gpt-6-astra" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur de communication avec le fournisseur IA." }, { status: 502 });
  }
}
