"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LessonCompleteButton({
  unitId,
  initiallyCompleted
}: {
  unitId: string;
  initiallyCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function markComplete() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/learning/units/${unitId}/complete`, {
        method: "POST"
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || "Impossible d'enregistrer cette leçon.");
      }
      setCompleted(true);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Une erreur est survenue.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="lesson-completion">
      <button
        type="button"
        className={completed ? "lesson-done-button is-done" : "lesson-done-button"}
        onClick={markComplete}
        disabled={completed || busy}
      >
        {completed ? "✓ Leçon terminée" : busy ? "Enregistrement…" : "Marquer comme terminée"}
      </button>
      {error && <p className="lesson-inline-error" role="alert">{error}</p>}
    </div>
  );
}
