"use client"

import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  Smartphone,
  Wifi,
  Tv,
  Zap,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowUpFromLine,
  Clock,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { formatCurrencyShort, formatDate, getTypeLabel, getStatusColor } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  details: Record<string, unknown>
}

const quickActions = [
  { label: "Airtime", href: "/buy/airtime", icon: Smartphone, color: "from-blue-500 to-blue-600", bg: "bg-blue-50 dark:bg-blue-900/30" },
  { label: "Data", href: "/buy/data", icon: Wifi, color: "from-emerald-500 to-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/30" },
  { label: "Cable", href: "/pay/cable", icon: Tv, color: "from-purple-500 to-purple-600", bg: "bg-purple-50 dark:bg-purple-900/30" },
  { label: "Electricity", href: "/pay/electricity", icon: Zap, color: "from-amber-500 to-amber-600", bg: "bg-amber-50 dark:bg-amber-900/30" },
  { label: "Fund", href: "/fund-wallet", icon: Wallet, color: "from-rose-500 to-rose-600", bg: "bg-rose-50 dark:bg-rose-900/30" },
]

export default function DashboardPage() {
  const { user, setUser } = useAuthStore()
  const { balance, setBalance, setLoading } = useWalletStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [hideBalance, setHideBalance] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        if (!authUser) {
          router.push("/login")
          return
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single()

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email || authUser.email || "",
            full_name: profile.full_name,
            phone: profile.phone,
            tier: profile.tier,
            tx_pin: profile.tx_pin,
            created_at: profile.created_at,
          })
        }

        const { data: wallet } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", authUser.id)
          .single()

        if (wallet) {
          setBalance(Number(wallet.balance))
        }

        const { data: txns } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false })
          .limit(5)

        if (txns) {
          setTransactions(txns)
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const itemAnim = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5 md:space-y-6">
      <motion.div variants={itemAnim} className="lg:hidden">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Hello, {user?.full_name?.split(" ")[0] || "User"}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-5 md:p-7 text-white shadow-xl shadow-blue-600/30">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-blue-200 font-medium">Wallet Balance</p>
              <button
                onClick={() => setHideBalance(!hideBalance)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-3xl md:text-4xl font-bold tracking-tight mb-5">
              {hideBalance ? "₦••••••" : formatCurrencyShort(balance)}
            </p>
            <div className="flex items-center gap-3">
              <Link href="/fund-wallet">
                <button className="flex items-center gap-1.5 bg-white text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                  <Wallet className="w-4 h-4" />
                  Fund Wallet
                </button>
              </Link>
              <Link href="/transactions">
                <button className="flex items-center gap-1.5 bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
                  History
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="block">
              <motion.div
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-1.5 p-2 md:p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <action.icon className="w-5 h-5 md:w-6 md:h-6 text-gray-700 dark:text-gray-300" />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Transactions</h3>
          <Link href="/transactions">
            <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              See all
            </button>
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400 dark:text-gray-500">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              </motion.div>
              <p className="font-medium">No transactions yet</p>
              <p className="text-sm mt-1">Fund your wallet to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {transactions.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getStatusColor(txn.status)}`}>
                      {txn.type === "fund_wallet" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : txn.type === "withdrawal" ? (
                        <ArrowUpFromLine className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{getTypeLabel(txn.type)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(txn.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === "fund_wallet" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                      {txn.type === "fund_wallet" ? "+" : "-"}{formatCurrencyShort(txn.amount)}
                    </p>
                    <p className={`text-[10px] font-medium capitalize ${getStatusColor(txn.status)}`}>{txn.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
