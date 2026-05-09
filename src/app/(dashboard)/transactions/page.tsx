"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useAuthStore } from "@/store/useAuthStore"
import { createClient } from "@/lib/supabase/client"
import { formatCurrencyShort, formatDate, getTypeLabel, getStatusColor } from "@/lib/utils"
import { Loader2, ArrowUpRight, ArrowDownLeft, Filter } from "lucide-react"
import { motion } from "framer-motion"

interface Transaction {
  id: string
  type: string
  amount: number
  fee: number
  status: string
  details: Record<string, unknown>
  api_reference: string | null
  squad_reference: string | null
  created_at: string
}

const typeFilters = ["all", "airtime", "data", "cable", "electricity", "fund_wallet", "upgrade"]

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const { user } = useAuthStore()

  useEffect(() => {
    async function loadTransactions() {
      if (!user) return
      setLoading(true)

      const supabase = createClient()
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("type", filter)
      }

      const { data } = await query
      if (data) setTransactions(data)
      setLoading(false)
    }

    loadTransactions()
  }, [user, filter])

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h2>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {typeFilters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f === "all" ? "All" : getTypeLabel(f)}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((txn) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(
                      txn.status
                    )}`}
                  >
                    {txn.type === "fund_wallet" ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{getTypeLabel(txn.type)}</p>
                    <p className="text-xs text-gray-500">{formatDate(txn.created_at)}</p>
                    {txn.details && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {Object.entries(txn.details)
                          .slice(0, 2)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      txn.type === "fund_wallet" ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {txn.type === "fund_wallet" ? "+" : "-"}
                    {formatCurrencyShort(txn.amount)}
                  </p>
                  <p className="text-xs capitalize mt-0.5">{txn.status}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
