"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import clsx from "clsx";
import { Card, CardHeading } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type {
  ClientProgramDay,
  ClientProgramExercise,
  LoggedExercise,
  LoggedSet,
  PreviousExerciseResult,
} from "@/lib/data";

type DayLogs = Record<string, LoggedSet[]>; // exercise id -> sets

function buildDefaultSets(exercise: ClientProgramExercise): LoggedSet[] {
  return Array.from({ length: Math.max(exercise.target_sets, 1) }, () => ({
    weight_kg: null,
    reps: null,
  }));
}

function buildInitialLogs(
  days: ClientProgramDay[],
  todayLogs: Record<string, LoggedExercise[]>
): Record<string, DayLogs> {
  const result: Record<string, DayLogs> = {};
  for (const day of days) {
    const existing = todayLogs[day.id] ?? [];
    const byExerciseId = new Map(existing.map((e) => [e.exercise_id, e.sets]));
    const dayLogs: DayLogs = {};
    for (const ex of day.exercises) {
      dayLogs[ex.id] = byExerciseId.get(ex.id) ?? buildDefaultSets(ex);
    }
    result[day.id] = dayLogs;
  }
  return result;
}

function formatRest(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return rem === 0 ? `${mins}m` : `${mins}m ${rem}s`;
}

export function ProgramView({
  days,
  clientId,
  previousWeights,
  todayLogs,
}: {
  days: ClientProgramDay[];
  clientId: string;
  previousWeights: Record<string, PreviousExerciseResult>;
  todayLogs: Record<string, LoggedExercise[]>;
}) {
  const [activeDay, setActiveDay] = useState(0);
  const [logs, setLogs] = useState<Record<string, DayLogs>>(() => buildInitialLogs(days, todayLogs));

  const day = days[activeDay];
  if (!day) return null;

  const updateSet = (exerciseId: string, setIndex: number, patch: Partial<LoggedSet>) => {
    setLogs((prev) => {
      const dayLogs = prev[day.id] ?? {};
      const sets = dayLogs[exerciseId] ?? [];
      const nextSets = sets.map((s, i) => (i === setIndex ? { ...s, ...patch } : s));
      return { ...prev, [day.id]: { ...dayLogs, [exerciseId]: nextSets } };
    });
  };

  const saveDay = async () => {
    const dayLogs = logs[day.id] ?? {};
    const exerciseLogs: LoggedExercise[] = day.exercises.map((ex) => ({
      exercise_id: ex.id,
      exercise_name: ex.name,
      sets: dayLogs[ex.id] ?? buildDefaultSets(ex),
    }));

    const supabase = createClient();
    const today = new Date().toISOString().slice(0, 10);
    await supabase.from("workout_logs").upsert(
      {
        client_id: clientId,
        workout_day_id: day.id,
        date: today,
        exercise_logs: exerciseLogs,
      },
      { onConflict: "client_id,workout_day_id,date" }
    );
  };

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
              <ExerciseLogger
                key={ex.id}
                exercise={ex}
                sets={logs[day.id]?.[ex.id] ?? buildDefaultSets(ex)}
                previous={previousWeights[ex.name]}
                onSetChange={(setIndex, patch) => updateSet(ex.id, setIndex, patch)}
                onBlurSave={saveDay}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function ExerciseLogger({
  exercise,
  sets,
  previous,
  onSetChange,
  onBlurSave,
}: {
  exercise: ClientProgramExercise;
  sets: LoggedSet[];
  previous: PreviousExerciseResult | undefined;
  onSetChange: (setIndex: number, patch: Partial<LoggedSet>) => void;
  onBlurSave: () => void;
}) {
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (timerSeconds === null) return;
    if (timerSeconds <= 0) {
      const id = setTimeout(() => setTimerSeconds(null), 800);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setTimerSeconds((s) => (s !== null ? s - 1 : null)), 1000);
    return () => clearTimeout(id);
  }, [timerSeconds]);

  const startTimer = () => {
    if (!exercise.rest_seconds) return;
    setTimerSeconds(exercise.rest_seconds);
  };

  const previousText =
    previous && previous.sets.some((s) => s.weight_kg != null || s.reps != null)
      ? previous.sets.map((s) => `${s.weight_kg ?? "–"}kg × ${s.reps ?? "–"}`).join(", ")
      : null;

  return (
    <div className="rounded-xl border border-[var(--color-taupe)] p-3.5">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-charcoal)]">{exercise.name}</p>
          <p className="text-xs text-[var(--color-charcoal)]/50">
            {exercise.muscle_group} · target {exercise.target_sets} × {exercise.target_reps}
            {exercise.target_rpe ? ` @ RPE ${exercise.target_rpe}` : ""}
          </p>
          {previousText && (
            <p className="mt-1 text-xs text-[var(--color-olive-deep)]">Last time: {previousText}</p>
          )}
        </div>
        {exercise.rest_seconds ? (
          <button
            onClick={startTimer}
            className={clsx(
              "flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              timerSeconds != null
                ? "border-[var(--color-sage)] bg-[var(--color-sage-light)]/40 text-[var(--color-olive-deep)]"
                : "border-[var(--color-taupe)] bg-white text-[var(--color-charcoal)]/60 hover:bg-[var(--color-taupe-soft)]"
            )}
          >
            <Clock size={12} />
            {timerSeconds != null ? `${timerSeconds}s` : formatRest(exercise.rest_seconds)}
          </button>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-[2.5rem_1fr_1fr] gap-2 px-1 text-[10px] font-medium uppercase tracking-wide text-[var(--color-charcoal)]/40">
          <span>Set</span>
          <span>Weight (kg)</span>
          <span>Reps</span>
        </div>
        {sets.map((set, idx) => (
          <div key={idx} className="grid grid-cols-[2.5rem_1fr_1fr] items-center gap-2">
            <span className="text-xs font-medium text-[var(--color-charcoal)]/50">{idx + 1}</span>
            <input
              type="number"
              inputMode="decimal"
              step="0.5"
              value={set.weight_kg ?? ""}
              onChange={(e) =>
                onSetChange(idx, { weight_kg: e.target.value === "" ? null : Number(e.target.value) })
              }
              onBlur={onBlurSave}
              placeholder={previous?.sets[idx]?.weight_kg != null ? String(previous.sets[idx].weight_kg) : "–"}
              className="rounded-lg border border-[var(--color-taupe)] bg-[var(--color-cream)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] focus:bg-white"
            />
            <input
              type="number"
              inputMode="numeric"
              value={set.reps ?? ""}
              onChange={(e) =>
                onSetChange(idx, { reps: e.target.value === "" ? null : Number(e.target.value) })
              }
              onBlur={onBlurSave}
              placeholder={previous?.sets[idx]?.reps != null ? String(previous.sets[idx].reps) : "–"}
              className="rounded-lg border border-[var(--color-taupe)] bg-[var(--color-cream)] px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] focus:bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
