"use client";

import { useState } from "react";
import { Card, CardHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/client";

export interface CoachCheckIn {
  id: string;
  date: string;
  weight_kg: number | null;
  answers: Record<string, string | number> | null;
  coach_reviewed: boolean;
  coach_comment: string | null;
}

function formatFieldLabel(key: string) {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
}

export function CheckInReviewList({ checkIns }: { checkIns: CoachCheckIn[] }) {
  const [items, setItems] = useState(checkIns);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const markReviewed = async (id: string) => {
    setSaving(id);
    const comment = drafts[id] || undefined;
    const supabase = createClient();
    const { error } = await supabase
      .from("checkin_submissions")
      .update({ coach_reviewed: true, coach_comment: comment })
      .eq("id", id);

    setSaving(null);
    if (!error) {
      setItems((prev) =>
        prev.map((c) => (c.id === id ? { ...c, coach_reviewed: true, coach_comment: comment ?? c.coach_comment } : c))
      );
    }
  };

  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--color-charcoal)]/55">No check-ins from this client yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((c) => {
        const answers = c.answers ?? {};
        return (
          <Card key={c.id}>
            <CardHeading
              title={new Date(c.date).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              subtitle={c.weight_kg ? `${c.weight_kg} kg` : undefined}
              action={
                <Badge tone={c.coach_reviewed ? "sage" : "clay"}>
                  {c.coach_reviewed ? "Reviewed" : "Needs review"}
                </Badge>
              }
            />
            <div className="mb-3 grid grid-cols-3 gap-2 text-center">
              {Object.entries(answers)
                .filter(([, v]) => typeof v === "number")
                .map(([key, value]) => (
                  <div key={key} className="rounded-lg bg-[var(--color-taupe-soft)]/50 py-2">
                    <p className="text-sm font-semibold text-[var(--color-charcoal)]">{value}/5</p>
                    <p className="text-[10px] text-[var(--color-charcoal)]/50">{formatFieldLabel(key)}</p>
                  </div>
                ))}
            </div>
            {typeof answers.notes === "string" && answers.notes && (
              <p className="mb-3 text-sm text-[var(--color-charcoal)]/75">
                &ldquo;{answers.notes}&rdquo;
              </p>
            )}

            {c.coach_comment && (
              <div className="mb-3 rounded-lg bg-[var(--color-sage-light)]/25 px-3 py-2.5">
                <p className="text-xs font-semibold text-[var(--color-olive-deep)]">Your reply</p>
                <p className="mt-0.5 text-sm text-[var(--color-charcoal)]/80">{c.coach_comment}</p>
              </div>
            )}

            {!c.coach_reviewed && (
              <div className="flex gap-2">
                <input
                  value={drafts[c.id] ?? ""}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="Leave a reply..."
                  className="flex-1 rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2 text-sm outline-none focus:border-[var(--color-sage)]"
                />
                <button
                  onClick={() => markReviewed(c.id)}
                  disabled={saving === c.id}
                  className="shrink-0 rounded-xl bg-[var(--color-sage)] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {saving === c.id ? "Saving..." : "Mark reviewed"}
                </button>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
