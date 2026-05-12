"use client"

import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { formatCurrencyShort } from "@/lib/utils"
import { Moon, Sun, Eye, EyeOff } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { useState } from "react"

export function DashboardHeader() {
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const { theme, toggle } = useTheme()
  const [hideBalance, setHideBalance] = useState(false)

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm">
          {user?.full_name?.charAt(0) || "U"}
        </div>
        <div>
          <p className="text-sm font-semibold text-on-surface">Ejempay</p>
          <p className="text-[10px] text-on-surface-variant font-medium">
            {new Date().toLocaleDateString("en-NG", { month: "short", day: "numeric" })}
          </p>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-3 px-4 py-2 bg-surface-container rounded-xl">
          <span className="text-sm text-on-surface-variant">Balance</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-primary">
              {hideBalance ? "••••••" : formatCurrencyShort(balance)}
            </span>
            <button onClick={() => setHideBalance(!hideBalance)} className="text-outline hover:text-primary transition-colors">
              {hideBalance ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-outline hover:bg-surface-container hover:text-primary transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
