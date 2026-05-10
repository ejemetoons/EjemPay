"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateTopUpFee, getAmountToReceive } from "@/lib/pricing"
import { formatCurrencyShort, generateRequestId } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Wallet, Info, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000]

export default function FundWalletPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { setBalance } = useWalletStore()
  const { addToast } = useUiStore()
  const supabase = createClient()

  const numAmount = Number(amount) || 0
  const fee = calculateTopUpFee(numAmount)
  const youReceive = getAmountToReceive(numAmount)

  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{
    status: "success" | "error" | null
    message: string
    amount?: number
  }>({ status: null, message: "" })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const ref = params.get("ref")
    if (ref) {
      handleVerify(ref)
      const url = new URL(window.location.href)
      url.searchParams.delete("ref")
      window.history.replaceState({}, "", url.toString())
    }
  }, [])

  const handleVerify = async (transactionRef: string) => {
    setVerifying(true)
    try {
      const res = await fetch("/api/squad/verify-and-credit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionRef }),
      })
      const data = await res.json()

      if (data.alreadyCredited) {
        setVerifyResult({ status: "success", message: "Wallet already credited" })
        addToast("success", "Wallet already credited")
      } else if (res.ok) {
        setVerifyResult({
          status: "success",
          message: `Wallet credited with ${formatCurrencyShort(data.amount_credited)}`,
          amount: data.amount_credited,
        })
        setBalance(data.new_balance)
        addToast("success", `Wallet credited with ${formatCurrencyShort(data.amount_credited)}`)
      } else {
        setVerifyResult({ status: "error", message: data.error || "Verification failed" })
        addToast("error", data.error || "Payment verification failed")
      }
    } catch {
      setVerifyResult({ status: "error", message: "Verification failed" })
      addToast("error", "Payment verification failed")
    } finally {
      setVerifying(false)
    }
  }

  const handleFund = async () => {
    if (!user) return
    setLoading(true)

    try {
      const transactionRef = generateRequestId("EJP_FW")

      const res = await fetch("/api/squad/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          email: user.email,
          customerName: user.full_name || "User",
          transactionRef,
          metadata: {
            user_id: user.id,
            type: "fund_wallet",
          },
        }),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Payment initiation failed")
      }

      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "fund_wallet",
        amount: numAmount,
        fee: fee,
        status: "pending",
        details: { amount: numAmount, fee },
        squad_reference: result.data.transaction_ref,
      })

      window.location.href = result.data.checkout_url
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Payment initiation failed")
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Card glass>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Verifying your payment...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we confirm your transaction.</p>
          </div>
        </Card>
      </motion.div>
    )
  }

  if (verifyResult.status) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Card glass>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            {verifyResult.status === "success" ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
            <p className={`text-lg font-semibold ${verifyResult.status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {verifyResult.status === "success" ? "Payment Successful!" : "Payment Failed"}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{verifyResult.message}</p>
            <Button onClick={() => setVerifyResult({ status: null, message: "" })}>
              Fund Again
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Fund Wallet</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Amounts</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`p-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    amount === String(a)
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-300"
                  }`}
                >
                  {formatCurrencyShort(a)}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<Wallet className="w-4 h-4" />}
            required
            min="100"
          />

          {numAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">You pay</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrencyShort(numAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Processing fee</span>
                <span className="text-red-500">-{formatCurrencyShort(fee)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">You receive</span>
                <span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrencyShort(youReceive)}</span>
              </div>
            </motion.div>
          )}

          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Secure Payment</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Payments are processed securely via Squad. Your wallet will be credited instantly after payment.
              </p>
            </div>
          </div>

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handleFund}
              className="w-full"
              size="lg"
              disabled={numAmount < 100 || loading}
              isLoading={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fund Wallet"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
