"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type LucideIcon,
  ArrowLeftRight,
  Sun,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import clsx from "clsx";

// Icons are resolved by name inside this Client Component rather than
// accepted as component references, since Server Component layouts can't
// pass function props (like a component reference) across the RSC boundary.
const iconMap: Record<string, LucideIcon> = {
  Sun,
  Dumbbell,
  ClipboardCheck,
  TrendingUp,
  MessageCircle,
  LayoutDashboard,
};

export interface NavItem {
  href: string;
  label: string;
  icon: keyof typeof iconMap;
}

export function AppShell({
  navItems,
  userName,
  avatarInitials,
  roleLabel,
  switchHref,
  switchLabel,
  children,
}: {
  navItems: NavItem[];
  userName: string;
  avatarInitials: string;
  roleLabel: string;
  switchHref: string;
  switchLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-cream)] md:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-taupe)] bg-[var(--color-cream-soft)] px-5 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} active={pathname.startsWith(item.href)} />
          ))}
        </nav>
        <SidebarFooter
          userName={userName}
          avatarInitials={avatarInitials}
          roleLabel={roleLabel}
          switchHref={switchHref}
          switchLabel={switchLabel}
        />
      </aside>

      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b border-[var(--color-taupe)] bg-[var(--color-cream-soft)] px-4 py-3 md:hidden">
        <Brand compact />
        <Link
          href={switchHref}
          className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-olive-deep)] shadow-sm"
        >
          <ArrowLeftRight size={13} />
          {switchLabel}
        </Link>
      </header>

      <main className="flex-1 px-4 pb-24 pt-5 md:px-8 md:pb-10 md:pt-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-10 flex justify-around border-t border-[var(--color-taupe)] bg-white/95 px-1 py-2 backdrop-blur md:hidden">
        {navItems.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = iconMap[item.icon];
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium",
                active ? "text-[var(--color-olive-deep)]" : "text-[var(--color-charcoal)]/50"
              )}
            >
              <Icon size={19} strokeWidth={active ? 2.4 : 2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-sage)] text-sm font-bold text-white">
        SV
      </div>
      {!compact && (
        <div>
          <p className="text-sm font-semibold leading-tight text-[var(--color-charcoal)]">SMV Fitness</p>
          <p className="text-[11px] leading-tight text-[var(--color-charcoal)]/50">Coaching platform</p>
        </div>
      )}
    </div>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = iconMap[item.icon];
  return (
    <Link
      href={item.href}
      className={clsx(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-[var(--color-sage)] text-white shadow-sm"
          : "text-[var(--color-charcoal)]/70 hover:bg-[var(--color-taupe-soft)]"
      )}
    >
      <Icon size={17} strokeWidth={active ? 2.4 : 2} />
      {item.label}
    </Link>
  );
}

function SidebarFooter({
  userName,
  avatarInitials,
  roleLabel,
  switchHref,
  switchLabel,
}: {
  userName: string;
  avatarInitials: string;
  roleLabel: string;
  switchHref: string;
  switchLabel: string;
}) {
  return (
    <div className="mt-6 space-y-3 border-t border-[var(--color-taupe)] pt-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-clay)]/25 text-xs font-semibold text-[var(--color-clay-deep)]">
          {avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--color-charcoal)]">{userName}</p>
          <p className="text-[11px] text-[var(--color-charcoal)]/50">{roleLabel}</p>
        </div>
      </div>
      <Link
        href={switchHref}
        className="flex items-center justify-center gap-1.5 rounded-lg border border-[var(--color-taupe)] bg-white px-3 py-2 text-xs font-medium text-[var(--color-olive-deep)] transition-colors hover:bg-[var(--color-taupe-soft)]"
      >
        <ArrowLeftRight size={13} />
        {switchLabel}
      </Link>
    </div>
  );
}
