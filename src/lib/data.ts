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
      .select("programs(id, name, week_label)")
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
    (assignment?.programs as unknown as { id: string; name: string; week_label: string } | null) ?? null;

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
  week_label: string;
  day_count: number;
  assigned_count: number;
}

export async function getPrograms(): Promise<ProgramListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("programs")
    .select("id, name, description, week_label, created_at, workout_days(id), program_assignments(id)")
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    week_label: p.week_label,
    day_count: (p.workout_days as { id: string }[] | null)?.length ?? 0,
    assigned_count: (p.program_assignments as { id: string }[] | null)?.length ?? 0,
  }));
}

export interface EditableExerciseRow {
  id: string;
  name: string;
  muscle_group: string;
  target_sets: number;
  target_reps: string;
  target_rpe: string | null;
  order_index: number;
}

export interface EditableDayRow {
  id: string;
  day_label: string;
  day_index: number;
  exercises: EditableExerciseRow[];
}

export interface ProgramDetail {
  id: string;
  name: string;
  description: string;
  week_label: string;
  days: EditableDayRow[];
  assignedClientIds: string[];
}

export async function getProgramDetail(programId: string): Promise<ProgramDetail | null> {
  const supabase = await createClient();
  const [{ data: program }, { data: assignments }] = await Promise.all([
    supabase
      .from("programs")
      .select("id, name, description, week_label, workout_days(id, day_label, day_index, exercises(*))")
      .eq("id", programId)
      .maybeSingle(),
    supabase.from("program_assignments").select("client_id").eq("program_id", programId),
  ]);

  if (!program) return null;

  const days = ((program.workout_days as EditableDayRow[] | null) ?? [])
    .slice()
    .sort((a, b) => a.day_index - b.day_index)
    .map((d) => ({
      ...d,
      exercises: (d.exercises as unknown as EditableExerciseRow[])
        .slice()
        .sort((a, b) => a.order_index - b.order_index),
    }));

  return {
    id: program.id,
    name: program.name,
    description: program.description,
    week_label: program.week_label,
    days,
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
}

export interface ClientProgramDay {
  id: string;
  day_label: string;
  exercises: ClientProgramExercise[];
}

export interface ClientProgram {
  name: string;
  description: string;
  week_label: string;
  days: ClientProgramDay[];
}

export async function getClientProgram(clientId: string): Promise<ClientProgram | null> {
  const supabase = await createClient();

  // Deliberately flat, sequential queries rather than one deep nested
  // PostgREST embed (program_assignments -> programs -> workout_days ->
  // exercises) — a 3-level embed relying on RLS exists-subqueries at every
  // level turned out to unreliably return nothing even when the data and
  // policies were correct, so each step below is its own simple, RLS-checked
  // query, matching the pattern the rest of this file already uses.
  const { data: assignment, error: assignmentError } = await supabase
    .from("program_assignments")
    .select("program_id")
    .eq("client_id", clientId)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (assignmentError) console.error("getClientProgram: assignment lookup failed", assignmentError);
  if (!assignment) return null;

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("name, description, week_label")
    .eq("id", assignment.program_id)
    .maybeSingle();
  if (programError) console.error("getClientProgram: program lookup failed", programError);
  if (!program) return null;

  const { data: days, error: daysError } = await supabase
    .from("workout_days")
    .select("id, day_label, day_index")
    .eq("program_id", assignment.program_id)
    .order("day_index", { ascending: true });
  if (daysError) console.error("getClientProgram: workout_days lookup failed", daysError);

  const dayIds = (days ?? []).map((d) => d.id);
  let exercises: EditableExerciseRow[] = [];
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
    const workoutDayId = (e as unknown as { workout_day_id: string }).workout_day_id;
    const list = exercisesByDay.get(workoutDayId) ?? [];
    list.push({
      id: e.id,
      name: e.name,
      muscle_group: e.muscle_group,
      target_sets: e.target_sets,
      target_reps: e.target_reps,
      target_rpe: e.target_rpe,
    });
    exercisesByDay.set(workoutDayId, list);
  });

  return {
    name: program.name,
    description: program.description,
    week_label: program.week_label,
    days: (days ?? []).map((d) => ({
      id: d.id,
      day_label: d.day_label,
      exercises: exercisesByDay.get(d.id) ?? [],
    })),
  };
}
