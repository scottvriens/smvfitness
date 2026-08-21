import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { WeightChart } from "@/components/client/WeightChart";
import { CheckInReviewList } from "@/components/coach/CheckInReviewList";
import { getClientDetail } from "@/lib/mock-data";

export default async function ClientDetailPage(props: PageProps<"/coach/clients/[id]">) {
  const { id } = await props.params;
  const detail = getClientDetail(id);
  if (!detail) notFound();

  const { summary, weightHistory, checkIns, habits } = detail;

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
          {summary.avatarInitials}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--color-charcoal)]">{summary.name}</h1>
          <p className="text-sm text-[var(--color-charcoal)]/55">{summary.program}</p>
        </div>
      </div>

      <Card>
        <CardHeading title="Bodyweight trend" />
        <WeightChart data={weightHistory} />
      </Card>

      <Card>
        <CardHeading title="Habit adherence" subtitle={`${habits.length} active habits tracked`} />
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--color-taupe-soft)]">
            <div
              className="h-full rounded-full bg-[var(--color-sage)]"
              style={{ width: `${summary.habitAdherence}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-[var(--color-charcoal)]">
            {summary.habitAdherence}%
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
