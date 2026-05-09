"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateTopUpFee, getAmountToReceive } from "@/lib/pricing"
import { formatCurrencyShort } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { initiatePayment, getSquadPublicKey } from "@/lib/services/squad"
import { generateRequestId } from "@/lib/utils"
import { Loader2, Wallet, Info } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000]

export default function FundWalletPage() {
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const supabase = createClient()

  const numAmount = Number(amount) || 0
  const fee = calculateTopUpFee(numAmount)
  const youReceive = getAmountToReceive(numAmount)

  const handleFund = async () => {
    if (!user) return
    setLoading(true)

    try {
      const transactionRef = generateRequestId("EJP_FW")

      const result = await initiatePayment({
        amount: numAmount,
        email: user.email,
        customerName: user.full_name || "User",
        transactionRef,
        metadata: {
          user_id: user.id,
          type: "fund_wallet",
        },
      })

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
      console.error("Payment initiation failed:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Fund Wallet</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Amounts</label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className={`p-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    amount === String(a)
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300"
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
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You pay</span>
                <span className="font-semibold">{formatCurrencyShort(numAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Processing fee</span>
                <span className="text-red-500">-{formatCurrencyShort(fee)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-semibold">You receive</span>
                <span className="font-bold text-lg text-green-600">{formatCurrencyShort(youReceive)}</span>
              </div>
            </div>
          )}

          <div className="bg-blue-50 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">Secure Payment</p>
              <p className="text-xs text-blue-600 mt-1">
                Payments are processed securely via Squad. Your wallet will be credited instantly after payment.
              </p>
            </div>
          </div>

          <Button
            onClick={handleFund}
            className="w-full"
            size="lg"
            disabled={numAmount < 100 || loading}
            isLoading={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fund Wallet"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
