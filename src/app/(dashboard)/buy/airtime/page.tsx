"use client"

import { useState } from "react"
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

export default function BuyAirtimePage() {
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  const network = detectNetwork(phone)
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

        const res = await fetch("/api/proxy/airtime", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: networkObj.id,
            phone,
            amount: String(amount),
            "request-id": `EJP_AT_${Date.now()}`,
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          addToast("success", `Airtime purchase successful: ${getNetworkName(network)} ${formatCurrencyShort(Number(amount))}`)
          setBalance(balance - price)

          const supabase = createClient()
          await supabase.from("transactions").insert({
            user_id: user.id,
            type: "airtime",
            amount: price,
            fee: price - apiCost,
            status: "success",
            details: { phone, network: getNetworkName(network), amount: Number(amount) },
            api_reference: data["request-id"],
          })
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Buy Airtime</h2>

      <Card glass>
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
            placeholder="08012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
            required
          />

          {network && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <NetworkBadge network={network} />
            </motion.div>
          )}

          <Input
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            min="50"
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
              type="submit"
              className="w-full"
              size="lg"
              disabled={!isValidPhone(phone) || !amount || loading}
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
