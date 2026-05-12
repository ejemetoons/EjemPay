"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { formatCurrencyShort, formatDate, getTypeLabel } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"
import { Wifi, Smartphone, Zap, Tv, GraduationCap, Wallet, ArrowRight, Gift, Eye, EyeOff } from "lucide-react"

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  details: Record<string, unknown>
}

const quickActions = [
  { label: "Buy Data", href: "/buy/data", icon: Wifi },
  { label: "Airtime", href: "/buy/airtime", icon: Smartphone },
  { label: "Electricity", href: "/pay/electricity", icon: Zap },
  { label: "Cable TV", href: "/pay/cable", icon: Tv },
  { label: "Exam Pins", href: "/buy/exam", icon: GraduationCap },
  { label: "Fund Wallet", href: "/fund-wallet", icon: Wallet },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hideBalance, setHideBalance] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function loadTransactions() {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(3)

      if (data) setTransactions(data)
    }

    if (user?.id) loadTransactions()
  }, [user?.id])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-6"
    >
      {/* Welcome */}
      <div>
        <p className="text-on-surface-variant body-sm">Welcome back, {user?.full_name?.split(" ")[0] || "User"}</p>
        <h1 className="text-h2 font-bold text-on-surface">
          {getGreeting()}, {user?.full_name || "Valued Customer"}
        </h1>
      </div>

      {/* Wallet Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary-container to-primary rounded-[2rem] p-6 shadow-[0_12px_24px_rgba(91,45,142,0.15)]"
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-purple-200 text-body-sm font-medium">Available Balance</p>
            <button
              onClick={() => setHideBalance(!hideBalance)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
            >
              {hideBalance ? <EyeOff className="w-4 h-4 text-white" /> : <Eye className="w-4 h-4 text-white" />}
            </button>
          </div>

          <p className="text-3xl font-bold text-white mb-6">
            {hideBalance ? "₦••••••" : formatCurrencyShort(balance)}
          </p>

          <div className="flex items-center gap-3">
            <Link href="/fund-wallet">
              <button className="bg-secondary-container text-on-secondary-container rounded-xl px-5 py-2.5 text-sm font-bold hover:opacity-90 transition-all active:scale-95">
                Fund Wallet
              </button>
            </Link>
            <Link href="/withdraw">
              <button className="bg-white/10 backdrop-blur-md text-white rounded-xl px-5 py-2.5 text-sm font-bold hover:bg-white/20 transition-all active:scale-95">
                Withdraw
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Referral Nudge Card */}
      <div className="bg-surface-container rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-on-surface">Refer & Earn</h3>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Share your code with friends and earn bonuses on their transactions.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <Link href="/referrals">
                <button className="bg-primary text-on-primary rounded-xl px-5 py-2.5 font-semibold text-sm hover:opacity-90 transition-all active:scale-95">
                  Share Code
                </button>
              </Link>
              <span className="text-body-sm font-bold text-primary tracking-wider">SHARE2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-h3 font-semibold text-on-surface mb-4">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-5">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="flex flex-col items-center gap-2">
              <motion.div
                whileTap={{ scale: 0.93 }}
                className="w-14 h-14 bg-surface-container-high rounded-2xl flex items-center justify-center"
              >
                <action.icon className="w-6 h-6 text-primary" />
              </motion.div>
              <span className="text-body-sm font-medium text-on-surface text-center leading-tight">
                {action.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h3 font-semibold text-on-surface">Recent Transactions</h2>
          <Link href="/transactions" className="text-body-sm font-medium text-primary flex items-center gap-1">
            See all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-8 text-center">
            <Wallet className="w-10 h-10 mx-auto mb-3 text-on-surface-variant/50" />
            <p className="font-medium text-on-surface">No transactions yet</p>
            <p className="text-body-sm text-on-surface-variant mt-1">Your recent activity will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-50 shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                  {txn.type === "fund_wallet" ? (
                    <Wallet className="w-5 h-5 text-secondary" />
                  ) : txn.type === "withdrawal" ? (
                    <ArrowRight className="w-5 h-5 text-primary" />
                  ) : (
                    <Zap className="w-5 h-5 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface">{getTypeLabel(txn.type)}</p>
                  <p className="text-xs text-on-surface-variant">{formatDate(txn.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-on-surface">{formatCurrencyShort(txn.amount)}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                      txn.status === "success"
                        ? "bg-green-50 text-green-600"
                        : txn.status === "failed"
                          ? "bg-error-container text-on-error-container"
                          : txn.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-50 text-gray-600"
                    }`}
                  >
                    {txn.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
