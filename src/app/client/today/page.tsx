import Link from "next/link";
import { Flame, Beef, Wheat, Droplet, ChevronRight } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { StatTile } from "@/components/ui/StatTile";
import { Badge } from "@/components/ui/Badge";
import { HabitChecklist } from "@/components/client/HabitChecklist";
import { currentClient, currentProgram, todaysHabits, nutritionTargets } from "@/lib/mock-data";

export default function TodayPage() {
  const todaysWorkout = currentProgram.days[0];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--color-charcoal)]/55">Thursday, August 20</p>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">
          Morning, {currentClient.name.split(" ")[0]}
        </h1>
      </div>

      <Card>
        <CardHeading
          title="Today's workout"
          subtitle={`${currentProgram.name} · ${currentProgram.weekLabel}`}
          action={<Badge tone="sage">{todaysWorkout.exercises.length} exercises</Badge>}
        />
        <ul className="mb-4 space-y-1.5">
          {todaysWorkout.exercises.map((ex) => (
            <li
              key={ex.id}
              className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-[var(--color-charcoal)]/80"
            >
              <span>{ex.name}</span>
              <span className="text-[var(--color-charcoal)]/45">
                {ex.targetSets} × {ex.targetReps}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/client/program"
          className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--color-sage)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {todaysWorkout.dayLabel}
          <ChevronRight size={15} />
        </Link>
      </Card>

      <HabitChecklist habits={todaysHabits} />

      <Card>
        <CardHeading title="Nutrition targets" subtitle="Set by your coach" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Calories" value={`${nutritionTargets.calories}`} icon={Flame} accent="var(--color-clay-deep)" />
          <StatTile label="Protein" value={`${nutritionTargets.proteinG}g`} icon={Beef} />
          <StatTile label="Carbs" value={`${nutritionTargets.carbsG}g`} icon={Wheat} accent="var(--color-clay)" />
          <StatTile label="Fat" value={`${nutritionTargets.fatG}g`} icon={Droplet} accent="var(--color-sage-deep)" />
        </div>
        <p className="mt-3 text-xs text-[var(--color-charcoal)]/45">
          Food logging and MyFitnessPal sync land in a later phase — for now, targets are set
          here by your coach.
        </p>
      </Card>
    </div>
  );
}
