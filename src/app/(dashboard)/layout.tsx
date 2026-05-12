import { Sidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { BottomNav } from "@/components/dashboard/bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background flex transition-colors duration-300 pb-16 lg:pb-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        <DashboardHeader />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-5xl mx-auto w-full">{children}</main>
      </div>
      <BottomNav />
    </div>
  )
}
