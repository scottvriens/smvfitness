"use client";

import { useState } from "react";
import {
  Beef,
  Moon,
  Footprints,
  GlassWater,
  Ban,
  Dumbbell,
  Apple,
  Sun,
  BookOpen,
  Pill,
  Coffee,
  Smile,
  Plus,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { CoachHabit } from "@/lib/data";

// Keep this list's keys in sync with the iconMap in
// components/client/HabitChecklist.tsx — that's what renders these on the
// client's side once assigned.
const ICON_OPTIONS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "Beef", label: "Protein", Icon: Beef },
  { key: "Moon", label: "Sleep", Icon: Moon },
  { key: "Footprints", label: "Steps", Icon: Footprints },
  { key: "GlassWater", label: "Water", Icon: GlassWater },
  { key: "Ban", label: "Avoid", Icon: Ban },
  { key: "Dumbbell", label: "Training", Icon: Dumbbell },
  { key: "Apple", label: "Food", Icon: Apple },
  { key: "Sun", label: "Outdoors", Icon: Sun },
  { key: "BookOpen", label: "Journal", Icon: BookOpen },
  { key: "Pill", label: "Supplements", Icon: Pill },
  { key: "Coffee", label: "Caffeine", Icon: Coffee },
  { key: "Smile", label: "Mindset", Icon: Smile },
];

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  ICON_OPTIONS.map((o) => [o.key, o.Icon])
);

export function HabitManager({
  clientId,
  initialHabits,
}: {
  clientId: string;
  initialHabits: CoachHabit[];
}) {
  const [habits, setHabits] = useState<CoachHabit[]>(initialHabits);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(ICON_OPTIONS[0].key);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addHabit = async () => {
    if (!newName.trim()) {
      setError("Give the habit a name first.");
      return;
    }
    setError(null);
    setAdding(true);
    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("habits")
      .insert({ client_id: clientId, name: newName.trim(), icon: newIcon, active: true })
      .select("id, name, icon, active")
      .single();
    setAdding(false);
    if (insertError || !data) {
      setError(insertError?.message ?? "Could not add habit.");
      return;
    }
    setHabits((prev) => [...prev, data as CoachHabit]);
    setNewName("");
  };

  const toggleActive = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    const nextActive = !habit.active;

    setHabits((prev) => prev.map((h) => (h.id === habitId ? { ...h, active: nextActive } : h)));

    const supabase = createClient();
    supabase.from("habits").update({ active: nextActive }).eq("id", habitId).then();
  };

  const removeHabit = (habitId: string) => {
    if (!confirm("Remove this habit? Their past completion history for it will be deleted too.")) return;

    setHabits((prev) => prev.filter((h) => h.id !== habitId));

    const supabase = createClient();
    supabase.from("habits").delete().eq("id", habitId).then();
  };

  return (
    <Card>
      <CardHeading title="Habits" subtitle="Active habits show up on their dashboard today." />

      {habits.length > 0 && (
        <ul className="mb-4 space-y-2">
          {habits.map((habit) => {
            const Icon = iconMap[habit.icon] ?? Beef;
            return (
              <li
                key={habit.id}
                className={
                  "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors " +
                  (habit.active
                    ? "border-[var(--color-taupe)] bg-white"
                    : "border-[var(--color-taupe)] bg-[var(--color-taupe-soft)]/40")
                }
              >
                <button
                  onClick={() => toggleActive(habit.id)}
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors " +
                    (habit.active
                      ? "bg-[var(--color-sage)] text-white"
                      : "bg-[var(--color-taupe-soft)] text-[var(--color-charcoal)]/40")
                  }
                  aria-label={habit.active ? "Deactivate habit" : "Activate habit"}
                  title={habit.active ? "Active — tap to pause" : "Paused — tap to activate"}
                >
                  <Icon size={15} />
                </button>
                <span
                  className={
                    "flex-1 text-sm font-medium " +
                    (habit.active ? "text-[var(--color-charcoal)]" : "text-[var(--color-charcoal)]/45")
                  }
                >
                  {habit.name}
                </span>
                {!habit.active && (
                  <span className="text-xs text-[var(--color-charcoal)]/40">Paused</span>
                )}
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-charcoal)]/40 hover:bg-[var(--color-taupe-soft)] hover:text-[var(--color-clay-deep)]"
                  aria-label="Remove habit"
                >
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="rounded-xl border border-dashed border-[var(--color-taupe)] p-3.5">
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          {ICON_OPTIONS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setNewIcon(key)}
              title={label}
              aria-label={label}
              className={
                "flex h-8 w-8 items-center justify-center rounded-full border transition-colors " +
                (newIcon === key
                  ? "border-[var(--color-sage)] bg-[var(--color-sage-light)]/40 text-[var(--color-olive-deep)]"
                  : "border-[var(--color-taupe)] bg-white text-[var(--color-charcoal)]/50 hover:bg-[var(--color-taupe-soft)]")
              }
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g. 10,000 steps"
            className="flex-1 rounded-lg border border-[var(--color-taupe)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--color-sage)]"
          />
          <button
            onClick={addHabit}
            disabled={adding}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[var(--color-sage)] px-3.5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            <Plus size={15} />
            Add
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2.5 text-sm text-[var(--color-clay-deep)]">{error}</p>
      )}
    </Card>
  );
}
