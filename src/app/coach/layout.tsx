import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { requireProfile } from "@/lib/auth";

const navItems: NavItem[] = [
  { href: "/coach/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/coach/programs", label: "Programs", icon: "ClipboardList" },
];

export default async function CoachLayout({ children }: LayoutProps<"/coach">) {
  const profile = await requireProfile("coach");

  return (
    <AppShell
      navItems={navItems}
      userName={profile.name}
      avatarInitials={profile.avatar_initials}
      roleLabel="Coach"
    >
      {children}
    </AppShell>
  );
}
