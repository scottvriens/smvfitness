"use client";

import { useState, useTransition } from "react";
import { Check, Beef, Moon, Footprints, GlassWater, Ban, type LucideIcon } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/client";

const iconMap: Record<string, LucideIcon> = {
  Beef,
  Moon,
  Footprints,
  GlassWater,
  Ban,
};

export interface TodayHabit {
  id: string;
  name: string;
  icon: string;
  completedToday: boolean;
}

export function HabitChecklist({ habits }: { habits: TodayHabit[] }) {
  const [completed, setCompleted] = useState<Set<string>>(
    new Set(habits.filter((h) => h.completedToday).map((h) => h.id))
  );
  const [, startTransition] = useTransition();

  const toggle = (habitId: string) => {
    const willBeCompleted = !completed.has(habitId);

    // Optimistic update — flip it in the UI immediately, save in the background.
    setCompleted((prev) => {
      const next = new Set(prev);
      willBeCompleted ? next.add(habitId) : next.delete(habitId);
      return next;
    });

    startTransition(async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      await supabase
        .from("habit_logs")
        .upsert(
          { habit_id: habitId, date: today, completed: willBeCompleted },
          { onConflict: "habit_id,date" }
        );
    });
  };

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeading title="Today's habits" />
        <p className="text-sm text-[var(--color-charcoal)]/55">
          No habits set up yet — your coach adds these for you.
        </p>
      </Card>
    );
  }

  const pct = Math.round((completed.size / habits.length) * 100);

  return (
    <Card>
      <CardHeading
        title="Today's habits"
        subtitle={`${completed.size} of ${habits.length} done`}
      />
      <ProgressBar value={completed.size} max={habits.length} />
      <ul className="mt-4 space-y-2">
        {habits.map((habit) => {
          const Icon = iconMap[habit.icon] ?? Check;
          const done = completed.has(habit.id);
          return (
            <li key={habit.id}>
              <button
                onClick={() => toggle(habit.id)}
                className={
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors " +
                  (done
                    ? "border-[var(--color-sage)] bg-[var(--color-sage-light)]/30"
                    : "border-[var(--color-taupe)] bg-white hover:bg-[var(--color-taupe-soft)]/50")
                }
              >
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full " +
                    (done
                      ? "bg-[var(--color-sage)] text-white"
                      : "bg-[var(--color-taupe-soft)] text-[var(--color-charcoal)]/50")
                  }
                >
                  {done ? <Check size={16} /> : <Icon size={15} />}
                </span>
                <span
                  className={
                    "text-sm font-medium " +
                    (done ? "text-[var(--color-olive-deep)] line-through decoration-1" : "text-[var(--color-charcoal)]")
                  }
                >
                  {habit.name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {pct === 100 && habits.length > 0 && (
        <p className="mt-3 text-center text-xs font-medium text-[var(--color-olive-deep)]">
          All habits done for today — nice work.
        </p>
      )}
    </Card>
  );
}
