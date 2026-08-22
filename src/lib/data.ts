import { createClient } from "@/lib/supabase/server";

// Server-side data-fetching for every real (Supabase-backed) screen. Kept in
// one file since each function is small — split it up once this grows.

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// ---------------------------------------------------------------- Habits
export async function getTodayHabits(clientId: string) {
  const supabase = await createClient();
  const { data: habits } = await supabase
    .from("habits")
    .select("id, name, icon")
    .eq("client_id", clientId)
    .eq("active", true);

  if (!habits || habits.length === 0) return [];

  const { data: logs } = await supabase
    .from("habit_logs")
    .select("habit_id, completed")
    .eq("date", todayISO())
    .in(
      "habit_id",
      habits.map((h) => h.id)
    );

  const completedIds = new Set((logs ?? []).filter((l) => l.completed).map((l) => l.habit_id));

  return habits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    completedToday: completedIds.has(h.id),
  }));
}

// ------------------------------------------------------------ Nutrition
export async function getNutritionTargets(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("nutrition_targets")
    .select("calories, protein_g, carbs_g, fat_g")
    .eq("client_id", clientId)
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

// ------------------------------------------------------------- Check-ins
export async function getCheckIns(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkin_submissions")
    .select("*")
    .eq("client_id", clientId)
    .order("date", { ascending: false });

  return data ?? [];
}

// -------------------------------------------------------------- Progress
export async function getWeightHistory(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("checkin_submissions")
    .select("date, weight_kg")
    .eq("client_id", clientId)
    .not("weight_kg", "is", null)
    .order("date", { ascending: true });

  return (data ?? []).map((d) => ({ date: d.date as string, weightKg: Number(d.weight_kg) }));
}

// -------------------------------------------------------------- Messages
export async function getMessages(clientId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  return data ?? [];
}

// -------------------------------------------------------- Coach: roster
export async function getClientRoster() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("profiles")
    .select("id, name, avatar_initials")
    .eq("role", "client");

  if (!clients || clients.length === 0) return [];

  const roster = await Promise.all(
    clients.map(async (client) => {
      const [{ data: lastCheckIn }, { data: habits }] = await Promise.all([
        supabase
          .from("checkin_submissions")
          .select("date, coach_reviewed")
          .eq("client_id", client.id)
          .order("date", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("habits").select("id").eq("client_id", client.id).eq("active", true),
      ]);

      let habitAdherence = 0;
      if (habits && habits.length > 0) {
        const since = new Date();
        since.setDate(since.getDate() - 7);
        const { data: logs } = await supabase
          .from("habit_logs")
          .select("completed")
          .in(
            "habit_id",
            habits.map((h) => h.id)
          )
          .gte("date", since.toISOString().slice(0, 10));

        const total = logs?.length ?? 0;
        const done = logs?.filter((l) => l.completed).length ?? 0;
        habitAdherence = total > 0 ? Math.round((done / total) * 100) : 0;
      }

      let checkInStatus: "reviewed" | "needs-review" | "overdue" = "overdue";
      if (lastCheckIn) {
        const daysSince =
          (Date.now() - new Date(lastCheckIn.date).getTime()) / (1000 * 60 * 60 * 24);
        checkInStatus = lastCheckIn.coach_reviewed
          ? "reviewed"
          : daysSince > 10
            ? "overdue"
            : "needs-review";
      }

      return {
        id: client.id as string,
        name: client.name as string,
        avatarInitials: client.avatar_initials as string,
        lastCheckIn: lastCheckIn?.date ?? null,
        checkInStatus,
        habitAdherence,
      };
    })
  );

  return roster;
}

// ------------------------------------------------------- Coach: habits
export interface CoachHabit {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export async function getClientHabits(clientId: string): Promise<CoachHabit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("habits")
    .select("id, name, icon, active")
    .eq("client_id", clientId)
    .order("name", { ascending: true });

  return data ?? [];
}

// ---------------------------------------------------- Coach: client detail
export async function getClientDetailForCoach(clientId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, avatar_initials")
    .eq("id", clientId)
    .eq("role", "client")
    .maybeSingle();

  if (!profile) return null;

  const [weightHistory, checkIns, { data: habits }, { data: assignment }] = await Promise.all([
    getWeightHistory(clientId),
    getCheckIns(clientId),
    supabase.from("habits").select("id").eq("client_id", clientId).eq("active", true),
    supabase
      .from("program_assignments")
      .select("programs(id, name)")
      .eq("client_id", clientId)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let habitAdherence = 0;
  if (habits && habits.length > 0) {
    const since = new Date();
    since.setDate(since.getDate() - 7);
    const { data: logs } = await supabase
      .from("habit_logs")
      .select("completed")
      .in(
        "habit_id",
        habits.map((h) => h.id)
      )
      .gte("date", since.toISOString().slice(0, 10));
    const total = logs?.length ?? 0;
    const done = logs?.filter((l) => l.completed).length ?? 0;
    habitAdherence = total > 0 ? Math.round((done / total) * 100) : 0;
  }

  // Supabase returns the embedded relation as an object here since we scoped
  // to a single assignment row; cast past the array-shaped type it infers.
  const assignedProgram =
    (assignment?.programs as unknown as { id: string; name: string } | null) ?? null;

  return {
    profile,
    weightHistory,
    checkIns,
    habitAdherence,
    habitCount: habits?.length ?? 0,
    assignedProgram,
  };
}

// ---------------------------------------------------------- Programs (coach)
export interface ProgramListItem {
  id: string;
  name: string;
  description: string;
  phase_count: number;
  day_count: number;
  total_weeks: number;
  assigned_count: number;
}

export async function getPrograms(): Promise<ProgramListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select(
      "id, name, description, created_at, program_phases(id, duration_weeks, workout_days(id)), program_assignments(id)"
    )
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => {
    const phases = (p.program_phases as { id: string; duration_weeks: number; workout_days: { id: string }[] }[] | null) ?? [];
    return {
      id: p.id,
      name: p.name,
      description: p.description,
      phase_count: phases.length,
      day_count: phases.reduce((sum, ph) => sum + (ph.workout_days?.length ?? 0), 0),
      total_weeks: phases.reduce((sum, ph) => sum + (ph.duration_weeks ?? 0), 0),
      assigned_count: (p.program_assignments as { id: string }[] | null)?.length ?? 0,
    };
  });
}

export interface EditableExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  target_sets: number;
  target_reps: string;
  target_rpe: string | null;
  rest_seconds: number | null;
  order_index: number;
}

export interface EditableDayRow {
  id: string;
  day_label: string;
  day_index: number;
  exercises: EditableExerciseRow[];
}

export interface EditablePhaseRow {
  id: string;
  phase_label: string;
  phase_index: number;
  duration_weeks: number;
  days: EditableDayRow[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description: string;
  phases: EditablePhaseRow[];
  assignedClientIds: string[];
}

export async function getProgramDetail(programId: string): Promise<ProgramDetail | null> {
  const supabase = await createClient();
  // Nested embed is safe here (unlike the client-facing query below) — this
  // is a coach-only read, gated by the simple non-correlated is_coach() check
  // at every level, with no shadowing risk from a correlated subquery.
  const [{ data: program }, { data: assignments }] = await Promise.all([
    supabase
      .from("programs")
      .select(
        "id, name, description, program_phases(id, phase_label, phase_index, duration_weeks, days:workout_days(id, day_label, day_index, exercises(*)))"
      )
      .eq("id", programId)
      .maybeSingle(),
    supabase.from("program_assignments").select("client_id").eq("program_id", programId),
  ]);

  if (!program) return null;

  const phases = ((program.program_phases as EditablePhaseRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.phase_index - b.phase_index)
    .map((p) => ({
      ...p,
      days: (p.days as unknown as EditableDayRow[])
        .slice()
        .sort((a, b) => a.day_index - b.day_index)
        .map((d) => ({
          ...d,
          exercises: (d.exercises as unknown as EditableExerciseRow[])
            .slice()
            .sort((a, b) => a.order_index - b.order_index),
        })),
    }));

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    phases,
    assignedClientIds: (assignments ?? []).map((a) => a.client_id as string),
  };
}

export interface BasicClient {
  id: string;
  name: string;
  avatar_initials: string;
}

export async function getAllClientsBasic(): Promise<BasicClient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, name, avatar_initials")
    .eq("role", "client")
    .order("name");

  return data ?? [];
}

// --------------------------------------------------- Programs (client view)
export interface ClientProgramExercise {
  id: string;
  name: string;
  muscle_group: string;
  target_sets: number;
  target_reps: string;
  target_rpe: string | null;
  rest_seconds: number | null;
}

export interface ClientProgramDay {
  id: string;
  day_label: string;
  exercises: ClientProgramExercise[];
}

export interface ClientProgramPhase {
  id: string;
  phase_label: string;
  phase_index: number;
  duration_weeks: number;
  days: ClientProgramDay[];
}

export interface ClientProgram {
  name: string;
  description: string;
  phases: ClientProgramPhase[];
  currentPhaseId: string | null;
}

// Which phase is "now" for this client, purely from elapsed time since the
// program was assigned versus each phase's duration — e.g. assigned 9 weeks
// ago, phase 1 is 8 weeks, phase 2 is 8 weeks -> 9 weeks lands 1 week into
// phase 2. Once elapsed time runs past every phase, they stay parked on the
// last one rather than falling off the end.
function computeCurrentPhaseId(
  phases: { id: string; phase_index: number; duration_weeks: number }[],
  startDate: string
): string | null {
  if (phases.length === 0) return null;
  const sorted = phases.slice().sort((a, b) => a.phase_index - b.phase_index);

  const start = new Date(startDate + "T00:00:00Z").getTime();
  const now = Date.now();
  const elapsedWeeks = Math.max(0, Math.floor((now - start) / (7 * 24 * 60 * 60 * 1000)));

  let cumulative = 0;
  for (const phase of sorted) {
    cumulative += Math.max(phase.duration_weeks, 0);
    if (elapsedWeeks < cumulative) return phase.id;
  }
  return sorted[sorted.length - 1].id;
}

export async function getClientProgram(clientId: string): Promise<ClientProgram | null> {
  const supabase = await createClient();

  // Deliberately flat, sequential queries rather than one deep nested
  // PostgREST embed (program_assignments -> programs -> program_phases ->
  // workout_days -> exercises) — a 3-level embed relying on RLS exists-
  // subqueries at every level turned out to unreliably return nothing even
  // when the data and policies were correct, so each step below is its own
  // simple, RLS-checked query, matching the pattern the rest of this file
  // already uses. Plain selects only, sorted/picked in JS — chaining
  // .order()/.limit()/.maybeSingle() onto this specific query was silently
  // coming back empty even with correct data and RLS, so we stick to the
  // simplest possible query shape here rather than trust the fancier chain.
  const { data: assignments, error: assignmentError } = await supabase
    .from("program_assignments")
    .select("program_id, start_date")
    .eq("client_id", clientId);
  if (assignmentError) console.error("getClientProgram: assignment lookup failed", assignmentError);
  if (!assignments || assignments.length === 0) return null;

  const assignment = assignments.slice().sort((a, b) => (a.start_date < b.start_date ? 1 : -1))[0];

  const { data: programs, error: programError } = await supabase
    .from("programs")
    .select("name, description")
    .eq("id", assignment.program_id);
  if (programError) console.error("getClientProgram: program lookup failed", programError);
  const program = programs?.[0];
  if (!program) return null;

  const { data: phaseRows, error: phasesError } = await supabase
    .from("program_phases")
    .select("id, phase_label, phase_index, duration_weeks")
    .eq("program_id", assignment.program_id)
    .order("phase_index", { ascending: true });
  if (phasesError) console.error("getClientProgram: program_phases lookup failed", phasesError);
  const phases = phaseRows ?? [];
  if (phases.length === 0) {
    return { name: program.name, description: program.description, phases: [], currentPhaseId: null };
  }

  const phaseIds = phases.map((p) => p.id);
  const { data: days, error: daysError } = await supabase
    .from("workout_days")
    .select("id, day_label, day_index, phase_id")
    .in("phase_id", phaseIds)
    .order("day_index", { ascending: true });
  if (daysError) console.error("getClientProgram: workout_days lookup failed", daysError);

  const dayIds = (days ?? []).map((d) => d.id);
  let exercises: (EditableExerciseRow & { workout_day_id: string })[] = [];
  if (dayIds.length > 0) {
    const { data: exerciseRows, error: exercisesError } = await supabase
      .from("exercises")
      .select("*")
      .in("workout_day_id", dayIds)
      .order("order_index", { ascending: true });
    if (exercisesError) console.error("getClientProgram: exercises lookup failed", exercisesError);
    exercises = (exerciseRows as (EditableExerciseRow & { workout_day_id: string })[] | null) ?? [];
  }

  const exercisesByDay = new Map<string, ClientProgramExercise[]>();
  exercises.forEach((e) => {
    const list = exercisesByDay.get(e.workout_day_id) ?? [];
    list.push({
      id: e.id,
      name: e.name,
      muscle_group: e.muscle_group,
      target_sets: e.target_sets,
      target_reps: e.target_reps,
      target_rpe: e.target_rpe,
      rest_seconds: e.rest_seconds,
    });
    exercisesByDay.set(e.workout_day_id, list);
  });

  const daysByPhase = new Map<string, ClientProgramDay[]>();
  (days ?? []).forEach((d) => {
    const list = daysByPhase.get(d.phase_id) ?? [];
    list.push({ id: d.id, day_label: d.day_label, exercises: exercisesByDay.get(d.id) ?? [] });
    daysByPhase.set(d.phase_id, list);
  });

  const clientPhases: ClientProgramPhase[] = phases.map((p) => ({
    id: p.id,
    phase_label: p.phase_label,
    phase_index: p.phase_index,
    duration_weeks: p.duration_weeks,
    days: daysByPhase.get(p.id) ?? [],
  }));

  return {
    name: program.name,
    description: program.description,
    phases: clientPhases,
    currentPhaseId: computeCurrentPhaseId(phases, assignment.start_date),
  };
}

// ------------------------------------------------------ Weight logging
export interface LoggedSet {
  weight_kg: number | null;
  reps: number | null;
}

export interface LoggedExercise {
  exercise_id: string;
  exercise_name: string;
  sets: LoggedSet[];
}

export interface PreviousExerciseResult {
  date: string;
  sets: LoggedSet[];
}

// "What did you lift last time" — matched by exercise NAME rather than by
// program/day id, so this keeps working even after the coach edits a
// program (swaps an exercise, tweaks a day) instead of resetting history
// every time the underlying workout_day/exercise rows get recreated.
export async function getPreviousExerciseWeights(
  clientId: string,
  exerciseNames: string[]
): Promise<Record<string, PreviousExerciseResult>> {
  const uniqueNames = Array.from(new Set(exerciseNames));
  if (uniqueNames.length === 0) return {};

  const supabase = await createClient();
  const { data: logs, error } = await supabase
    .from("workout_logs")
    .select("date, exercise_logs")
    .eq("client_id", clientId)
    .lt("date", todayISO())
    .order("date", { ascending: false })
    .limit(30);
  if (error) console.error("getPreviousExerciseWeights: lookup failed", error);

  const remaining = new Set(uniqueNames);
  const result: Record<string, PreviousExerciseResult> = {};

  for (const log of logs ?? []) {
    if (remaining.size === 0) break;
    const entries = (log.exercise_logs as LoggedExercise[] | null) ?? [];
    for (const entry of entries) {
      if (remaining.has(entry.exercise_name)) {
        result[entry.exercise_name] = { date: log.date, sets: entry.sets ?? [] };
        remaining.delete(entry.exercise_name);
      }
    }
  }

  return result;
}

// Any workouts this client has already logged today, keyed by workout day —
// lets the page prefill inputs if they started (or already finished) a
// session earlier the same day rather than showing blank fields again.
export async function getTodayWorkoutLogs(
  clientId: string,
  workoutDayIds: string[]
): Promise<Record<string, LoggedExercise[]>> {
  if (workoutDayIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workout_logs")
    .select("workout_day_id, exercise_logs")
    .eq("client_id", clientId)
    .eq("date", todayISO())
    .in("workout_day_id", workoutDayIds);
  if (error) console.error("getTodayWorkoutLogs: lookup failed", error);

  const map: Record<string, LoggedExercise[]> = {};
  (data ?? []).forEach((row) => {
    if (row.workout_day_id) {
      map[row.workout_day_id] = (row.exercise_logs as LoggedExercise[] | null) ?? [];
    }
  });
  return map;
}
