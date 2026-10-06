import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function FreelancerLayout({ children }: { children: React.ReactNode }) {
    return <DashboardShell role="FREELANCER">{children}</DashboardShell>;
}