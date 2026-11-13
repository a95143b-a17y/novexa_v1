import { createSign, randomUUID } from "node:crypto";

type GithubJson = Record<string, any>;

function base64url(input: string) { return Buffer.from(input).toString("base64url"); }

function createAppJwt(appId: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(JSON.stringify({ iat: now - 60, exp: now + 540, iss: appId }));
  const unsigned = header + "." + payload;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned); signer.end();
  return unsigned + "." + signer.sign(privateKey.replace(/\\n/g, "\n"), "base64url");
}

async function githubRequest<T extends GithubJson>(url: string, token: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: "Bearer " + token,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {})
    },
    cache: "no-store",
    signal: AbortSignal.timeout(20000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Erreur API GitHub (" + response.status + ").");
  return data as T;
}

export function isGithubAppConfigured() {
  return Boolean(process.env.GITHUB_APP_ID && process.env.GITHUB_APP_PRIVATE_KEY && process.env.GITHUB_INSTALLATION_ID && process.env.GITHUB_OWNER && process.env.GITHUB_REPO);
}

export async function createAtlasProposal(input: {
  countryCode: "FR"; stage: string; subject: string; academicYear: string;
  summary: string; sources: { title: string; url: string }[];
}) {
  const appId = process.env.GITHUB_APP_ID;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY;
  const installationId = process.env.GITHUB_INSTALLATION_ID;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const baseBranch = process.env.GITHUB_BASE_BRANCH || "main";
  if (!appId || !privateKey || !installationId || !owner || !repo) throw new Error("GitHub App non configurée : renseigne ses variables côté serveur.");

  const jwt = createAppJwt(appId, privateKey);
  const installationResponse = await fetch("https://api.github.com/app/installations/" + encodeURIComponent(installationId) + "/access_tokens", {
    method: "POST",
    headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + jwt, "X-GitHub-Api-Version": "2022-11-28" },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  const installationData = await installationResponse.json();
  if (!installationResponse.ok || !installationData.token) throw new Error(installationData.message || "Jeton GitHub App indisponible.");
  const token: string = installationData.token;
  const root = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo);

  const ref = await githubRequest<GithubJson>(root + "/git/ref/heads/" + encodeURIComponent(baseBranch), token);
  const parentSha: string = ref.object.sha;
  const parent = await githubRequest<GithubJson>(root + "/git/commits/" + parentSha, token);
  const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const slug = input.subject.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 32) || "programmes";
  const branchName = "atlas/france-" + timestamp + "-" + randomUUID().slice(0, 8);
  const report = {
    schemaVersion: "1.0", status: "review_required", generatedAt: new Date().toISOString(),
    countryCode: input.countryCode, territory: "France", stage: input.stage,
    subject: input.subject, academicYear: input.academicYear, summary: input.summary,
    sources: input.sources,
    publicationPolicy: "Human approval required; this report is not an approved curriculum."
  };

  const tree = await githubRequest<GithubJson>(root + "/git/trees", token, {
    method: "POST",
    body: JSON.stringify({
      base_tree: parent.tree.sha,
      tree: [{
        path: "curricula/proposals/france/" + timestamp + "-" + slug + ".json",
        mode: "100644", type: "blob", content: JSON.stringify(report, null, 2) + "\n"
      }]
    })
  });
  const commit = await githubRequest<GithubJson>(root + "/git/commits", token, {
    method: "POST", body: JSON.stringify({ message: "atlas: propose France curriculum research report", tree: tree.sha, parents: [parentSha] })
  });
  await githubRequest<GithubJson>("https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo) + "/git/refs", token, {
    method: "POST", body: JSON.stringify({ ref: "refs/heads/" + branchName, sha: commit.sha })
  });
  const pull = await githubRequest<GithubJson>(root + "/pulls", token, {
    method: "POST",
    body: JSON.stringify({
      title: "[ATLAS] Proposition de recherche — France — " + input.subject,
      head: branchName, base: baseBranch,
      body: [
        "## Proposition générée par ATLAS", "",
        "**Statut :** en attente de revue humaine. Ce rapport n'est pas un programme validé.", "",
        "- Pays : France", "- Niveau : " + input.stage, "- Matière : " + input.subject, "- Année scolaire : " + input.academicYear, "",
        "## Sources citées", ...input.sources.map((source) => "- [" + source.title + "](" + source.url + ")"), "",
        "## Contrôle requis", "Vérifier le texte réglementaire applicable, les dates d'entrée en vigueur, la portée pédagogique et les droits de réutilisation avant toute publication."
      ].join("\n")
    })
  });
  return { url: pull.html_url as string, number: pull.number as number, branch: branchName };
}
