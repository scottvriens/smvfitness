"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import type { Program } from "@/lib/types";
import { Card, CardHeading } from "@/components/ui/Card";
import clsx from "clsx";

export function ProgramView({ program }: { program: Program }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = program.days[activeDay];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {program.days.map((d, i) => (
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
            {d.dayLabel.split("—")[0].trim()}
          </button>
        ))}
      </div>

      <Card>
        <CardHeading title={day.dayLabel} subtitle={`${day.exercises.length} exercises`} />
        <div className="space-y-4">
          {day.exercises.map((ex) => (
            <ExerciseLogger key={ex.id} exercise={ex} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function ExerciseLogger({
  exercise,
}: {
  exercise: Program["days"][number]["exercises"][number];
}) {
  const [setsDone, setSetsDone] = useState<boolean[]>(
    Array.from({ length: exercise.targetSets }, () => false)
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
            {exercise.muscleGroup} · target {exercise.targetSets} × {exercise.targetReps}
            {exercise.targetRpe ? ` @ RPE ${exercise.targetRpe}` : ""}
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
