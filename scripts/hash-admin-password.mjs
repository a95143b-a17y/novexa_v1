import { randomBytes, scryptSync } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const rl = createInterface({ input: stdin, output: stdout });
try {
  const password = await rl.question("Mot de passe administrateur (saisie visible) : ");
  if (password.length < 14) throw new Error("Utilise au moins 14 caractères.");
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  console.log("\nADMIN_PASSWORD_HASH=" + salt + ":" + hash);
  console.log("Copie cette valeur dans les variables d'environnement du serveur, jamais dans GitHub.");
} finally {
  rl.close();
}
