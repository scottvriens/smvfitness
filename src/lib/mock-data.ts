import type {
  BodyMetricEntry,
  CheckInSubmission,
  ClientSummary,
  Habit,
  HabitLog,
  Message,
  NutritionTargets,
  Program,
  ProgressPhoto,
  User,
} from "./types";

// The signed-in client for the /client preview.
export const currentClient: User = {
  id: "client-jordan",
  role: "client",
  name: "Jordan Reyes",
  email: "jordan@example.com",
  avatarInitials: "JR",
  joinedDate: "2026-03-02",
};

export const coachUser: User = {
  id: "coach-scott",
  role: "coach",
  name: "Scott Vriens",
  email: "scottvriens14@gmail.com",
  avatarInitials: "SV",
  joinedDate: "2024-01-01",
};

export const currentProgram: Program = {
  id: "prog-strength-1",
  name: "Strength Foundations",
  description: "12-week progressive strength block focused on the big compound lifts.",
  weekLabel: "Week 6 of 12",
  days: [
    {
      id: "day-1",
      dayLabel: "Day 1 — Upper Body Push",
      exercises: [
        { id: "ex-1", name: "Barbell Bench Press", muscleGroup: "Chest", targetSets: 4, targetReps: "6-8", targetRpe: "8" },
        { id: "ex-2", name: "Seated Dumbbell Shoulder Press", muscleGroup: "Shoulders", targetSets: 3, targetReps: "8-10" },
        { id: "ex-3", name: "Incline Dumbbell Press", muscleGroup: "Chest", targetSets: 3, targetReps: "10-12" },
        { id: "ex-4", name: "Cable Triceps Pushdown", muscleGroup: "Triceps", targetSets: 3, targetReps: "12-15" },
      ],
    },
    {
      id: "day-2",
      dayLabel: "Day 2 — Lower Body",
      exercises: [
        { id: "ex-5", name: "Back Squat", muscleGroup: "Legs", targetSets: 4, targetReps: "5-6", targetRpe: "8" },
        { id: "ex-6", name: "Romanian Deadlift", muscleGroup: "Hamstrings", targetSets: 3, targetReps: "8-10" },
        { id: "ex-7", name: "Walking Lunge", muscleGroup: "Legs", targetSets: 3, targetReps: "12/leg" },
        { id: "ex-8", name: "Standing Calf Raise", muscleGroup: "Calves", targetSets: 4, targetReps: "12-15" },
      ],
    },
    {
      id: "day-3",
      dayLabel: "Day 3 — Upper Body Pull",
      exercises: [
        { id: "ex-9", name: "Weighted Pull-Up", muscleGroup: "Back", targetSets: 4, targetReps: "6-8" },
        { id: "ex-10", name: "Barbell Row", muscleGroup: "Back", targetSets: 3, targetReps: "8-10" },
        { id: "ex-11", name: "Face Pull", muscleGroup: "Rear Delts", targetSets: 3, targetReps: "15" },
        { id: "ex-12", name: "Barbell Curl", muscleGroup: "Biceps", targetSets: 3, targetReps: "10-12" },
      ],
    },
  ],
};

export const todaysHabits: Habit[] = [
  { id: "habit-1", clientId: currentClient.id, name: "Hit protein target", icon: "Beef", active: true },
  { id: "habit-2", clientId: currentClient.id, name: "8+ hours sleep", icon: "Moon", active: true },
  { id: "habit-3", clientId: currentClient.id, name: "10,000 steps", icon: "Footprints", active: true },
  { id: "habit-4", clientId: currentClient.id, name: "2L water", icon: "GlassWater", active: true },
  { id: "habit-5", clientId: currentClient.id, name: "No alcohol", icon: "Ban", active: true },
];

// Last 7 days of habit completion, most recent last (today).
export const habitLogs: HabitLog[] = (() => {
  const logs: HabitLog[] = [];
  const today = new Date("2026-08-20");
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    todaysHabits.forEach((habit, idx) => {
      // deterministic-ish pseudo-random completion pattern for a believable demo
      const completed = (idx + i) % 3 !== 0;
      logs.push({ habitId: habit.id, date: dateStr, completed: i === 0 ? false : completed });
    });
  }
  return logs;
})();

export const nutritionTargets: NutritionTargets = {
  calories: 2400,
  proteinG: 180,
  carbsG: 260,
  fatG: 70,
};

export const weightHistory: BodyMetricEntry[] = [
  { date: "2026-06-25", weightKg: 84.6 },
  { date: "2026-07-02", weightKg: 84.1 },
  { date: "2026-07-09", weightKg: 83.9 },
  { date: "2026-07-16", weightKg: 83.4 },
  { date: "2026-07-23", weightKg: 83.2 },
  { date: "2026-07-30", weightKg: 82.7 },
  { date: "2026-08-06", weightKg: 82.5 },
  { date: "2026-08-13", weightKg: 82.1 },
];

export const progressPhotos: ProgressPhoto[] = [
  { id: "photo-1", clientId: currentClient.id, date: "2026-06-25", angle: "front", colorSwatch: "var(--color-taupe-soft)" },
  { id: "photo-2", clientId: currentClient.id, date: "2026-06-25", angle: "side", colorSwatch: "var(--color-taupe)" },
  { id: "photo-3", clientId: currentClient.id, date: "2026-07-23", angle: "front", colorSwatch: "var(--color-sage-light)" },
  { id: "photo-4", clientId: currentClient.id, date: "2026-07-23", angle: "side", colorSwatch: "var(--color-sage)" },
  { id: "photo-5", clientId: currentClient.id, date: "2026-08-13", angle: "front", colorSwatch: "var(--color-clay)" },
  { id: "photo-6", clientId: currentClient.id, date: "2026-08-13", angle: "side", colorSwatch: "var(--color-clay-deep)" },
];

export const checkInHistory: CheckInSubmission[] = [
  {
    id: "checkin-1",
    clientId: currentClient.id,
    date: "2026-08-13",
    weightKg: 82.1,
    measurements: { waist: 84.5, chest: 102 },
    answers: {
      energy: 4,
      sleepQuality: 4,
      adherence: 5,
      notes: "Felt strong this week, hit a new bench PR on Monday.",
    },
    coachReviewed: true,
    coachComment: "Awesome week Jordan — that bench PR shows. Let's nudge sleep a little earlier before the deload.",
  },
  {
    id: "checkin-2",
    clientId: currentClient.id,
    date: "2026-08-06",
    weightKg: 82.5,
    measurements: { waist: 85, chest: 101.5 },
    answers: {
      energy: 3,
      sleepQuality: 3,
      adherence: 4,
      notes: "Busy week at work, missed one session but nutrition stayed on track.",
    },
    coachReviewed: true,
    coachComment: "No worries on the missed session — good call prioritising sleep instead.",
  },
  {
    id: "checkin-3",
    clientId: currentClient.id,
    date: "2026-07-30",
    weightKg: 82.7,
    measurements: { waist: 85.5, chest: 101 },
    answers: { energy: 4, sleepQuality: 4, adherence: 5, notes: "Solid week, no issues." },
    coachReviewed: true,
  },
];

export const messages: Message[] = [
  { id: "msg-1", clientId: currentClient.id, senderRole: "coach", body: "Great check-in this week — that bench PR is awesome. Keep the momentum going into the deload.", timestamp: "2026-08-14T09:12:00" },
  { id: "msg-2", clientId: currentClient.id, senderRole: "client", body: "Thanks Scott! Feeling good, ready for next week.", timestamp: "2026-08-14T10:03:00" },
  { id: "msg-3", clientId: currentClient.id, senderRole: "coach", body: "Quick one — how's the left shoulder feeling after Tuesday's press session?", timestamp: "2026-08-18T07:40:00" },
];

// Coach dashboard client roster
export const clientRoster: ClientSummary[] = [
  { id: "client-jordan", name: "Jordan Reyes", avatarInitials: "JR", program: "Strength Foundations", lastCheckIn: "2026-08-13", checkInStatus: "reviewed", habitAdherence: 86, weightTrendKg: -2.5 },
  { id: "client-mia", name: "Mia Thompson", avatarInitials: "MT", program: "Fat Loss Phase 2", lastCheckIn: "2026-08-18", checkInStatus: "needs-review", habitAdherence: 74, weightTrendKg: -1.8 },
  { id: "client-liam", name: "Liam Carter", avatarInitials: "LC", program: "Hypertrophy Block", lastCheckIn: "2026-08-11", checkInStatus: "needs-review", habitAdherence: 91, weightTrendKg: 0.6 },
  { id: "client-ava", name: "Ava Nguyen", avatarInitials: "AN", program: "Strength Foundations", lastCheckIn: "2026-08-04", checkInStatus: "overdue", habitAdherence: 52, weightTrendKg: -0.4 },
  { id: "client-noah", name: "Noah Patel", avatarInitials: "NP", program: "Return to Training", lastCheckIn: "2026-08-17", checkInStatus: "reviewed", habitAdherence: 95, weightTrendKg: -3.1 },
];

// Derives a believable detail view for any roster client. Jordan (the client
// preview user) gets the fully hand-authored dataset above; everyone else
// gets a deterministic synthetic series so the coach dashboard's drill-down
// works for the whole roster in this preview build.
export function getClientDetail(clientId: string) {
  const summary = clientRoster.find((c) => c.id === clientId);
  if (!summary) return null;

  if (clientId === currentClient.id) {
    return {
      summary,
      weightHistory,
      checkIns: checkInHistory,
      habits: todaysHabits,
    };
  }

  const seed = summary.name.length;
  const startWeight = 70 + seed * 1.7;
  const endWeight = startWeight + summary.weightTrendKg;
  const syntheticWeights: BodyMetricEntry[] = weightHistory.map((entry, i) => {
    const progress = i / (weightHistory.length - 1);
    return {
      date: entry.date,
      weightKg: Math.round((startWeight + (endWeight - startWeight) * progress) * 10) / 10,
    };
  });

  const syntheticCheckIns: CheckInSubmission[] = checkInHistory.map((c, i) => ({
    ...c,
    id: `${clientId}-${c.id}`,
    clientId,
    weightKg: syntheticWeights[syntheticWeights.length - 1 - i]?.weightKg ?? syntheticWeights[0].weightKg,
    coachReviewed: summary.checkInStatus === "reviewed" || i > 0,
    coachComment: summary.checkInStatus === "reviewed" || i > 0 ? c.coachComment : undefined,
    answers: { energy: c.answers.energy, sleepQuality: c.answers.sleepQuality, adherence: c.answers.adherence },
  }));

  return {
    summary,
    weightHistory: syntheticWeights,
    checkIns: syntheticCheckIns,
    habits: todaysHabits.map((h) => ({ ...h, clientId })),
  };
}
