"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { Moon, Sun, Bell } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import Link from "next/link"

export function DashboardHeader() {
  const { user } = useAuthStore()
  const { theme, toggle } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-purple-100 shadow-sm">
      <div className="max-w-2xl mx-auto h-full flex items-center justify-between px-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
            {user?.full_name?.charAt(0) || "E"}
          </div>
          <div>
            <p className="text-sm font-black text-on-surface">Ejempay</p>
            <p className="text-[10px] text-on-surface-variant font-medium">
              {new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-outline hover:bg-surface-container hover:text-primary transition-all"
          >
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link
            href="/transactions"
            className="w-10 h-10 flex items-center justify-center rounded-xl text-outline hover:bg-surface-container hover:text-primary transition-all"
          >
            <Bell className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  )
}
