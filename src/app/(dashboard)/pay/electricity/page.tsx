"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
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

const quickAmounts = [500, 1000, 2000, 5000]

export default function ElectricityPage() {
  const [discos, setDiscos] = useState<DisCo[]>([])
  const [selectedDisco, setSelectedDisco] = useState<string>("")
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid")
  const [meterNumber, setMeterNumber] = useState("")
  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [token, setToken] = useState<string | null>(null)
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
        const purchaseRes = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "electricity",
            userPrice: price,
            providerCost: numAmount,
            beneficiary: meterNumber,
            apiParams: {
              disco: Number(selectedDisco),
              meter_type: meterType,
              meter_number: meterNumber,
              amount: String(amount),
              phone: phone || undefined,
              bypass: true,
              "request-id": `EJP_EL_${Date.now()}`,
            },
            details: { disco: selectedDisco, meter_number: meterNumber, meter_type: meterType, amount: numAmount },
          }),
        })

        const data = await purchaseRes.json()
        if (data.status === "success") {
          setToken(data.token || null)
          addToast("success", "Electricity payment successful!")
          setBalance(data.newBalance)
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4 space-y-5">
      <h2 className="text-h2 font-h2 text-primary">Electricity Bill</h2>

      <div>
        <label className="block text-label-caps text-on-surface-variant mb-3 ml-1">Distribution Company</label>
        {loadingDiscos ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {discos.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDisco(d.id)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  selectedDisco === d.id
                    ? "border-primary bg-surface-container text-primary"
                    : "border-outline-variant bg-white hover:border-primary text-on-surface"
                }`}
              >
                {d.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-label-caps text-on-surface-variant mb-3 ml-1">Meter Type</label>
        <div className="flex gap-2">
          {(["prepaid", "postpaid"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMeterType(type)}
              className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold capitalize transition-all ${
                meterType === type
                  ? "border-primary bg-surface-container text-primary"
                  : "border-outline-variant bg-white hover:border-primary text-on-surface"
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
          <div className="flex items-center gap-2 mt-1.5 text-sm text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Validating meter number...
          </div>
        )}
        {meterValidated && customerName && (
          <div className="mt-1.5 text-sm text-green-700 bg-green-50 dark:text-green-300 dark:bg-green-900/30 rounded-xl p-3 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              <div>
                <p className="font-medium">{customerName}</p>
                {customerAddress && (
                  <p className="text-green-600 dark:text-green-400 text-xs">{customerAddress}</p>
                )}
              </div>
            </div>
          </div>
        )}
        {validationError && (
          <div className="flex items-center gap-2 mt-1.5 text-sm text-error">
            <XCircle className="w-3.5 h-3.5" />
            {validationError}
          </div>
        )}
      </div>

      <Input
        label="Amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
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

      <Input
        label="Phone Number (for SMS token)"
        type="tel"
        placeholder="08012345678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        icon={<Zap className="w-4 h-4" />}
      />

      {price > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface-container rounded-2xl p-5"
        >
          <div className="flex justify-between items-center">
            <span className="text-on-surface-variant text-sm">You Pay</span>
            <span className="font-bold text-xl text-primary">{formatCurrencyShort(price)}</span>
          </div>
        </motion.div>
      )}

      {token && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 dark:bg-green-900/30 rounded-xl p-5 border-2 border-green-300 dark:border-green-700"
        >
          <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">Electricity Token</p>
          <p className="text-2xl font-bold text-green-800 dark:text-green-200 tracking-wider text-center select-all">
            {token}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center">
            Copy this token and use it to recharge your meter
          </p>
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
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Purchase"}
        </Button>
      </motion.div>
    </motion.div>
  )
}
