"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { Card, CardHeading } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import type { BasicClient } from "@/lib/data";

export function AssignClients({
  programId,
  allClients,
  assignedClientIds,
}: {
  programId: string;
  allClients: BasicClient[];
  assignedClientIds: string[];
}) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set(assignedClientIds));
  const [pending, startTransition] = useTransition();

  const toggle = (clientId: string) => {
    const willBeAssigned = !assigned.has(clientId);

    setAssigned((prev) => {
      const next = new Set(prev);
      if (willBeAssigned) {
        next.add(clientId);
      } else {
        next.delete(clientId);
      }
      return next;
    });

    startTransition(async () => {
      const supabase = createClient();
      if (willBeAssigned) {
        // A client only trains one program at a time in this MVP — clear any
        // other assignment they have before pointing them at this one.
        await supabase.from("program_assignments").delete().eq("client_id", clientId);
        await supabase.from("program_assignments").insert({ program_id: programId, client_id: clientId });
      } else {
        await supabase
          .from("program_assignments")
          .delete()
          .eq("program_id", programId)
          .eq("client_id", clientId);
      }
    });
  };

  if (allClients.length === 0) {
    return (
      <Card>
        <CardHeading title="Assign to clients" />
        <p className="text-sm text-[var(--color-charcoal)]/55">
          No clients have signed up yet — once someone does, they&apos;ll show up here.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeading
        title="Assign to clients"
        subtitle="Turning this on replaces whatever program that client was on."
      />
      <ul className="space-y-2">
        {allClients.map((client) => {
          const isAssigned = assigned.has(client.id);
          return (
            <li key={client.id}>
              <button
                onClick={() => toggle(client.id)}
                disabled={pending}
                className={
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors disabled:opacity-70 " +
                  (isAssigned
                    ? "border-[var(--color-sage)] bg-[var(--color-sage-light)]/30"
                    : "border-[var(--color-taupe)] bg-white hover:bg-[var(--color-taupe-soft)]/50")
                }
              >
                <span
                  className={
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold " +
                    (isAssigned
                      ? "bg-[var(--color-sage)] text-white"
                      : "bg-[var(--color-clay)]/20 text-[var(--color-clay-deep)]")
                  }
                >
                  {isAssigned ? <Check size={16} /> : client.avatar_initials}
                </span>
                <span className="text-sm font-medium text-[var(--color-charcoal)]">{client.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
