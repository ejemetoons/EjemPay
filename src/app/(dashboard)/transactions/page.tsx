"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { createClient } from "@/lib/supabase/client"
import { formatCurrencyShort, formatDate, getTypeLabel, cn } from "@/lib/utils"
import { Smartphone, Wifi, ArrowUpFromLine, Wallet, Tv, Zap, Crown, Circle, LucideIcon } from "lucide-react"
import { motion } from "framer-motion"

interface Transaction {
  id: string
  type: string
  amount: number
  fee?: number
  status: string
  created_at: string
  details: Record<string, unknown>
}

const FILTERS = ["all", "airtime", "data", "electricity", "cable", "withdrawal", "fund_wallet", "upgrade"] as const

const LABELS: Record<string, string> = {
  all: "All",
  airtime: "Airtime",
  data: "Data",
  electricity: "Electricity",
  cable: "Cable TV",
  withdrawal: "Withdrawal",
  fund_wallet: "Funding",
  upgrade: "Upgrade",
}

const TYPE_ICONS: Record<string, LucideIcon> = {
  airtime: Smartphone,
  data: Wifi,
  withdrawal: ArrowUpFromLine,
  fund_wallet: Wallet,
  cable: Tv,
  electricity: Zap,
  upgrade: Crown,
}

function getIcon(type: string): LucideIcon {
  return TYPE_ICONS[type] || Circle
}

function formatDateHeading(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  const d = date.toDateString()
  const t = today.toDateString()
  const y = yesterday.toDateString()

  if (d === t) return "Today"
  if (d === y) return "Yesterday"
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      setLoading(true)
      if (!user) return
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setTransactions(data as Transaction[])
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    if (filter === "all") return transactions
    return transactions.filter((txn) => txn.type === filter)
  }, [transactions, filter])

  const grouped = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    for (const txn of filtered) {
      const key = formatDateHeading(txn.created_at)
      if (!map[key]) map[key] = []
      map[key].push(txn)
    }
    return map
  }, [filtered])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h2 className="text-h2 font-bold text-on-surface">Transaction History</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 px-4 py-2 rounded-full text-xs font-bold uppercase transition-all",
              filter === f
                ? "bg-primary text-on-primary"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {LABELS[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-on-surface-variant py-12">No transactions found</p>
      ) : (
        <div className="pb-6">
          {Object.entries(grouped).map(([heading, txns]) => (
            <div key={heading}>
              <p className="text-label-caps text-outline uppercase mb-2 mt-4 first:mt-0">{heading}</p>
              <div className="space-y-3">
                {txns.map((txn, i) => {
                  const Icon = getIcon(txn.type)
                  const fee = (txn.details?.fee as number) || 0

                  return (
                    <motion.div
                      key={txn.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-purple-50 shadow-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-on-surface-variant" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-on-surface text-sm">{getTypeLabel(txn.type)}</p>
                        <p className="text-xs text-on-surface-variant mt-0.5">{formatDate(txn.created_at)}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-on-surface">{formatCurrencyShort(txn.amount)}</p>
                        {fee > 0 && <p className="text-xs text-on-surface-variant">- ₦{fee} fee</p>}
                        <span
                          className={cn(
                            "inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-0.5",
                            txn.status === "success" && "bg-green-50 text-green-600",
                            txn.status === "failed" && "bg-error-container text-on-error-container",
                            txn.status === "pending" && "bg-yellow-100 text-yellow-700"
                          )}
                        >
                          {txn.status}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
