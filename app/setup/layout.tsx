import { DashboardShell } from '@/components/layout/DashboardShell'

export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
