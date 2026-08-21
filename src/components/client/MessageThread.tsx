"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import type { Message } from "@/lib/types";
import clsx from "clsx";

export function MessageThread({ initialMessages }: { initialMessages: Message[] }) {
  const [thread, setThread] = useState(initialMessages);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setThread((prev) => [
      ...prev,
      {
        id: `msg-local-${prev.length}`,
        clientId: prev[0]?.clientId ?? "client-jordan",
        senderRole: "client",
        body: draft.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setDraft("");
  };

  return (
    <div className="flex h-[60vh] flex-col rounded-2xl border border-[var(--color-taupe)] bg-white/70">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {thread.map((m) => (
          <div
            key={m.id}
            className={clsx("flex", m.senderRole === "client" ? "justify-end" : "justify-start")}
          >
            <div
              className={clsx(
                "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                m.senderRole === "client"
                  ? "bg-[var(--color-sage)] text-white"
                  : "bg-[var(--color-taupe-soft)] text-[var(--color-charcoal)]"
              )}
            >
              {m.body}
              <div
                className={clsx(
                  "mt-1 text-[10px]",
                  m.senderRole === "client" ? "text-white/70" : "text-[var(--color-charcoal)]/45"
                )}
              >
                {new Date(m.timestamp).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 border-t border-[var(--color-taupe)] p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Message Scott..."
          className="flex-1 rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
        />
        <button
          onClick={send}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-sage)] text-white transition-opacity hover:opacity-90"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
