"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { motion } from "framer-motion"
import { Bell, User, Moon, Sun, Eye, EyeOff } from "lucide-react"
import { formatCurrencyShort } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"

export function DashboardHeader() {
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const [displayBalance, setDisplayBalance] = useState(0)
  const { theme, toggle } = useTheme()
  const [hideBalance, setHideBalance] = useState(false)

  useEffect(() => {
    if (balance > 0) {
      const duration = 1000
      const steps = 30
      const increment = balance / steps
      let current = 0
      let step = 0
      const timer = setInterval(() => {
        step++
        current = Math.min(current + increment, balance)
        setDisplayBalance(Math.round(current))
        if (step >= steps) {
          clearInterval(timer)
          setDisplayBalance(balance)
        }
      }, duration / steps)
      return () => clearInterval(timer)
    } else {
      setDisplayBalance(0)
    }
  }, [balance])

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Ejempay
            </h1>
          </div>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Welcome back, {user?.full_name || "User"}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString("en-NG", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="hidden md:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-xl shadow-lg shadow-blue-600/25 dark:shadow-blue-500/20"
          >
            <div className="text-left">
              <p className="text-[10px] text-blue-100 leading-tight">Balance</p>
              <motion.p
                className="text-sm font-bold"
                key={displayBalance}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
              >
                {hideBalance ? "••••" : formatCurrencyShort(displayBalance)}
              </motion.p>
            </div>
            {hideBalance ? <EyeOff className="w-3.5 h-3.5 text-blue-200" /> : <Eye className="w-3.5 h-3.5 text-blue-200" />}
          </button>

          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
          </button>

          <button className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative hidden sm:block">
            <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </button>

          <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <User className="w-4 h-4 md:w-5 md:h-5 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>
    </header>
  )
}
