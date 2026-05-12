"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { NetworkBadge } from "@/components/ui/network-logo"
import { NetworkSelector } from "@/components/ui/network-selector"
import { detectNetwork, getNetworkName } from "@/lib/network-detector"
import { calculateServicePrice } from "@/lib/pricing"
import { formatCurrencyShort, isValidPhone } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Phone } from "lucide-react"
import { motion } from "framer-motion"

export default function BuyAirtimePage() {
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null)
  const [manualOverride, setManualOverride] = useState(false)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  const autoNetwork = detectNetwork(phone)
  const network = manualOverride ? selectedNetwork : autoNetwork

  const handleNetworkSelect = (net: string) => {
    setSelectedNetwork(net)
    setManualOverride(true)
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

  const apiCost = Number(amount) || 0
  const price = calculateServicePrice(apiCost, "airtime", user?.tier || "standard")

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
        const networks = await fetch("/api/proxy/get-networks?service=airtime").then((r) => r.json())
        const networkObj = networks.find(
          (n: { network: string }) => n.network.toLowerCase() === network
        )

        if (!networkObj) throw new Error("Network not found")

        const res = await fetch("/api/purchase", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service: "airtime",
            userPrice: price,
            providerCost: apiCost,
            beneficiary: phone,
            apiParams: {
              network: networkObj.id,
              phone,
              amount: String(amount),
              plan_type: "VTU",
              Ported_number: true,
              "request-id": `EJP_AT_${Date.now()}`,
            },
            details: { phone, network: getNetworkName(network), amount: Number(amount) },
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Airtime purchase successful: ${getNetworkName(network)} ${formatCurrencyShort(Number(amount))}`)
          setBalance(data.newBalance)
        } else {
          addToast("error", data.message || "Purchase failed")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to purchase airtime")
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-h2 font-h2 text-primary">Buy Airtime</h2>
        <p className="text-body-sm text-on-surface-variant">Top up any Nigerian number instantly.</p>
      </div>

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handlePurchase()
          }}
          className="space-y-5"
        >
          <Input
            label="Phone Number"
            type="tel"
            placeholder="0801 234 5678"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            required
          />

          {network && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <NetworkBadge network={network} />
            </motion.div>
          )}

          <NetworkSelector
            selected={selectedNetwork}
            onSelect={handleNetworkSelect}
            autoDetected={!!autoNetwork && !manualOverride}
          />

          <div>
            <label className="block text-label-caps text-on-surface-variant mb-2 ml-1">QUICK AMOUNTS</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[100, 200, 500, 1000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(String(preset))}
                  className={`p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    Number(amount) === preset
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-outline-variant bg-white hover:border-primary text-on-surface"
                  }`}
                >
                  ₦{preset}
                </button>
              ))}
            </div>
            <Input
              label="Custom Amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
            />
          </div>

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
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isValidPhone(phone) || !amount || loading || !network}
              isLoading={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Buy Airtime"}
            </Button>
          </motion.div>
        </form>
      </Card>
    </motion.div>
  )
}
