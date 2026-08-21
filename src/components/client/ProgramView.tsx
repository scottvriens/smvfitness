"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import clsx from "clsx";
import type { ClientProgramDay, ClientProgramExercise } from "@/lib/data";

export function ProgramView({ days }: { days: ClientProgramDay[] }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = days[activeDay];

  if (!day) return null;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => (
          <button
            key={d.id}
            onClick={() => setActiveDay(i)}
            className={clsx(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              i === activeDay
                ? "bg-[var(--color-sage)] text-white"
                : "bg-white text-[var(--color-charcoal)]/65 border border-[var(--color-taupe)]"
            )}
          >
            {d.day_label.split("—")[0].trim()}
          </button>
        ))}
      </div>

      <Card>
        <CardHeading title={day.day_label} subtitle={`${day.exercises.length} exercises`} />
        {day.exercises.length === 0 ? (
          <p className="text-sm text-[var(--color-charcoal)]/55">No exercises added to this day yet.</p>
        ) : (
          <div className="space-y-4">
            {day.exercises.map((ex) => (
              <ExerciseLogger key={ex.id} exercise={ex} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ExerciseLogger({ exercise }: { exercise: ClientProgramExercise }) {
  const [setsDone, setSetsDone] = useState<boolean[]>(
    Array.from({ length: exercise.target_sets }, () => false)
  );

  const toggleSet = (idx: number) => {
    setSetsDone((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  return (
    <div className="rounded-xl border border-[var(--color-taupe)] p-3.5">
      <div className="mb-2.5 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">{exercise.name}</p>
          <p className="text-xs text-[var(--color-charcoal)]/50">
            {exercise.muscle_group} · target {exercise.target_sets} × {exercise.target_reps}
            {exercise.target_rpe ? ` @ RPE ${exercise.target_rpe}` : ""}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {setsDone.map((done, idx) => (
          <button
            key={idx}
            onClick={() => toggleSet(idx)}
            className={clsx(
              "flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-2.5 text-xs font-medium transition-colors",
              done
                ? "border-[var(--color-sage)] bg-[var(--color-sage-light)]/35 text-[var(--color-olive-deep)]"
                : "border-[var(--color-taupe)] bg-[var(--color-cream)] text-[var(--color-charcoal)]/60"
            )}
          >
            {done && <Check size={13} />}
            Set {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
