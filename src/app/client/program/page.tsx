import { ProgramView } from "@/components/client/ProgramView";
import { Badge } from "@/components/ui/Badge";
import { currentProgram } from "@/lib/mock-data";

export default function ProgramPage() {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-[var(--color-charcoal)]">
            {currentProgram.name}
          </h1>
          <Badge tone="olive">{currentProgram.weekLabel}</Badge>
        </div>
        <p className="mt-1 text-sm text-[var(--color-charcoal)]/60">{currentProgram.description}</p>
      </div>
      <ProgramView program={currentProgram} />
    </div>
  );
}
