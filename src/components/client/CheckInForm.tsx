"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeading } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const scaleQuestions = [
  { id: "energy", label: "Energy levels this week" },
  { id: "sleepQuality", label: "Sleep quality" },
  { id: "adherence", label: "Nutrition & training adherence" },
];

export function CheckInForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [weight, setWeight] = useState("");
  const [scales, setScales] = useState<Record<string, number>>({
    energy: 3,
    sleepQuality: 3,
    adherence: 3,
  });
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return (
      <Card className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="text-[var(--color-sage-deep)]" size={36} />
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">Check-in submitted</p>
          <p className="mt-1 text-xs text-[var(--color-charcoal)]/55">
            Your coach will review it and get back to you here soon.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeading title="This week's check-in" subtitle="Takes about two minutes" />
      <form
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          setError(null);

          const supabase = createClient();
          const { error: insertError } = await supabase.from("checkin_submissions").insert({
            client_id: clientId,
            date: new Date().toISOString().slice(0, 10),
            weight_kg: Number(weight),
            answers: { ...scales, notes },
          });

          setSaving(false);
          if (insertError) {
            setError(insertError.message);
            return;
          }
          setSubmitted(true);
          router.refresh();
        }}
      >
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            Weigh-in (kg)
          </label>
          <input
            required
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="e.g. 81.8"
            className="w-full rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-sage)]"
          />
        </div>

        {scaleQuestions.map((q) => (
          <div key={q.id}>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-charcoal)]">{q.label}</label>
              <span className="text-sm font-semibold text-[var(--color-olive-deep)]">
                {scales[q.id]}/5
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={scales[q.id]}
              onChange={(e) =>
                setScales((prev) => ({ ...prev, [q.id]: Number(e.target.value) }))
              }
              className="w-full accent-[var(--color-sage)]"
            />
          </div>
        ))}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-charcoal)]">
            Anything your coach should know?
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Energy, soreness, life stress, wins from the week..."
            className="w-full resize-none rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm text-[var(--color-charcoal)] outline-none focus:border-[var(--color-sage)]"
          />
        </div>

        <div className="rounded-xl border border-dashed border-[var(--color-taupe)] p-3 text-xs text-[var(--color-charcoal)]/50">
          Progress photo upload will attach here — wiring up storage is one of the next build
          steps.
        </div>

        {error && (
          <p className="rounded-lg bg-[var(--color-clay)]/15 px-3 py-2 text-xs text-[var(--color-clay-deep)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-[var(--color-sage)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Submit check-in"}
        </button>
      </form>
    </Card>
  );
}
