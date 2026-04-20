import { BottomNav } from '@/components/bottom-nav'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pb-20">
      {children}
      <BottomNav />
    </div>
  )
}
