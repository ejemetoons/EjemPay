"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { formatCurrencyShort, formatDate, getTypeLabel, getStatusColor } from "@/lib/utils"
import { ArrowUpRight, ArrowDownLeft, ArrowUpFromLine, Clock, Search } from "lucide-react"
import { motion } from "framer-motion"

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  created_at: string
  details: Record<string, unknown>
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const { user } = useAuthStore()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      if (!user) return
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setTransactions(data)
    }
    load()
  }, [user])

  const filtered = transactions.filter((txn) => {
    if (filter !== "all" && txn.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        getTypeLabel(txn.type).toLowerCase().includes(q) ||
        txn.status.toLowerCase().includes(q) ||
        String(txn.amount).includes(q)
      )
    }
    return true
  })

  const filters = [
    { label: "All", value: "all" },
    { label: "Airtime", value: "airtime" },
    { label: "Data", value: "data" },
    { label: "Cable", value: "cable" },
    { label: "Electricity", value: "electricity" },
    { label: "Funding", value: "fund_wallet" },
    { label: "Withdrawal", value: "withdrawal" },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Transactions</h2>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </motion.div>
            <p className="text-gray-900 dark:text-gray-100 font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try a different filter or search term</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((txn, i) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between py-4 px-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(txn.status)}`}>
                    {txn.type === "fund_wallet" ? (
                      <ArrowDownLeft className="w-6 h-6" />
                    ) : txn.type === "withdrawal" ? (
                      <ArrowUpFromLine className="w-6 h-6" />
                    ) : (
                      <ArrowUpRight className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{getTypeLabel(txn.type)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(txn.created_at)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${txn.type === "fund_wallet" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                    {txn.type === "fund_wallet" ? "+" : "-"}{formatCurrencyShort(txn.amount)}
                  </p>
                  <p className={`text-xs capitalize ${getStatusColor(txn.status)}`}>{txn.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  )
}
