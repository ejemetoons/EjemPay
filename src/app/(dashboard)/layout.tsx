import { DashboardHeader } from "@/components/dashboard/header"
import { BottomNav } from "@/components/dashboard/bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300 pb-28">
      <DashboardHeader />
      <main className="pt-20 px-5 max-w-2xl mx-auto w-full">{children}</main>
      <BottomNav />
    </div>
  )
}
