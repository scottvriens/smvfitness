"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase/client";

export interface ThreadMessage {
  id: string;
  sender_role: "coach" | "client";
  body: string;
  created_at: string;
}

export function MessageThread({
  clientId,
  currentUserId,
  currentUserRole,
  initialMessages,
}: {
  clientId: string;
  currentUserId: string;
  currentUserRole: "coach" | "client";
  initialMessages: ThreadMessage[];
}) {
  const [thread, setThread] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft("");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({
        client_id: clientId,
        sender_id: currentUserId,
        sender_role: currentUserRole,
        body,
      })
      .select()
      .single();

    setSending(false);
    if (!error && data) {
      setThread((prev) => [...prev, data as ThreadMessage]);
    }
  };

  return (
    <div className="flex h-[60vh] flex-col rounded-2xl border border-[var(--color-taupe)] bg-white/70">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {thread.length === 0 && (
          <p className="pt-8 text-center text-sm text-[var(--color-charcoal)]/45">
            No messages yet — say hello.
          </p>
        )}
        {thread.map((m) => (
          <div
            key={m.id}
            className={clsx("flex", m.sender_role === currentUserRole ? "justify-end" : "justify-start")}
          >
            <div
              className={clsx(
                "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                m.sender_role === currentUserRole
                  ? "bg-[var(--color-sage)] text-white"
                  : "bg-[var(--color-taupe-soft)] text-[var(--color-charcoal)]"
              )}
            >
              {m.body}
              <div
                className={clsx(
                  "mt-1 text-[10px]",
                  m.sender_role === currentUserRole ? "text-white/70" : "text-[var(--color-charcoal)]/45"
                )}
              >
                {new Date(m.created_at).toLocaleString("en-AU", {
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
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
        />
        <button
          onClick={send}
          disabled={sending}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-sage)] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          aria-label="Send message"
        >
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}
