"use client";

import { useState, type FormEvent } from "react";

type AgentId = "nexus" | "finora" | "aegis" | "orbis" | "pulse" | "atlas";
type Message = { role: "user" | "assistant"; content: string };

const agents: { id: AgentId; name: string; specialty: string }[] = [
  { id: "nexus", name: "NEXUS", specialty: "Coordination et stratégie" },
  { id: "finora", name: "FINORA", specialty: "Finances et coûts" },
  { id: "aegis", name: "AEGIS", specialty: "Cybersécurité et risques" },
  { id: "orbis", name: "ORBIS", specialty: "Comptes et utilisateurs" },
  { id: "pulse", name: "PULSE", specialty: "Infrastructure et exploitation" },
  { id: "atlas", name: "ATLAS", specialty: "Programmes et sources officielles" }
];

export default function AgentDesk() {
  const [agent, setAgent] = useState<AgentId>("nexus");
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = prompt.trim();
    if (!content || busy) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setPrompt("");
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent, messages: next.slice(-12) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Le robot n'a pas pu répondre.");
      setMessages([...next, { role: "assistant", content: data.answer }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erreur de communication.");
    } finally {
      setBusy(false);
    }
  }

  function switchAgent(id: AgentId) {
    setAgent(id);
    setMessages([]);
    setError("");
  }

  const selected = agents.find((item) => item.id === agent)!;

  return (
    <section className="admin-section" id="agent-desk">
      <div className="admin-section-heading">
        <div><p className="admin-kicker">ASSISTANTS SPÉCIALISÉS</p><h2>Dialogue avec ton équipe IA</h2></div>
        <span className="admin-count">MODE CONSULTATIF</span>
      </div>
      <div className="agent-desk">
        <div className="agent-desk-selector">
          {agents.map((item) => (
            <button type="button" key={item.id} className={agent === item.id ? "agent-choice selected" : "agent-choice"} onClick={() => switchAgent(item.id)}>
              <b>{item.name}</b><span>{item.specialty}</span>
            </button>
          ))}
        </div>
        <div className="agent-chat">
          <div className="agent-chat-head"><div><b>{selected.name}</b><span>{selected.specialty}</span></div><span className="agent-chat-state">Assistant disponible après configuration OpenAI</span></div>
          <div className="agent-chat-messages" aria-live="polite">
            {messages.length === 0 && <div className="agent-chat-empty"><b>Que souhaites-tu examiner avec {selected.name} ?</b><p>Le robot répond dans son domaine, à partir des informations que tu fournis. Il ne voit pas encore les données opérationnelles de NOVEXA.</p></div>}
            {messages.map((message, index) => <div key={index} className={message.role === "user" ? "agent-message user" : "agent-message assistant"}><small>{message.role === "user" ? "ADMINISTRATEUR" : selected.name}</small><p>{message.content}</p></div>)}
            {busy && <div className="agent-typing">{selected.name} prépare une réponse…</div>}
          </div>
          {error && <p className="admin-error agent-error" role="alert">{error}</p>}
          <form className="agent-chat-form" onSubmit={send}>
            <label className="sr-only" htmlFor="agent-prompt">Message à {selected.name}</label>
            <textarea id="agent-prompt" rows={2} maxLength={3000} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={"Écrire à " + selected.name + "…"} />
            <button className="admin-primary-button" type="submit" disabled={busy || !prompt.trim()}>{busy ? "Envoi…" : "Envoyer"} ↗</button>
          </form>
          <p className="agent-chat-disclaimer">Les réponses sont des analyses IA. Aucune action financière, technique ou administrative n'est exécutée depuis ce chat.</p>
        </div>
      </div>
    </section>
  );
}
