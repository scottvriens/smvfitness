import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { requireProfile } from "@/lib/auth";

const navItems: NavItem[] = [
  { href: "/client/today", label: "Today", icon: "Sun" },
  { href: "/client/program", label: "Program", icon: "Dumbbell" },
  { href: "/client/check-in", label: "Check-In", icon: "ClipboardCheck" },
  { href: "/client/progress", label: "Progress", icon: "TrendingUp" },
  { href: "/client/messages", label: "Messages", icon: "MessageCircle" },
];

export default async function ClientLayout({ children }: LayoutProps<"/client">) {
  const profile = await requireProfile("client");

  return (
    <AppShell
      navItems={navItems}
      userName={profile.name}
      avatarInitials={profile.avatar_initials}
      roleLabel="Client"
    >
      {children}
    </AppShell>
  );
}
