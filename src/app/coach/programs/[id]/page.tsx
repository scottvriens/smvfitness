import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProgramEditor } from "@/components/coach/ProgramEditor";
import { AssignClients } from "@/components/coach/AssignClients";
import { requireProfile } from "@/lib/auth";
import { getProgramDetail, getAllClientsBasic } from "@/lib/data";

export default async function EditProgramPage(props: PageProps<"/coach/programs/[id]">) {
  await requireProfile("coach");
  const { id } = await props.params;

  const [program, allClients] = await Promise.all([getProgramDetail(id), getAllClientsBasic()]);
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/coach/programs"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-charcoal)]/60 hover:text-[var(--color-charcoal)]"
      >
        <ArrowLeft size={15} />
        Back to programs
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">{program.name}</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          Edit the program and manage who it&apos;s assigned to.
        </p>
      </div>

      <AssignClients
        programId={program.id}
        allClients={allClients}
        assignedClientIds={program.assignedClientIds}
      />

      <ProgramEditor mode="edit" programId={program.id} initialProgram={program} />
    </div>
  );
}
