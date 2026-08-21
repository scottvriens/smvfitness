// Core data model for SMV Fitness.
// This mirrors the shape described in the product spec (Section 5) so it maps
// cleanly onto real database tables later.

export type UserRole = "coach" | "client";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
  avatarInitials: string;
  joinedDate: string; // ISO date
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: string; // e.g. "8-10"
  targetRpe?: string;
  notes?: string;
}

export interface WorkoutDay {
  id: string;
  dayLabel: string; // e.g. "Day 1 - Upper Body"
  exercises: Exercise[];
}

export interface Program {
  id: string;
  name: string;
  description: string;
  weekLabel: string; // e.g. "Week 6 of 12"
  days: WorkoutDay[];
}

export interface LoggedSet {
  setIndex: number;
  reps: number | null;
  weightKg: number | null;
  completed: boolean;
}

export interface ExerciseLog {
  exerciseId: string;
  sets: LoggedSet[];
}

export interface WorkoutLog {
  id: string;
  clientId: string;
  workoutDayId: string;
  date: string;
  exerciseLogs: ExerciseLog[];
  completed: boolean;
}

export interface Habit {
  id: string;
  clientId: string;
  name: string;
  icon: string; // lucide icon name
  active: boolean;
}

export interface HabitLog {
  habitId: string;
  date: string; // ISO date
  completed: boolean;
}

export interface CheckInQuestion {
  id: string;
  label: string;
  type: "scale" | "text";
}

export interface CheckInTemplate {
  id: string;
  name: string;
  questions: CheckInQuestion[];
}

export interface CheckInSubmission {
  id: string;
  clientId: string;
  date: string;
  weightKg: number;
  measurements?: Record<string, number>;
  answers: Record<string, string | number>;
  coachReviewed: boolean;
  coachComment?: string;
}

export interface BodyMetricEntry {
  date: string;
  weightKg: number;
}

export interface ProgressPhoto {
  id: string;
  clientId: string;
  date: string;
  angle: "front" | "side" | "back";
  colorSwatch: string; // placeholder visual until real photo uploads exist
}

export interface NutritionTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Message {
  id: string;
  clientId: string;
  senderRole: UserRole;
  body: string;
  timestamp: string;
}

export interface ClientSummary {
  id: string;
  name: string;
  avatarInitials: string;
  program: string;
  lastCheckIn: string | null;
  checkInStatus: "reviewed" | "needs-review" | "overdue";
  habitAdherence: number; // 0-100
  weightTrendKg: number; // change over last 4 weeks
}
