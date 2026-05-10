"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { createClient } from "@/lib/supabase/client"
import { formatCurrencyShort } from "@/lib/utils"
import { calculateServicePrice } from "@/lib/pricing"
import { Loader2, Zap, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

interface DisCo {
  id: string
  name: string
  abb: string
  apidiscount: string
}

export default function ElectricityPage() {
  const [discos, setDiscos] = useState<DisCo[]>([])
  const [selectedDisco, setSelectedDisco] = useState<string>("")
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid")
  const [meterNumber, setMeterNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingDiscos, setLoadingDiscos] = useState(true)
  const [validatingMeter, setValidatingMeter] = useState(false)
  const [meterValidated, setMeterValidated] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [customerAddress, setCustomerAddress] = useState("")
  const [validationError, setValidationError] = useState("")
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/proxy/get-bill")
        const data: DisCo[] = await res.json()
        setDiscos(data)
      } catch {
        addToast("error", "Failed to load electricity providers")
      } finally {
        setLoadingDiscos(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    setMeterValidated(false)
    setCustomerName("")
    setCustomerAddress("")
    setValidationError("")
  }, [meterNumber, meterType, selectedDisco])

  const validateMeter = useCallback(async () => {
    if (!selectedDisco || !meterNumber.trim()) return
    setValidatingMeter(true)
    setValidationError("")
    setMeterValidated(false)
    setCustomerName("")
    setCustomerAddress("")
    try {
      const res = await fetch(`/api/proxy/bill/bill-validation?meter_number=${meterNumber.trim()}&meter_type=${meterType}&disco=${selectedDisco}`)
      const data = await res.json()
      if (data.status === "success") {
        setMeterValidated(true)
        setCustomerName(data.name || "Validated")
        setCustomerAddress(data.customer_address || "")
      } else {
        setValidationError(data.message || "Meter validation failed")
      }
    } catch {
      setValidationError("Validation failed. Check the meter number.")
    } finally {
      setValidatingMeter(false)
    }
  }, [selectedDisco, meterNumber, meterType])

  const numAmount = Number(amount) || 0
  const price = calculateServicePrice(numAmount, "electricity", user?.tier || "standard")

  const handlePurchase = () => {
    if (!user?.tx_pin) {
      addToast("error", "Please set your transaction PIN in settings first")
      return
    }

    openPinModal(async (pin: string) => {
      if (pin !== user.tx_pin) {
        addToast("error", "Incorrect PIN")
        return
      }

      if (balance < price) {
        addToast("error", "Insufficient wallet balance")
        return
      }

      setLoading(true)
      try {
        const purchaseRes = await fetch("/api/proxy/bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disco: Number(selectedDisco),
            meter_type: meterType,
            meter_number: meterNumber,
            amount: String(amount),
            "request-id": `EJP_EL_${Date.now()}`,
          }),
        })

        const data = await purchaseRes.json()
        if (data.status === "success") {
          addToast("success", "Electricity payment successful!")
          setBalance(balance - price)

          const supabase = createClient()
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "electricity",
            amount: price,
            fee: price - numAmount,
            status: "success",
            details: { disco: selectedDisco, meter_number: meterNumber, meter_type: meterType, amount: numAmount },
            api_reference: data["request-id"],
          })
        } else {
          addToast("error", data.message || "Payment failed")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to pay electricity")
      } finally {
        setLoading(false)
      }
    })
  }

  const canSubmit = selectedDisco && meterNumber.trim() && meterValidated && amount && !validatingMeter

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Pay Electricity</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distribution Company</label>
            {loadingDiscos ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              </div>
            ) : (
              <select
                value={selectedDisco}
                onChange={(e) => setSelectedDisco(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select DisCo</option>
                {discos.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} ({d.abb})</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Meter Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(["prepaid", "postpaid"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMeterType(type)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${
                    meterType === type
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-400 text-blue-700 dark:text-blue-300"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-900 dark:text-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Meter Number"
              placeholder="Enter meter number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              onBlur={validateMeter}
              icon={<Zap className="w-4 h-4" />}
            />
            {validatingMeter && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-blue-600 dark:text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Validating meter number...
              </div>
            )}
            {meterValidated && customerName && (
              <div className="mt-1.5 text-sm text-green-600 dark:text-green-400 space-y-0.5">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {customerName}
                </div>
                {customerAddress && (
                  <p className="text-gray-500 dark:text-gray-400 ml-5">{customerAddress}</p>
                )}
              </div>
            )}
            {validationError && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-red-500">
                <XCircle className="w-3.5 h-3.5" />
                {validationError}
              </div>
            )}
          </div>

          <Input
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          {price > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">You pay</span>
                <span className="font-bold text-lg text-blue-700 dark:text-blue-300">{formatCurrencyShort(price)}</span>
              </div>
            </motion.div>
          )}

          <motion.div whileTap={{ scale: 0.98 }}>
            <Button
              onClick={handlePurchase}
              className="w-full"
              size="lg"
              disabled={!canSubmit || loading}
              isLoading={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Electricity"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
