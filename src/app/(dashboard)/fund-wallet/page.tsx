"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateTopUpFee, getAmountToReceive } from "@/lib/pricing"
import { formatCurrencyShort, generateRequestId } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Wallet, CheckCircle, XCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { motion } from "framer-motion"

const quickAmounts = [1000, 2000, 5000, 10000]

export default function FundWalletPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <div className="bg-surface-container-high rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-lg font-medium text-on-surface">Verifying your payment...</p>
            <p className="text-sm text-on-surface-variant">Please wait while we confirm your transaction.</p>
          </div>
        </div>
      </motion.div>
    )
  }

  if (verifyResult.status) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
        <div className="bg-surface-container-high rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            {verifyResult.status === "success" ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
            <p className={`text-lg font-semibold ${verifyResult.status === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {verifyResult.status === "success" ? "Payment Successful!" : "Payment Failed"}
            </p>
            <p className="text-sm text-on-surface-variant">{verifyResult.message}</p>
            <Button onClick={() => setVerifyResult({ status: null, message: "" })}>
              Fund Again
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 space-y-5">
      <div>
        <h2 className="text-h2 font-h2 text-primary">Fund Wallet</h2>
        <p className="text-body-sm text-on-surface-variant">Add money to your wallet securely.</p>
      </div>

      <div className="bg-gradient-to-br from-primary-container to-primary rounded-[2rem] p-6 shadow-[0_12px_24px_rgba(91,45,142,0.15)] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-4">
          <p className="text-sm text-white/80">Available Balance</p>
          <p className="text-4xl font-bold text-white">{formatCurrencyShort(balance ?? 0)}</p>
          <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5 text-xs font-medium text-white">
            Tier 2 Agent Account
          </div>
        </div>
      </div>

      <Input
        label="Amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        icon={<Wallet className="w-5 h-5" />}
        required
        min="100"
      />

      <div className="grid grid-cols-2 gap-3">
        {quickAmounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(String(a))}
            className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
              amount === String(a)
                ? "border-primary bg-primary/5 text-primary"
                : "border-outline-variant bg-white hover:border-primary text-on-surface"
            }`}
          >
            {formatCurrencyShort(a)}
          </button>
        ))}
      </div>

      {numAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-surface-container-high rounded-2xl p-5 space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Transaction Fee</span>
            <span className="font-medium text-on-surface">{formatCurrencyShort(fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">You will receive</span>
            <span className="font-semibold text-secondary">{formatCurrencyShort(youReceive)}</span>
          </div>
          <div className="border-t border-outline-variant/30 pt-3 flex justify-between">
            <span className="font-semibold text-on-surface">Total</span>
            <span className="font-bold text-lg text-on-surface">{formatCurrencyShort(numAmount)}</span>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        <label className="block text-label-caps text-on-surface-variant">Payment Method</label>
        <div className="space-y-2">
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-primary bg-primary/5 cursor-pointer">
            <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            </div>
            <div>
              <p className="font-medium text-on-surface">Card Payment</p>
              <p className="text-xs text-on-surface-variant">Pay with debit or credit card</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-outline-variant bg-white cursor-pointer opacity-50">
            <div className="w-5 h-5 rounded-full border-2 border-outline-variant" />
            <div>
              <p className="font-medium text-on-surface">Bank Transfer</p>
              <p className="text-xs text-on-surface-variant">Coming soon</p>
            </div>
          </label>
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue to Payment"}
        </Button>
      </motion.div>
    </motion.div>
  )
}
