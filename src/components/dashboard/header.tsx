"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { motion } from "framer-motion"
import { Bell, User } from "lucide-react"
import { formatCurrencyShort } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"

export function DashboardHeader() {
  const { user } = useAuthStore()
  const { balance, isLoading, setBalance, setLoading, updateTimestamp } = useWalletStore()
  const [displayBalance, setDisplayBalance] = useState(0)

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
    <header className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="lg:pl-12">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.full_name || "User"}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25">
            <p className="text-xs text-blue-100">Wallet Balance</p>
            <p className="text-xl font-bold">
              {formatCurrencyShort(displayBalance)}
            </p>
          </div>

          <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>
    </header>
  )
}
