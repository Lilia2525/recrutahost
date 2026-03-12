import { DashboardShell } from '@/components/layout/DashboardShell'

export default function GuiaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>
}
