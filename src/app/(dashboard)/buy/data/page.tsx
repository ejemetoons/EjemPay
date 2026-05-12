"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-logo"
import { NETWORKS, detectNetwork, getNetworkName, getNetworkColor, getNetworkLogo } from "@/lib/network-detector"
import { calculateServicePrice } from "@/lib/pricing"
import { formatCurrencyShort, isValidPhone } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { DATA_TABS, getPlansForTab, formatPricePerGB, getSortedPlans } from "@/lib/data-plans"
import type { DataPlan, PlanTabId } from "@/lib/data-plans"

export default function BuyDataPage() {
  const [phone, setPhone] = useState("")
  const [plans, setPlans] = useState<DataPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [manualOverride, setManualOverride] = useState(false)
  const [activeTab, setActiveTab] = useState<PlanTabId>("hot")
  const tabBarRef = useRef<HTMLDivElement>(null)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  const autoNetwork = detectNetwork(phone)
  const network = manualOverride ? selectedNetwork : autoNetwork

  const handleNetworkSelect = (net: string) => {
    setSelectedNetwork(net)
    setManualOverride(true)
    setSelectedPlan(null)
  }

  const handlePhoneChange = (value: string) => {
    setPhone(value)
    const detected = detectNetwork(value)
    if (detected && !manualOverride) {
      setSelectedNetwork(detected)
    }
    if (!value) {
      setManualOverride(false)
      setSelectedNetwork(null)
    }
  }

  useEffect(() => {
    if (selectedPlan && selectedPlan.network.toLowerCase() !== network) {
      setSelectedPlan(null)
    }
  }, [network])

  useEffect(() => {
    async function loadPlans() {
      if (!network) return
      setLoadingPlans(true)
      setSelectedPlan(null)
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

  const tabPlans = activeTab === "hot" ? getSortedPlans(plans) : getPlansForTab(plans, activeTab)

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

        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "data",
            userPrice: price,
            providerCost: selectedPlan.price,
            beneficiary: phone,
            apiParams: {
              network: networkObj.id,
              phone,
              data_plan: selectedPlan.plan_id,
              Ported_number: true,
              "request-id": `EJP_DT_${Date.now()}`,
            },
            details: {
              phone,
              network: getNetworkName(network),
              plan: selectedPlan.datasize,
              type: selectedPlan.type,
            },
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Data purchase successful: ${selectedPlan.datasize}`)
          setBalance(data.newBalance)
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-h2 font-bold text-on-surface">Buy Data Bundle</h1>
        <p className="text-body-sm text-on-surface-variant">Top up your mobile data instantly.</p>
      </div>

      <div className="space-y-5">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="0801 234 5678"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          icon={<Phone className="w-4 h-4" />}
        />

        {network && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <NetworkBadge network={network} />
          </motion.div>
        )}

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-h3 font-semibold text-on-surface">Select Network</h3>
            {autoNetwork && !manualOverride && (
              <span className="text-[10px] font-bold text-secondary uppercase bg-secondary-container/10 px-2 py-0.5 rounded-full">
                Auto
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {NETWORKS.map((net) => {
              const isSelected = network === net
              const color = getNetworkColor(net)
              const logo = getNetworkLogo(net)
              const name = getNetworkName(net)
              return (
                <button
                  key={net}
                  type="button"
                  onClick={() => handleNetworkSelect(net)}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "bg-surface-container border-primary"
                      : "bg-white border-outline-variant hover:border-primary"
                  }`}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center p-2 shadow-sm"
                    style={{ backgroundColor: color }}
                  >
                    {logo ? (
                      <Image src={logo} alt={name} width={32} height={32} className="object-contain" />
                    ) : (
                      <span className="text-sm font-bold text-white">{name[0]}</span>
                    )}
                  </div>
                  <span className={`text-[10px] uppercase font-bold tracking-wide ${
                    isSelected ? "text-primary" : "text-on-surface-variant"
                  }`}>
                    {name}
                  </span>
                  {isSelected && autoNetwork && !manualOverride && (
                    <span className="text-[8px] font-bold text-secondary uppercase -mt-1">auto</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <div
            ref={tabBarRef}
            className="flex gap-1 overflow-x-auto pb-2 no-scrollbar"
          >
            {DATA_TABS.map((tab) => {
              const planCount = tab.id === "hot" ? getSortedPlans(plans).length : getPlansForTab(plans, tab.id).length
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedPlan(null) }}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-primary text-on-primary shadow-md"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {tab.label}
                  {planCount > 0 && (
                    <span className={`ml-1.5 text-xs ${activeTab === tab.id ? "text-purple-200" : "text-outline"}`}>
                      ({planCount})
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <h3 className="text-h3 font-semibold text-on-surface mb-3 mt-3">Choose Bundle</h3>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : tabPlans.length === 0 ? (
            <p className="text-on-surface-variant text-center py-4 text-body-sm">
              {network ? `No ${activeTab === "hot" ? "" : activeTab} plans available` : "Enter a phone number or select a network to see plans"}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 max-h-[calc(100vh-480px)] min-h-[120px] overflow-y-auto">
              {tabPlans.map((plan) => {
                const ppgb = formatPricePerGB(plan)
                return (
                  <motion.button
                    key={plan.plan_id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-3 ${
                      selectedPlan?.plan_id === plan.plan_id
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-outline-variant bg-white hover:border-primary hover:shadow-sm"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-on-surface truncate">{plan.datasize}</p>
                        {activeTab === "hot" && ppgb && (
                          <span className="shrink-0 text-[10px] font-bold text-secondary bg-secondary-container/10 px-1.5 py-0.5 rounded">
                            {ppgb}
                          </span>
                        )}
                      </div>
                      <p className="text-body-sm text-on-surface-variant mt-0.5 truncate">
                        {plan.type} &middot; {plan.day} {parseInt(plan.day) === 1 ? "day" : "days"}
                      </p>
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-1">
                      <p className="font-black text-primary whitespace-nowrap">
                        {formatCurrencyShort(
                          calculateServicePrice(plan.price, "data", user?.tier || "standard")
                        )}
                      </p>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan?.plan_id === plan.plan_id
                          ? "border-primary"
                          : "border-outline-variant"
                      }`}>
                        {selectedPlan?.plan_id === plan.plan_id && (
                          <div className="w-3 h-3 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {price > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-surface-container rounded-2xl p-5"
          >
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant">You pay</span>
              <span className="font-bold text-2xl text-primary">{formatCurrencyShort(price)}</span>
            </div>
          </motion.div>
        )}

        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handlePurchase}
            className="w-full"
            size="lg"
            disabled={!isValidPhone(phone) || !selectedPlan || loading || !network}
            isLoading={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy Data Now"}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}
