import { ProgramView } from "@/components/client/ProgramView";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { requireProfile } from "@/lib/auth";
import { getClientProgram } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function ProgramPage() {
  const profile = await requireProfile("client");
  const program = await getClientProgram(profile.id);

  if (!program) {
    // TEMPORARY debug block — remove once we've tracked down why assigned
    // programs aren't showing up for clients. Shows exactly what the server
    // sees for this account so we don't have to dig through Vercel logs.
    const supabase = await createClient();
    const { data: authUser } = await supabase.auth.getUser();
    const { data: rawAssignment, error: rawAssignmentError } = await supabase
      .from("program_assignments")
      .select("*")
      .eq("client_id", profile.id);

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
        <Card>
          <p className="mb-2 text-xs font-semibold text-[var(--color-clay-deep)]">Debug info (temporary)</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-all text-[11px] text-[var(--color-charcoal)]/70">
{JSON.stringify(
  {
    profileId: profile.id,
    authUserId: authUser.user?.id ?? null,
    idsMatch: profile.id === authUser.user?.id,
    rawAssignmentQuery: rawAssignment,
    rawAssignmentError,
  },
  null,
  2
)}
          </pre>
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
