import { ProgramView } from "@/components/client/ProgramView";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { requireProfile } from "@/lib/auth";
import { getClientProgram } from "@/lib/data";

export default async function ProgramPage() {
  const profile = await requireProfile("client");
  const program = await getClientProgram(profile.id);

  if (!program) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">Your program</h1>
        </div>
        <Card>
          <p className="text-sm text-[var(--color-charcoal)]/55">
            Your coach hasn&apos;t assigned you a training program yet — check back soon.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">{program.name}</h1>
          {program.week_label && <Badge tone="olive">{program.week_label}</Badge>}
        </div>
        {program.description && (
          <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">{program.description}</p>
        )}
      </div>
      <ProgramView days={program.days} />
    </div>
  );
}
