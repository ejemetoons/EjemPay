"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Smartphone,
  Wifi,
  Tv,
  Zap,
  Wallet,
  ArrowUpFromLine,
  History,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useAuthStore } from "@/store/useAuthStore"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Buy Airtime", href: "/buy/airtime", icon: Smartphone },
  { label: "Buy Data", href: "/buy/data", icon: Wifi },
  { label: "Pay Cable TV", href: "/pay/cable", icon: Tv },
  { label: "Pay Electricity", href: "/pay/electricity", icon: Zap },
  { label: "Fund Wallet", href: "/fund-wallet", icon: Wallet },
  { label: "Withdraw", href: "/withdraw", icon: ArrowUpFromLine },
  { label: "Transactions", href: "/transactions", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { theme, toggle } = useTheme()
  const { clearSession } = useAuthStore()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    clearSession()
    router.push("/login")
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-outline-variant/30 h-screen sticky top-0">
      <div className="p-6 border-b border-outline-variant/30">
        <h1 className="text-xl font-black bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">
          Ejempay
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">VTU Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/5 text-primary"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-outline")} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-outline-variant/30 space-y-2">
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-all duration-200"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-error hover:bg-error-container/20 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
