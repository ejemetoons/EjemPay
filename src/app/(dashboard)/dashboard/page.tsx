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
  { label: "Airtime", href: "/buy/airtime", icon: Smartphone, color: "from-[#431076] to-[#5b2d8e]" },
  { label: "Data", href: "/buy/data", icon: Wifi, color: "from-[#006c49] to-[#00e29e]" },
  { label: "Cable", href: "/pay/cable", icon: Tv, color: "from-[#7548a9] to-[#dbb8ff]" },
  { label: "Electricity", href: "/pay/electricity", icon: Zap, color: "from-[#603f00] to-[#dbab65]" },
  { label: "Fund", href: "/fund-wallet", icon: Wallet, color: "from-[#431076] to-[#7548a9]" },
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
        <h2 className="text-xl font-bold text-on-surface">
          Hello, {user?.full_name?.split(" ")[0] || "User"}
        </h2>
        <p className="text-sm text-on-surface-variant">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container to-primary p-5 md:p-7 text-white shadow-[0_12px_24px_rgba(91,45,142,0.15)]">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-secondary-container/10" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-purple-200 font-medium">Available Balance</p>
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
                <button className="flex items-center gap-1.5 bg-secondary-container text-on-secondary-container px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-lg active:scale-95">
                  <Wallet className="w-4 h-4" />
                  Fund Wallet
                </button>
              </Link>
              <Link href="/transactions">
                <button className="flex items-center gap-1.5 bg-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-white/20 transition-all border border-white/10 active:scale-95">
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
          <h3 className="text-base md:text-lg font-semibold text-on-surface">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-5 gap-2 md:gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="block">
              <motion.div
                whileTap={{ scale: 0.93 }}
                className="flex flex-col items-center gap-1.5 p-2 md:p-4 rounded-xl bg-white dark:bg-gray-900 border border-outline-variant/30 hover:shadow-md hover:border-primary/30 transition-all duration-200"
              >
                <div className={`w-10 h-10 md:w-12 h-12 rounded-xl flex items-center justify-center bg-surface-container`}>
                  <action.icon className="w-5 h-5 md:w-6 h-6 text-primary" />
                </div>
                <span className="text-[10px] md:text-xs font-medium text-on-surface-variant text-center leading-tight">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemAnim}>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-on-surface">Recent Transactions</h3>
          <Link href="/transactions">
            <button className="text-sm text-primary font-medium hover:underline">
              See all
            </button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-outline-variant/30 overflow-hidden">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-outline">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
              </motion.div>
              <p className="font-medium text-on-surface">No transactions yet</p>
              <p className="text-sm mt-1">Fund your wallet to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/20">
              {transactions.map((txn, i) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between px-4 py-3.5 hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center bg-surface-container`}>
                      {txn.type === "fund_wallet" ? (
                        <ArrowDownLeft className="w-4 h-4 text-secondary" />
                      ) : txn.type === "withdrawal" ? (
                        <ArrowUpFromLine className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{getTypeLabel(txn.type)}</p>
                      <p className="text-xs text-on-surface-variant">{formatDate(txn.created_at)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-semibold ${txn.type === "fund_wallet" ? "text-secondary" : "text-on-surface"}`}>
                      {txn.type === "fund_wallet" ? "+" : "-"}{formatCurrencyShort(txn.amount)}
                    </p>
                    <p className={`text-[10px] font-bold capitalize ${getStatusColor(txn.status)}`}>{txn.status}</p>
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
