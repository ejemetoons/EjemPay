"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { formatCurrencyShort } from "@/lib/utils"
import { calculateServicePrice } from "@/lib/pricing"
import { Loader2, Tv, CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"

interface CablePlan {
  id: string
  name: string
  cable: string
  price: string
  cable_id: string
}

const cableProviders = [
  { id: 1, name: "GOTV", cable_id: "10" },
  { id: 2, name: "DSTV", cable_id: "11" },
  { id: 3, name: "Startimes", cable_id: "12" },
]

export default function CablePage() {
  const [provider, setProvider] = useState<number | null>(null)
  const [iuc, setIuc] = useState("")
  const [plans, setPlans] = useState<CablePlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<CablePlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [validatingIuc, setValidatingIuc] = useState(false)
  const [iucValidated, setIucValidated] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [validationError, setValidationError] = useState("")
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  useEffect(() => {
    async function loadPlans() {
      if (!provider) return
      setLoadingPlans(true)
      setSelectedPlan(null)
      try {
        const res = await fetch(`/api/proxy/get-cable-plan?cable=${cableProviders[provider - 1]?.name}`)
        const data: CablePlan[] = await res.json()
        setPlans(data)
      } catch {
        addToast("error", "Failed to load cable plans")
      } finally {
        setLoadingPlans(false)
      }
    }
    loadPlans()
  }, [provider])

  const validateIuc = useCallback(async () => {
    if (!provider || !iuc.trim()) return
    setValidatingIuc(true)
    setValidationError("")
    setIucValidated(false)
    setCustomerName("")
    try {
      const cableId = cableProviders[provider - 1]?.cable_id
      const res = await fetch("/api/proxy/cable/cable-validation?iuc=" + encodeURIComponent(iuc.trim()) + "&cable=" + cableId)
      const data = await res.json()
      if (data.status === "success") {
        setIucValidated(true)
        setCustomerName(data.name || "Validated")
      } else {
        setValidationError(data.message || "IUC validation failed")
      }
    } catch {
      setValidationError("Validation failed. Check the IUC number.")
    } finally {
      setValidatingIuc(false)
    }
  }, [provider, iuc])

  useEffect(() => {
    setIucValidated(false)
    setCustomerName("")
    setValidationError("")
  }, [iuc, provider])

  const price = selectedPlan ? calculateServicePrice(Number(selectedPlan.price), "cable", user?.tier || "standard") : 0

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

      if (!selectedPlan || !provider) return
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
            service: "cable",
            userPrice: price,
            providerCost: Number(selectedPlan.price),
            beneficiary: iuc,
            apiParams: {
              cable: provider,
              iuc,
              cable_plan: Number(selectedPlan.id),
              bypass: true,
              "request-id": `EJP_CB_${Date.now()}`,
            },
            details: { provider: cableProviders[provider - 1]?.name, iuc, plan: selectedPlan.name },
          }),
        })

        const data = await purchaseRes.json()
        if (data.status === "success") {
          addToast("success", `Cable subscription successful: ${selectedPlan.name}`)
          setBalance(data.newBalance)
        } else {
          addToast("error", data.message || "Purchase failed")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to purchase cable")
      } finally {
        setLoading(false)
      }
    })
  }

  const canSubmit = provider && iuc.trim() && iucValidated && selectedPlan && !validatingIuc

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-on-surface mb-6">Pay Cable TV</h2>

      <Card glass>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-2">Cable Provider</label>
            <div className="grid grid-cols-3 gap-2">
              {cableProviders.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    provider === p.id
                      ? "border-primary bg-surface-container text-primary"
                      : "border-outline-variant bg-white hover:border-primary text-on-surface"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Input
              label="IUC / Smart Card Number"
              placeholder="Enter IUC number"
              value={iuc}
              onChange={(e) => setIuc(e.target.value)}
              onBlur={validateIuc}
              icon={<Tv className="w-4 h-4" />}
            />
            {validatingIuc && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-primary">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Validating IUC number...
              </div>
            )}
            {iucValidated && customerName && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-on-surface bg-surface-container rounded-xl p-3">
                <CheckCircle className="w-4 h-4 text-secondary shrink-0" />
                <span className="font-medium">{customerName}</span>
              </div>
            )}
            {validationError && (
              <div className="flex items-center gap-2 mt-1.5 text-sm text-error">
                <XCircle className="w-3.5 h-3.5" />
                {validationError}
              </div>
            )}
          </div>

          {provider && (
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Plan</label>
              {loadingPlans ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : plans.length === 0 ? (
                <p className="text-on-surface-variant text-center py-4">No plans available</p>
              ) : (
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        selectedPlan?.id === plan.id
                          ? "border-primary bg-surface-container"
                          : "border-outline-variant bg-white hover:border-primary"
                      }`}
                    >
                      <p className="font-medium text-on-surface">{plan.name}</p>
                      <p className="text-sm text-primary">{formatCurrencyShort(Number(plan.price))}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {price > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-surface-container rounded-xl p-4"
            >
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">You pay</span>
                <span className="font-bold text-lg text-primary">{formatCurrencyShort(price)}</span>
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
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Pay Cable"}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
