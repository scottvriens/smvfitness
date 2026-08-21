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

  const [weightHistory, checkIns, { data: habits }] = await Promise.all([
    getWeightHistory(clientId),
    getCheckIns(clientId),
    supabase.from("habits").select("id").eq("client_id", clientId).eq("active", true),
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

  return { profile, weightHistory, checkIns, habitAdherence, habitCount: habits?.length ?? 0 };
}
