import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Dumbbell } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { WeightChart } from "@/components/client/WeightChart";
import { CheckInReviewList } from "@/components/coach/CheckInReviewList";
import { requireProfile } from "@/lib/auth";
import { getClientDetailForCoach } from "@/lib/data";

export default async function ClientDetailPage(props: PageProps<"/coach/clients/[id]">) {
  await requireProfile("coach");
  const { id } = await props.params;
  const detail = await getClientDetailForCoach(id);
  if (!detail) notFound();

  const { profile, weightHistory, checkIns, habitAdherence, habitCount, assignedProgram } = detail;

  return (
    <div className="space-y-6">
      <Link
        href="/coach/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-charcoal)]/60 hover:text-[var(--color-charcoal)]"
      >
        <ArrowLeft size={15} />
        Back to dashboard
      </Link>

      <div className="flex items-center gap-3.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-clay)]/20 text-base font-semibold text-[var(--color-clay-deep)]">
          {profile.avatar_initials}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-charcoal)]">{profile.name}</h1>
        </div>
      </div>

      <Card>
        <CardHeading
          title="Training program"
          action={
            <Link
              href={assignedProgram ? `/coach/programs/${assignedProgram.id}` : "/coach/programs"}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-taupe)] px-3 py-1.5 text-xs font-medium text-[var(--color-olive-deep)] hover:bg-[var(--color-taupe-soft)]"
            >
              <Dumbbell size={13} />
              {assignedProgram ? "View / edit" : "Assign a program"}
            </Link>
          }
        />
        {assignedProgram ? (
          <div>
            <p className="text-sm font-medium text-[var(--color-charcoal)]">{assignedProgram.name}</p>
          </div>
        ) : (
          <p className="text-sm text-[var(--color-charcoal)]/55">No program assigned yet.</p>
        )}
      </Card>

      <Card>
        <CardHeading title="Bodyweight trend" />
        {weightHistory.length > 0 ? (
          <WeightChart data={weightHistory} />
        ) : (
          <p className="text-sm text-[var(--color-charcoal)]/55">No weigh-ins logged yet.</p>
        )}
      </Card>

      <Card>
        <CardHeading title="Habit adherence" subtitle={`${habitCount} active habits tracked`} />
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-taupe-soft)]">
            <div
              className="h-full rounded-full bg-[var(--color-sage)]"
              style={{ width: `${habitAdherence}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-[var(--color-charcoal)]">
            {habitAdherence}%
          </span>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]/70">Check-ins</h2>
        <CheckInReviewList checkIns={checkIns} />
      </div>
    </div>
  );
}
