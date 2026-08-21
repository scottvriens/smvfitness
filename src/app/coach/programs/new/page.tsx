import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProgramEditor } from "@/components/coach/ProgramEditor";
import { requireProfile } from "@/lib/auth";

export default async function NewProgramPage() {
  await requireProfile("coach");

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
        <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">New program</h1>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">
          Lay out the training days and exercises, then assign it once it&apos;s saved.
        </p>
      </div>
      <ProgramEditor mode="create" />
    </div>
  );
}
