import Link from "next/link";
import { Plus, Dumbbell, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { requireProfile } from "@/lib/auth";
import { getPrograms } from "@/lib/data";

export default async function ProgramsPage() {
  await requireProfile("coach");
  const programs = await getPrograms();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Programs</h1>
          <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
            Build training programs and assign them to your clients.
          </p>
        </div>
        <Link
          href="/coach/programs/new"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--color-sage)] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Plus size={16} />
          New program
        </Link>
      </div>

      {programs.length === 0 ? (
        <Card>
          <p className="text-sm text-[var(--color-charcoal)]/55">
            No programs yet. Create your first one and assign it to a client to get them training.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {programs.map((program) => (
            <Link key={program.id} href={`/coach/programs/${program.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-charcoal)]">
                      {program.name}
                    </p>
                    {program.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-[var(--color-charcoal)]/55">
                        {program.description}
                      </p>
                    )}
                    <div className="mt-2.5 flex items-center gap-3.5 text-xs text-[var(--color-charcoal)]/50">
                      <span className="flex items-center gap-1">
                        <Dumbbell size={13} />
                        {program.day_count} {program.day_count === 1 ? "day" : "days"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} />
                        {program.assigned_count} assigned
                      </span>
                      {program.week_label && <span>{program.week_label}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
