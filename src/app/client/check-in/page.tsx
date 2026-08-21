import { CheckInForm } from "@/components/client/CheckInForm";
import { Card, CardHeading } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { checkInHistory } from "@/lib/mock-data";

export default function CheckInPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Check-In</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          Weekly check-ins keep your program dialed in.
        </p>
      </div>

      <CheckInForm />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-charcoal)]/70">
          Past check-ins
        </h2>
        <div className="space-y-3">
          {checkInHistory.map((c) => (
            <Card key={c.id}>
              <CardHeading
                title={new Date(c.date).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
                subtitle={`${c.weightKg} kg`}
                action={
                  <Badge tone={c.coachReviewed ? "sage" : "clay"}>
                    {c.coachReviewed ? "Reviewed" : "Awaiting review"}
                  </Badge>
                }
              />
              {typeof c.answers.notes === "string" && c.answers.notes && (
                <p className="text-sm text-[var(--color-charcoal)]/75">
                  &ldquo;{c.answers.notes}&rdquo;
                </p>
              )}
              {c.coachComment && (
                <div className="mt-3 rounded-lg bg-[var(--color-sage-light)]/25 px-3 py-2.5">
                  <p className="text-xs font-semibold text-[var(--color-olive-deep)]">
                    Coach reply
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-charcoal)]/80">{c.coachComment}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
