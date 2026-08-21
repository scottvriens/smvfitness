import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { currentClient } from "@/lib/mock-data";

const navItems: NavItem[] = [
  { href: "/client/today", label: "Today", icon: "Sun" },
  { href: "/client/program", label: "Program", icon: "Dumbbell" },
  { href: "/client/check-in", label: "Check-In", icon: "ClipboardCheck" },
  { href: "/client/progress", label: "Progress", icon: "TrendingUp" },
  { href: "/client/messages", label: "Messages", icon: "MessageCircle" },
];

export default function ClientLayout({ children }: LayoutProps<"/client">) {
  return (
    <AppShell
      navItems={navItems}
      userName={currentClient.name}
      avatarInitials={currentClient.avatarInitials}
      roleLabel="Client"
      switchHref="/coach/dashboard"
      switchLabel="View as coach"
    >
      {children}
    </AppShell>
  );
}
