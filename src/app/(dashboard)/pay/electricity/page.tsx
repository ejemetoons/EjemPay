"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateServicePrice } from "@/lib/pricing"
import { formatCurrencyShort } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Zap } from "lucide-react"

interface DisCo {
  id: string
  name: string
  abb: string
}

export default function PayElectricityPage() {
  const [discos, setDiscos] = useState<DisCo[]>([])
  const [selectedDisco, setSelectedDisco] = useState<DisCo | null>(null)
  const [meterNumber, setMeterNumber] = useState("")
  const [meterType, setMeterType] = useState<"prepaid" | "postpaid">("prepaid")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingDiscos, setLoadingDiscos] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validatedName, setValidatedName] = useState("")
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  useEffect(() => {
    async function loadDiscos() {
      setLoadingDiscos(true)
      try {
        const res = await fetch("/api/proxy/get-bill")
        const data = await res.json()
        setDiscos(data)
      } catch {
        addToast("error", "Failed to load DisCos")
      } finally {
        setLoadingDiscos(false)
      }
    }
    loadDiscos()
  }, [])

  const apiCost = Number(amount) || 0
  const price = calculateServicePrice(apiCost, "electricity", user?.tier || "standard")

  const validateMeter = async () => {
    if (!selectedDisco || !meterNumber) return
    setValidating(true)
    try {
      const res = await fetch(
        `/api/proxy/bill/bill-validation?meter_number=${encodeURIComponent(meterNumber)}&meter_type=${meterType}&disco=${selectedDisco.id}`
      )
      const data = await res.json()
      if (data.status === "success") {
        setValidatedName(data.name)
        addToast("success", `Validated: ${data.name}`)
      } else {
        addToast("error", data.message || "Validation failed")
      }
    } catch {
      addToast("error", "Validation failed")
    } finally {
      setValidating(false)
    }
  }

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
        const res = await fetch("/api/proxy/bill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            disco: Number(selectedDisco?.id),
            meter_type: meterType,
            meter_number: meterNumber,
            amount: String(amount),
            "request-id": `EJP_EL_${Date.now()}`,
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Electricity payment successful`)
          setBalance(balance - price)

          const supabase = createClient()
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "electricity",
            amount: price,
            fee: price - apiCost,
            status: "success",
            details: {
              meter: meterNumber,
              disco: selectedDisco?.name,
              type: meterType,
              token: data.token,
            },
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

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Electricity</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">DisCo Provider</label>
            {loadingDiscos ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <select
                value={selectedDisco?.id || ""}
                onChange={(e) => {
                  const disco = discos.find((d) => d.id === e.target.value)
                  setSelectedDisco(disco || null)
                  setValidatedName("")
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select DisCo</option>
                {discos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <Input
              label="Meter Number"
              type="text"
              placeholder="Enter meter number"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
            />
            {validatedName && (
              <p className="text-sm text-green-600 mt-1">✓ {validatedName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meter Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(["prepaid", "postpaid"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setMeterType(type)
                    setValidatedName("")
                  }}
                  className={`p-3 rounded-xl border-2 text-center capitalize transition-all ${
                    meterType === type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Zap className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                  {type}
                </button>
              ))}
            </div>
          </div>

          {selectedDisco && meterNumber && !validatedName && (
            <Button
              variant="secondary"
              onClick={validateMeter}
              isLoading={validating}
              className="w-full"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validate Meter"}
            </Button>
          )}

          <Input
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="100"
          />

          {price > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">You pay</span>
                <span className="font-bold text-lg text-blue-700">{formatCurrencyShort(price)}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handlePurchase}
            className="w-full"
            size="lg"
            disabled={!validatedName || !amount || loading}
            isLoading={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
