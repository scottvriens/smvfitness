import clsx from "clsx";

type BadgeTone = "sage" | "clay" | "olive" | "neutral";

const toneStyles: Record<BadgeTone, string> = {
  sage: "bg-[var(--color-sage-light)]/50 text-[var(--color-olive-deep)]",
  clay: "bg-[var(--color-clay)]/20 text-[var(--color-clay-deep)]",
  olive: "bg-[var(--color-olive-deep)]/15 text-[var(--color-olive-deep)]",
  neutral: "bg-[var(--color-taupe)]/50 text-[var(--color-charcoal)]/70",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
