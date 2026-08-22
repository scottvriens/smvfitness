"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GripVertical, Layers } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { ProgramDetail } from "@/lib/data";

interface EditableExercise {
  key: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string;
  targetRpe: string;
  restSeconds: string;
}

interface EditableDay {
  key: string;
  dayLabel: string;
  exercises: EditableExercise[];
}

interface EditablePhase {
  key: string;
  phaseLabel: string;
  durationWeeks: number;
  days: EditableDay[];
}

function newExercise(): EditableExercise {
  return {
    key: crypto.randomUUID(),
    name: "",
    muscleGroup: "",
    targetSets: 3,
    targetReps: "8-10",
    targetRpe: "",
    restSeconds: "90",
  };
}

function newDay(index: number): EditableDay {
  return {
    key: crypto.randomUUID(),
    dayLabel: `Day ${index + 1}`,
    exercises: [newExercise()],
  };
}

function newPhase(index: number): EditablePhase {
  return {
    key: crypto.randomUUID(),
    phaseLabel: `Phase ${index + 1}`,
    durationWeeks: 4,
    days: [newDay(0)],
  };
}

export function ProgramEditor({
  mode,
  programId,
  initialProgram,
}: {
  mode: "create" | "edit";
  programId?: string;
  initialProgram?: ProgramDetail;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialProgram?.name ?? "");
  const [description, setDescription] = useState(initialProgram?.description ?? "");
  const [phases, setPhases] = useState<EditablePhase[]>(
    initialProgram && initialProgram.phases.length > 0
      ? initialProgram.phases.map((p) => ({
          key: p.id,
          phaseLabel: p.phase_label,
          durationWeeks: p.duration_weeks,
          days: p.days.map((d) => ({
            key: d.id,
            dayLabel: d.day_label,
            exercises: d.exercises.map((e) => ({
              key: e.id,
              name: e.name,
              muscleGroup: e.muscle_group,
              targetSets: e.target_sets,
              targetReps: e.target_reps,
              targetRpe: e.target_rpe ?? "",
              restSeconds: e.rest_seconds != null ? String(e.rest_seconds) : "",
            })),
          })),
        }))
      : [newPhase(0)]
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalWeeks = phases.reduce((sum, p) => sum + (Number(p.durationWeeks) || 0), 0);

  const addPhase = () => setPhases((prev) => [...prev, newPhase(prev.length)]);
  const removePhase = (phaseKey: string) =>
    setPhases((prev) => prev.filter((p) => p.key !== phaseKey));
  const updatePhaseLabel = (phaseKey: string, phaseLabel: string) =>
    setPhases((prev) => prev.map((p) => (p.key === phaseKey ? { ...p, phaseLabel } : p)));
  const updatePhaseDuration = (phaseKey: string, durationWeeks: number) =>
    setPhases((prev) => prev.map((p) => (p.key === phaseKey ? { ...p, durationWeeks } : p)));

  const addDay = (phaseKey: string) =>
    setPhases((prev) =>
      prev.map((p) => (p.key === phaseKey ? { ...p, days: [...p.days, newDay(p.days.length)] } : p))
    );
  const removeDay = (phaseKey: string, dayKey: string) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.key === phaseKey ? { ...p, days: p.days.filter((d) => d.key !== dayKey) } : p
      )
    );
  const updateDayLabel = (phaseKey: string, dayKey: string, dayLabel: string) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.key === phaseKey
          ? { ...p, days: p.days.map((d) => (d.key === dayKey ? { ...d, dayLabel } : d)) }
          : p
      )
    );

  const addExercise = (phaseKey: string, dayKey: string) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.key === phaseKey
          ? {
              ...p,
              days: p.days.map((d) =>
                d.key === dayKey ? { ...d, exercises: [...d.exercises, newExercise()] } : d
              ),
            }
          : p
      )
    );
  const removeExercise = (phaseKey: string, dayKey: string, exKey: string) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.key === phaseKey
          ? {
              ...p,
              days: p.days.map((d) =>
                d.key === dayKey
                  ? { ...d, exercises: d.exercises.filter((e) => e.key !== exKey) }
                  : d
              ),
            }
          : p
      )
    );
  const updateExercise = (
    phaseKey: string,
    dayKey: string,
    exKey: string,
    patch: Partial<EditableExercise>
  ) =>
    setPhases((prev) =>
      prev.map((p) =>
        p.key === phaseKey
          ? {
              ...p,
              days: p.days.map((d) =>
                d.key === dayKey
                  ? {
                      ...d,
                      exercises: d.exercises.map((e) => (e.key === exKey ? { ...e, ...patch } : e)),
                    }
                  : d
              ),
            }
          : p
      )
    );

  const save = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Give the program a name first.");
      return;
    }
    if (phases.length === 0) {
      setError("Add at least one phase.");
      return;
    }
    for (const p of phases) {
      if (p.days.length === 0) {
        setError(`Phase "${p.phaseLabel || "Untitled"}" needs at least one training day.`);
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();

    try {
      let programRowId = programId;

      if (mode === "create") {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Not signed in.");

        const { data: program, error: programError } = await supabase
          .from("programs")
          .insert({ coach_id: user.id, name: name.trim(), description: description.trim() })
          .select("id")
          .single();
        if (programError || !program) throw programError ?? new Error("Could not create program.");
        programRowId = program.id;
      } else {
        const { error: updateError } = await supabase
          .from("programs")
          .update({ name: name.trim(), description: description.trim() })
          .eq("id", programRowId);
        if (updateError) throw updateError;

        // Simplest safe way to save edits: clear out the old phases (days and
        // exercises cascade-delete with them) and reinsert everything fresh
        // below.
        const { error: deleteError } = await supabase
          .from("program_phases")
          .delete()
          .eq("program_id", programRowId);
        if (deleteError) throw deleteError;
      }

      const { data: insertedPhases, error: phasesError } = await supabase
        .from("program_phases")
        .insert(
          phases.map((p, i) => ({
            program_id: programRowId,
            phase_label: p.phaseLabel.trim() || `Phase ${i + 1}`,
            phase_index: i,
            duration_weeks: Number(p.durationWeeks) || 1,
          }))
        )
        .select("id, phase_index");
      if (phasesError || !insertedPhases) throw phasesError ?? new Error("Could not save phases.");

      const phaseIdByIndex = new Map(insertedPhases.map((p) => [p.phase_index, p.id as string]));

      const allExerciseRows: {
        workout_day_id: string;
        name: string;
        muscle_group: string;
        target_sets: number;
        target_reps: string;
        target_rpe: string | null;
        rest_seconds: number | null;
        order_index: number;
      }[] = [];

      for (let phaseIdx = 0; phaseIdx < phases.length; phaseIdx++) {
        const phase = phases[phaseIdx];
        const phaseRowId = phaseIdByIndex.get(phaseIdx);
        if (!phaseRowId) continue;

        const { data: insertedDays, error: daysError } = await supabase
          .from("workout_days")
          .insert(
            phase.days.map((d, i) => ({
              phase_id: phaseRowId,
              day_label: d.dayLabel.trim() || `Day ${i + 1}`,
              day_index: i,
            }))
          )
          .select("id, day_index");
        if (daysError || !insertedDays) throw daysError ?? new Error("Could not save training days.");

        const dayIdByIndex = new Map(insertedDays.map((d) => [d.day_index, d.id as string]));

        phase.days.forEach((d, dayIdx) => {
          const workoutDayId = dayIdByIndex.get(dayIdx);
          if (!workoutDayId) return;
          d.exercises
            .filter((e) => e.name.trim())
            .forEach((e, exIdx) => {
              allExerciseRows.push({
                workout_day_id: workoutDayId,
                name: e.name.trim(),
                muscle_group: e.muscleGroup.trim(),
                target_sets: e.targetSets || 1,
                target_reps: e.targetReps.trim(),
                target_rpe: e.targetRpe.trim() || null,
                rest_seconds: e.restSeconds.trim() ? Number(e.restSeconds.trim()) || null : null,
                order_index: exIdx,
              });
            });
        });
      }

      if (allExerciseRows.length > 0) {
        const { error: exercisesError } = await supabase.from("exercises").insert(allExerciseRows);
        if (exercisesError) throw exercisesError;
      }

      router.push(`/coach/programs/${programRowId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving this program.");
      setSaving(false);
    }
  };

  const deleteProgram = async () => {
    if (!programId) return;
    if (!confirm("Delete this program? Clients it's assigned to will lose access to it.")) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase.from("programs").delete().eq("id", programId);
    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }
    router.push("/coach/programs");
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <Card>
        <CardHeading title="Program details" />
        <div className="space-y-3">
          <Field label="Program name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Strength Foundations"
              className="w-full rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
            />
          </Field>
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this block for?"
              rows={2}
              className="w-full resize-none rounded-xl border border-[var(--color-taupe)] bg-white px-3.5 py-2.5 text-sm outline-none focus:border-[var(--color-sage)]"
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-charcoal)]/50">
        <Layers size={13} />
        {phases.length} {phases.length === 1 ? "phase" : "phases"} · {totalWeeks} {totalWeeks === 1 ? "week" : "weeks"} total
      </div>

      <div className="space-y-5">
        {phases.map((phase, phaseIdx) => (
          <div key={phase.key} className="rounded-2xl border-2 border-[var(--color-sage)]/25 p-3.5">
            <div className="mb-3 flex items-center gap-2">
              <input
                value={phase.phaseLabel}
                onChange={(e) => updatePhaseLabel(phase.key, e.target.value)}
                placeholder={`Phase ${phaseIdx + 1}`}
                className="flex-1 rounded-lg border border-[var(--color-taupe)] bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-[var(--color-sage)]"
              />
              <div className="flex shrink-0 items-center gap-1.5">
                <input
                  type="number"
                  min={1}
                  value={phase.durationWeeks}
                  onChange={(e) => updatePhaseDuration(phase.key, Number(e.target.value) || 1)}
                  className="w-16 rounded-lg border border-[var(--color-taupe)] bg-white px-2 py-1.5 text-sm outline-none focus:border-[var(--color-sage)]"
                />
                <span className="text-xs text-[var(--color-charcoal)]/50">weeks</span>
              </div>
              {phases.length > 1 && (
                <button
                  onClick={() => removePhase(phase.key)}
                  className="shrink-0 rounded-lg p-1.5 text-[var(--color-charcoal)]/40 hover:bg-[var(--color-taupe-soft)] hover:text-[var(--color-clay-deep)]"
                  aria-label="Remove phase"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              {phase.days.map((day, dayIdx) => (
                <Card key={day.key}>
                  <div className="mb-3 flex items-center gap-2">
                    <GripVertical size={16} className="shrink-0 text-[var(--color-charcoal)]/25" />
                    <input
                      value={day.dayLabel}
                      onChange={(e) => updateDayLabel(phase.key, day.key, e.target.value)}
                      placeholder={`Day ${dayIdx + 1}`}
                      className="flex-1 rounded-lg border border-[var(--color-taupe)] bg-white px-3 py-1.5 text-sm font-semibold outline-none focus:border-[var(--color-sage)]"
                    />
                    {phase.days.length > 1 && (
                      <button
                        onClick={() => removeDay(phase.key, day.key)}
                        className="shrink-0 rounded-lg p-1.5 text-[var(--color-charcoal)]/40 hover:bg-[var(--color-taupe-soft)] hover:text-[var(--color-clay-deep)]"
                        aria-label="Remove day"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    {day.exercises.map((ex) => (
                      <div
                        key={ex.key}
                        className="grid grid-cols-12 gap-2 rounded-xl border border-[var(--color-taupe)] p-2.5"
                      >
                        <input
                          value={ex.name}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, { name: e.target.value })
                          }
                          placeholder="Exercise name"
                          className="col-span-12 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-3"
                        />
                        <input
                          value={ex.muscleGroup}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, { muscleGroup: e.target.value })
                          }
                          placeholder="Muscle group"
                          className="col-span-6 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-2"
                        />
                        <input
                          type="number"
                          min={1}
                          value={ex.targetSets}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, {
                              targetSets: Number(e.target.value) || 1,
                            })
                          }
                          placeholder="Sets"
                          className="col-span-2 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-1"
                        />
                        <input
                          value={ex.targetReps}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, { targetReps: e.target.value })
                          }
                          placeholder="Reps e.g. 8-10"
                          className="col-span-4 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-2"
                        />
                        <input
                          value={ex.targetRpe}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, { targetRpe: e.target.value })
                          }
                          placeholder="RPE"
                          className="col-span-4 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-1"
                        />
                        <input
                          type="number"
                          min={0}
                          step={5}
                          value={ex.restSeconds}
                          onChange={(e) =>
                            updateExercise(phase.key, day.key, ex.key, { restSeconds: e.target.value })
                          }
                          placeholder="Rest (sec)"
                          title="Rest between sets, in seconds"
                          className="col-span-4 rounded-lg border border-[var(--color-taupe)] bg-white px-2.5 py-1.5 text-sm outline-none focus:border-[var(--color-sage)] sm:col-span-2"
                        />
                        <button
                          onClick={() => removeExercise(phase.key, day.key, ex.key)}
                          className="col-span-4 flex items-center justify-center rounded-lg text-[var(--color-charcoal)]/40 hover:bg-[var(--color-taupe-soft)] hover:text-[var(--color-clay-deep)] sm:col-span-1"
                          aria-label="Remove exercise"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => addExercise(phase.key, day.key)}
                    className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--color-olive-deep)] hover:opacity-75"
                  >
                    <Plus size={15} />
                    Add exercise
                  </button>
                </Card>
              ))}
            </div>

            <button
              onClick={() => addDay(phase.key)}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-[var(--color-taupe)] py-2.5 text-sm font-medium text-[var(--color-charcoal)]/60 hover:bg-white"
            >
              <Plus size={15} />
              Add training day
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addPhase}
        className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-[var(--color-taupe)] py-3 text-sm font-medium text-[var(--color-charcoal)]/60 hover:bg-white"
      >
        <Plus size={15} />
        Add phase
      </button>

      {error && (
        <p className="rounded-xl bg-[var(--color-clay)]/15 px-3.5 py-2.5 text-sm text-[var(--color-clay-deep)]">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="flex-1 rounded-xl bg-[var(--color-sage)] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : mode === "create" ? "Create program" : "Save changes"}
        </button>
        {mode === "edit" && (
          <button
            onClick={deleteProgram}
            disabled={deleting}
            className="rounded-xl border border-[var(--color-taupe)] px-4 py-3 text-sm font-medium text-[var(--color-clay-deep)] hover:bg-white disabled:opacity-60"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-[var(--color-charcoal)]/60">{label}</span>
      {children}
    </label>
  );
}
