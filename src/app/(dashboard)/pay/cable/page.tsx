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
import { Loader2, Tv } from "lucide-react"

interface CablePlan {
  id: string
  name: string
  cable: string
  price: string
  cable_id: string
}

const cableProviders = [
  { name: "GOTV", id: 1 },
  { name: "DSTV", id: 2 },
  { name: "Startimes", id: 3 },
]

export default function PayCablePage() {
  const [selectedProvider, setSelectedProvider] = useState<{ name: string; id: number } | null>(null)
  const [iuc, setIuc] = useState("")
  const [plans, setPlans] = useState<CablePlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<CablePlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validatedName, setValidatedName] = useState("")
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  useEffect(() => {
    async function loadPlans() {
      if (!selectedProvider) return
      setLoadingPlans(true)
      try {
        const res = await fetch(`/api/proxy/get-cable-plan?cable=${selectedProvider.name}`)
        const data = await res.json()
        setPlans(data)
      } catch {
        addToast("error", "Failed to load cable plans")
      } finally {
        setLoadingPlans(false)
      }
    }
    loadPlans()
  }, [selectedProvider])

  const price = selectedPlan
    ? calculateServicePrice(Number(selectedPlan.price), "cable", user?.tier || "standard")
    : 0

  const validateIuc = async () => {
    if (!selectedProvider || !iuc) return
    setValidating(true)
    try {
      const res = await fetch(
        `/api/proxy/cable/cable-validation?iuc=${encodeURIComponent(iuc)}&cable=${selectedProvider.id}`
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

      if (!selectedPlan) return
      if (balance < price) {
        addToast("error", "Insufficient wallet balance")
        return
      }

      setLoading(true)

      try {
        const res = await fetch("/api/proxy/cable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cable: selectedProvider?.id,
            iuc,
            cable_plan: Number(selectedPlan.id),
            "request-id": `EJP_CB_${Date.now()}`,
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Cable payment successful: ${selectedPlan.name}`)
          setBalance(balance - price)

          const supabase = createClient()
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "cable",
            amount: price,
            fee: price - Number(selectedPlan.price),
            status: "success",
            details: {
              iuc,
              plan: selectedPlan.name,
              provider: selectedProvider?.name,
            },
            api_reference: data["request-id"],
          })
        } else {
          addToast("error", data.message || "Payment failed")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to pay cable")
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pay Cable TV</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Provider</label>
            <div className="grid grid-cols-3 gap-3">
              {cableProviders.map((p) => (
                <button
                  key={p.name}
                  onClick={() => {
                    setSelectedProvider(p)
                    setPlans([])
                    setSelectedPlan(null)
                    setValidatedName("")
                  }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedProvider?.name === p.name
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Tv className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                  <p className="text-sm font-medium">{p.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="Smart Card / IUC Number"
              type="text"
              placeholder="Enter IUC number"
              value={iuc}
              onChange={(e) => setIuc(e.target.value)}
            />
            {validatedName && (
              <p className="text-sm text-green-600 mt-1">✓ {validatedName}</p>
            )}
          </div>

          {selectedProvider && iuc && !validatedName && (
            <Button
              variant="secondary"
              onClick={validateIuc}
              isLoading={validating}
              className="w-full"
            >
              {validating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Validate IUC"}
            </Button>
          )}

          {loadingPlans && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}

          {plans.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {plans.map((plan) => (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex justify-between ${
                      selectedPlan?.id === plan.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-blue-600 font-semibold">
                      {formatCurrencyShort(
                        calculateServicePrice(Number(plan.price), "cable", user?.tier || "standard")
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

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
            disabled={!selectedPlan || !validatedName || loading}
            isLoading={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Now"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
