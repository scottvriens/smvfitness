"use client";

import { useState } from "react";
import { Check, Beef, Moon, Footprints, GlassWater, Ban, type LucideIcon } from "lucide-react";
import type { Habit } from "@/lib/types";
import { Card, CardHeading } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";

const iconMap: Record<string, LucideIcon> = {
  Beef,
  Moon,
  Footprints,
  GlassWater,
  Ban,
};

export function HabitChecklist({ habits }: { habits: Habit[] }) {
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const pct = habits.length ? Math.round((completed.size / habits.length) * 100) : 0;

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
