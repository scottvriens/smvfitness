import { CheckInForm } from "@/components/client/CheckInForm";
import { Card, CardHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { requireProfile } from "@/lib/auth";
import { getCheckIns } from "@/lib/data";

export default async function CheckInPage() {
  const profile = await requireProfile("client");
  const checkIns = await getCheckIns(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Check-In</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          Weekly check-ins keep your program dialed in.
        </p>
      </div>

      <CheckInForm clientId={profile.id} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]/70">
          Past check-ins
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-sm text-[var(--color-charcoal)]/50">
            No check-ins yet — your first one will show up here once you submit it.
          </p>
        ) : (
          <div className="space-y-3">
            {checkIns.map((c) => {
              const answers = (c.answers ?? {}) as Record<string, string | number>;
              return (
                <Card key={c.id}>
                  <CardHeading
                    title={new Date(c.date).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    subtitle={c.weight_kg ? `${c.weight_kg} kg` : undefined}
                    action={
                      <Badge tone={c.coach_reviewed ? "sage" : "clay"}>
                        {c.coach_reviewed ? "Reviewed" : "Awaiting review"}
                      </Badge>
                    }
                  />
                  {typeof answers.notes === "string" && answers.notes && (
                    <p className="text-sm text-[var(--color-charcoal)]/75">
                      &ldquo;{answers.notes}&rdquo;
                    </p>
                  )}
                  {c.coach_comment && (
                    <div className="mt-3 rounded-lg bg-[var(--color-sage-light)]/25 px-3 py-2.5">
                      <p className="text-xs font-semibold text-[var(--color-olive-deep)]">
                        Coach reply
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--color-charcoal)]/80">
                        {c.coach_comment}
                      </p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
