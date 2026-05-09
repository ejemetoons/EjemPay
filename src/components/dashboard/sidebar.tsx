"use client"

import { useState } from "react"
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
  History,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Buy Airtime", href: "/buy/airtime", icon: Smartphone },
  { label: "Buy Data", href: "/buy/data", icon: Wifi },
  { label: "Pay Cable TV", href: "/pay/cable", icon: Tv },
  { label: "Pay Electricity", href: "/pay/electricity", icon: Zap },
  { label: "Fund Wallet", href: "/fund-wallet", icon: Wallet },
  { label: "Transactions", href: "/transactions", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Ejempay
        </h1>
        <p className="text-xs text-gray-400 mt-1">VTU Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-gray-400")} />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="ml-auto"
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </motion.div>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md border border-gray-100"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
