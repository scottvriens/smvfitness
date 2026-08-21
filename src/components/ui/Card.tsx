import { type ReactNode } from "react";
import clsx from "clsx";

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-[var(--color-taupe)] bg-white/70 shadow-sm",
        padded && "p-5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-[var(--color-charcoal)]">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-[var(--color-charcoal)]/60">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
