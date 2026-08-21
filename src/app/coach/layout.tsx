import { AppShell, type NavItem } from "@/components/layout/AppShell";
import { coachUser } from "@/lib/mock-data";

const navItems: NavItem[] = [{ href: "/coach/dashboard", label: "Dashboard", icon: "LayoutDashboard" }];

export default function CoachLayout({ children }: LayoutProps<"/coach">) {
  return (
    <AppShell
      navItems={navItems}
      userName={coachUser.name}
      avatarInitials={coachUser.avatarInitials}
      roleLabel="Coach"
      switchHref="/client/today"
      switchLabel="View as client"
    >
      {children}
    </AppShell>
  );
}
