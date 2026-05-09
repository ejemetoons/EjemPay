"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-logo"
import { detectNetwork, getNetworkName } from "@/lib/network-detector"
import { calculateServicePrice } from "@/lib/pricing"
import { formatCurrencyShort, isValidPhone } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Phone } from "lucide-react"
import { motion } from "framer-motion"

interface DataPlan {
  plan_id: number
  day: string
  type: string
  network: string
  datasize: string
  price: number
}

export default function BuyDataPage() {
  const [phone, setPhone] = useState("")
  const [plans, setPlans] = useState<DataPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  const network = detectNetwork(phone)

  useEffect(() => {
    async function loadPlans() {
      if (!network) return
      setLoadingPlans(true)
      try {
        const res = await fetch("/api/proxy/data_plans")
        const data = await res.json()
        const filtered = data.filter(
          (p: DataPlan) => p.network.toLowerCase() === network
        )
        setPlans(filtered)
      } catch {
        addToast("error", "Failed to load data plans")
      } finally {
        setLoadingPlans(false)
      }
    }
    loadPlans()
  }, [network])

  const price = selectedPlan ? calculateServicePrice(selectedPlan.price, "data", user?.tier || "standard") : 0

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
        const networks = await fetch("/api/proxy/get-networks?service=airtime").then((r) => r.json())
        const networkObj = networks.find(
          (n: { network: string }) => n.network.toLowerCase() === network
        )

        if (!networkObj) throw new Error("Network not found")

        const res = await fetch("/api/proxy/data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: networkObj.id,
            phone,
            data_plan: selectedPlan.plan_id,
            "request-id": `EJP_DT_${Date.now()}`,
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Data purchase successful: ${selectedPlan.datasize}`)
          setBalance(balance - price)

          const supabase = createClient()
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "data",
            amount: price,
            fee: price - selectedPlan.price,
            status: "success",
            details: {
              phone,
              network: getNetworkName(network),
              plan: selectedPlan.datasize,
              type: selectedPlan.type,
            },
            api_reference: data["request-id"],
          })
        } else {
          addToast("error", data.message || "Purchase failed")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to purchase data")
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Buy Data</h2>

      <Card glass>
        <div className="space-y-5">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />

          {network && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <NetworkBadge network={network} />
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Plan
            </label>

            {loadingPlans ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : plans.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                {network ? "No plans available" : "Enter a phone number to see plans"}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {plans.map((plan) => (
                  <button
                    key={plan.plan_id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedPlan?.plan_id === plan.plan_id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="font-semibold">{plan.datasize}</p>
                    <p className="text-xs text-gray-500">
                      {plan.type} - {plan.day} days
                    </p>
                    <p className="text-sm font-medium text-blue-600 mt-1">
                      {formatCurrencyShort(
                        calculateServicePrice(plan.price, "data", user?.tier || "standard")
                      )}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

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
            disabled={!isValidPhone(phone) || !selectedPlan || loading}
            isLoading={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy Data"}
          </Button>
        </div>
      </Card>
    </div>
  )
}
