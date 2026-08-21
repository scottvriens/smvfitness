import Link from "next/link";
import { ChevronRight, Users, AlertCircle, ClipboardCheck } from "lucide-react";
import { StatTile } from "@/components/ui/StatTile";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { clientRoster } from "@/lib/mock-data";
import type { ClientSummary } from "@/lib/types";

const statusConfig: Record<
  ClientSummary["checkInStatus"],
  { label: string; tone: "sage" | "clay" | "neutral" }
> = {
  reviewed: { label: "Reviewed", tone: "sage" },
  "needs-review": { label: "Needs review", tone: "clay" },
  overdue: { label: "Overdue", tone: "neutral" },
};

export default function CoachDashboardPage() {
  const needsReview = clientRoster.filter((c) => c.checkInStatus === "needs-review").length;
  const overdue = clientRoster.filter((c) => c.checkInStatus === "overdue").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Client dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          Everyone&apos;s status, at a glance.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Active clients" value={`${clientRoster.length}`} icon={Users} />
        <StatTile
          label="Need review"
          value={`${needsReview}`}
          icon={ClipboardCheck}
          accent="var(--color-clay-deep)"
        />
        <StatTile
          label="Overdue"
          value={`${overdue}`}
          icon={AlertCircle}
          accent="var(--color-olive-deep)"
        />
      </div>

      <div className="space-y-3">
        {clientRoster.map((client) => {
          const status = statusConfig[client.checkInStatus];
          return (
            <Link key={client.id} href={`/coach/clients/${client.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-clay)]/20 text-sm font-semibold text-[var(--color-clay-deep)]">
                    {client.avatarInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[var(--color-charcoal)]">
                        {client.name}
                      </p>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-[var(--color-charcoal)]/50">
                      {client.program} · last check-in{" "}
                      {client.lastCheckIn
                        ? new Date(client.lastCheckIn).toLocaleDateString("en-AU", {
                            day: "numeric",
                            month: "short",
                          })
                        : "—"}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <div className="w-28">
                        <ProgressBar value={client.habitAdherence} />
                      </div>
                      <span className="text-[11px] text-[var(--color-charcoal)]/50">
                        {client.habitAdherence}% adherence
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="shrink-0 text-[var(--color-charcoal)]/30" size={18} />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
