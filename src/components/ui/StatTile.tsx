import { type LucideIcon } from "lucide-react";

export function StatTile({
  label,
  value,
  sub,
  icon: Icon,
  accent = "var(--color-sage-deep)",
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--color-taupe)] bg-white/70 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-charcoal)]/50">
          {label}
        </p>
        {Icon && <Icon size={16} style={{ color: accent }} />}
      </div>
      <p className="mt-1.5 text-xl font-semibold text-[var(--color-charcoal)]">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-[var(--color-charcoal)]/50">{sub}</p>}
    </div>
  );
}
