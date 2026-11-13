"use client";

import { useState } from "react";
import type { ReactionState, Vote } from "@/lib/reactions";

const FEEDBACK_MAX = 2000;

export function Reactions({ slug, initial }: { slug: string; initial: ReactionState }) {
  const [state, setState] = useState(initial);
  const [draft, setDraft] = useState(initial.feedback);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function send(value: Vote, feedback: string) {
    setPending(true);
    setError(false);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, value, feedback }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const next: ReactionState = await res.json();
      setState(next);
      setDraft(next.feedback);
      return true;
    } catch {
      setError(true);
      return false;
    } finally {
      setPending(false);
    }
  }

  function vote(value: 1 | -1) {
    setSent(false);
    send(state.mine === value ? 0 : value, draft);
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (state.mine === 0) return;
    if (await send(state.mine, draft)) setSent(true);
  }

  return (
    <section className="reactions" aria-label="Was this post useful?">
      <p className="reactions-prompt">Was this useful?</p>
      <div className="reactions-buttons">
        <button type="button" className="reaction" aria-pressed={state.mine === 1} disabled={pending} aria-label={`Like (${state.up})`} onClick={() => vote(1)}>
          <span aria-hidden>👍</span>
          <span className="reaction-count" aria-hidden>{state.up.toLocaleString("en-US")}</span>
        </button>
        <button type="button" className="reaction" aria-pressed={state.mine === -1} disabled={pending} aria-label={`Dislike (${state.down})`} onClick={() => vote(-1)}>
          <span aria-hidden>👎</span>
          <span className="reaction-count" aria-hidden>{state.down.toLocaleString("en-US")}</span>
        </button>
      </div>
      {state.mine !== 0 && (
        <form className="reactions-feedback" onSubmit={submitFeedback}>
          <label htmlFor="feedback">{state.mine === 1 ? "What worked for you?" : "What could be better?"} <span className="muted">(optional)</span></label>
          <textarea
            id="feedback"
            rows={3}
            maxLength={FEEDBACK_MAX}
            value={draft}
            onChange={(e) => { setDraft(e.target.value); setSent(false); }}
          />
          <div className="reactions-feedback-bar">
            <button type="submit" className="btn" disabled={pending || draft.trim() === state.feedback}>Send</button>
            {sent && <span className="muted">Thanks, got it.</span>}
          </div>
        </form>
      )}
      {error && <p className="reactions-error">Couldn't save that. Try again.</p>}
    </section>
  );
}
