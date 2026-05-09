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
  Clock,
  TrendingUp,
  Crown,
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
  { label: "Buy Airtime", href: "/buy/airtime", icon: Smartphone, color: "bg-blue-100 text-blue-600" },
  { label: "Buy Data", href: "/buy/data", icon: Wifi, color: "bg-green-100 text-green-600" },
  { label: "Pay Cable", href: "/pay/cable", icon: Tv, color: "bg-purple-100 text-purple-600" },
  { label: "Electricity", href: "/pay/electricity", icon: Zap, color: "bg-yellow-100 text-yellow-600" },
  { label: "Fund Wallet", href: "/fund-wallet", icon: Wallet, color: "bg-blue-100 text-blue-600" },
]

export default function DashboardPage() {
  const { user, setUser } = useAuthStore()
  const { balance, setBalance, setLoading } = useWalletStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
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

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card glass>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Wallet Balance</p>
              <p className="text-3xl font-bold mt-1">{formatCurrencyShort(balance)}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card hover className="cursor-pointer">
          <Link href="/fund-wallet" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ArrowDownLeft className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Fund Wallet</p>
              <p className="text-lg font-semibold text-green-600">Add Money</p>
            </div>
          </Link>
        </Card>

        <Card hover className="cursor-pointer">
          <Link href="/settings" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Tier</p>
              <p className="text-lg font-semibold capitalize">{user?.tier || "Standard"}</p>
            </div>
          </Link>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card hover className="text-center py-6">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mx-auto mb-3`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-gray-700">{action.label}</p>
                </motion.div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Link href="/transactions">
            <Button variant="ghost" size="sm">
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions yet</p>
            <p className="text-sm">Fund your wallet to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(txn.status)}`}>
                    {txn.type === "fund_wallet" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getTypeLabel(txn.type)}</p>
                    <p className="text-xs text-gray-500">{formatDate(txn.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${txn.type === "fund_wallet" ? "text-green-600" : "text-gray-900"}`}>
                    {txn.type === "fund_wallet" ? "+" : "-"}{formatCurrencyShort(txn.amount)}
                  </p>
                  <p className={`text-xs capitalize ${getStatusColor(txn.status)}`}>{txn.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
