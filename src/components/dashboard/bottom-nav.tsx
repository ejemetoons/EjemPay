"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Wallet, History, User, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Home", href: "/dashboard", icon: LayoutDashboard },
  { label: "Wallet", href: "/fund-wallet", icon: Wallet },
  { label: "History", href: "/transactions", icon: History },
  { label: "Referrals", href: "/referrals", icon: Gift },
  { label: "Profile", href: "/settings", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    if (href === "/wallet") return pathname.startsWith("/wallet") || pathname.startsWith("/fund-wallet") || pathname.startsWith("/withdraw")
    if (href === "/transactions") return pathname.startsWith("/transactions")
    if (href === "/referrals") return pathname.startsWith("/referrals")
    if (href === "/settings") return pathname.startsWith("/settings")
    return false
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-purple-100 shadow-[0_-4px_12px_rgba(67,16,118,0.08)] rounded-t-2xl safe-area-bottom">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-full h-full rounded-xl transition-all duration-200",
                active
                  ? "text-primary"
                  : "text-outline hover:text-on-surface-variant"
              )}
            >
              <div className={cn(
                "w-10 h-7 flex items-center justify-center rounded-lg transition-colors",
                active && "bg-primary/5"
              )}>
                <item.icon className={cn("w-5 h-5", active && "text-primary")} />
              </div>
              <span className="text-[10px] font-semibold leading-none">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
