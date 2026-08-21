"use client";

import { useState } from "react";
import type { CheckInSubmission } from "@/lib/types";
import { Card, CardHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

function formatFieldLabel(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

export function CheckInReviewList({ checkIns }: { checkIns: CheckInSubmission[] }) {
  const [items, setItems] = useState(checkIns);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const markReviewed = (id: string) => {
    setItems((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, coachReviewed: true, coachComment: drafts[id] || c.coachComment }
          : c
      )
    );
  };

  return (
    <div className="space-y-3">
      {items.map((c) => (
        <Card key={c.id}>
          <CardHeading
            title={new Date(c.date).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
            subtitle={`${c.weightKg} kg`}
            action={
              <Badge tone={c.coachReviewed ? "sage" : "clay"}>
                {c.coachReviewed ? "Reviewed" : "Needs review"}
              </Badge>
            }
          />
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            {Object.entries(c.answers)
              .filter(([, v]) => typeof v === "number")
              .map(([key, value]) => (
                <div key={key} className="rounded-lg bg-[var(--color-taupe-soft)]/50 py-2">
                  <p className="text-sm font-semibold text-[var(--color-charcoal)]">{value}/5</p>
                  <p className="text-[10px] text-[var(--color-charcoal)]/50">{formatFieldLabel(key)}</p>
                </div>
              ))}
          </div>
          {typeof c.answers.notes === "string" && c.answers.notes && (
            <p className="mb-3 text-sm text-[var(--color-charcoal)]/75">
              &ldquo;{c.answers.notes}&rdquo;
            </p>
          )}

          {c.coachComment && (
            <div className="mb-3 rounded-lg bg-[var(--color-sage-light)]/25 px-3 py-2.5">
              <p className="text-xs font-semibold text-[var(--color-olive-deep)]">Your reply</p>
              <p className="mt-0.5 text-sm text-[var(--color-charcoal)]/80">{c.coachComment}</p>
            </div>
          )}

          {!c.coachReviewed && (
            <div className="flex gap-2">
              <input
                value={drafts[c.id] ?? ""}
                onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                placeholder="Leave a reply..."
                className="flex-1 rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2 text-sm outline-none focus:border-[var(--color-sage)]"
              />
              <button
                onClick={() => markReviewed(c.id)}
                className="shrink-0 rounded-xl bg-[var(--color-sage)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Mark reviewed
              </button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
