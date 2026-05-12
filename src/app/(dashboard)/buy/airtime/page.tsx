"use client"

import { useState } from "react"
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6">
        <h1 className="text-h2 font-bold text-on-surface">Buy Airtime</h1>
        <p className="text-body-sm text-on-surface-variant">Top up any Nigerian number instantly.</p>
      </div>

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
          <p className="text-label-caps text-on-surface-variant mb-2 ml-1">QUICK AMOUNTS</p>
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[100, 200, 500, 1000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(String(preset))}
                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
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
    </motion.div>
  )
}
