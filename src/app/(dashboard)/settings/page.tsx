"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { createClient } from "@/lib/supabase/client"
import { getUpgradeFee, formatPrice } from "@/lib/pricing"
import { Loader2, Crown, User, Phone, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { user, setUser } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [newPin, setNewPin] = useState("")
  const [upgrading, setUpgrading] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, full_name: fullName, phone })
      addToast("success", "Profile updated")
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleSetPin = async () => {
    if (!user || newPin.length !== 4) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ tx_pin: newPin })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, tx_pin: newPin })
      setNewPin("")
      addToast("success", "Transaction PIN set successfully")
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Failed to set PIN")
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = () => {
    if (user?.tier === "reseller") {
      addToast("info", "You are already a reseller")
      return
    }

    if (balance < getUpgradeFee()) {
      addToast("error", `Insufficient balance. You need ${formatPrice(getUpgradeFee())} to upgrade.`)
      return
    }

    openPinModal(async (pin: string) => {
      if (pin !== user?.tx_pin) {
        addToast("error", "Incorrect PIN")
        return
      }

      setUpgrading(true)

      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ tier: "reseller" })
          .eq("id", user.id)

        if (profileError) throw profileError

        const newBalance = balance - getUpgradeFee()
        await supabase.from("wallets").update({ balance: newBalance }).eq("user_id", user.id)

        await supabase.from("transactions").insert({
          user_id: user.id,
          type: "upgrade",
          amount: getUpgradeFee(),
          fee: 0,
          status: "success",
          details: { from: "standard", to: "reseller" },
        })

        setUser({ ...user, tier: "reseller" })
        setBalance(newBalance)
        addToast("success", "Upgraded to Reseller! Enjoy lower prices.")
        router.refresh()
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Upgrade failed")
      } finally {
        setUpgrading(false)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      {/* Profile */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Profile
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" isLoading={saving}>
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Transaction PIN */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Transaction PIN
        </h3>
        <div className="space-y-4">
          <Input
            label="New 4-digit PIN"
            type="password"
            maxLength={4}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="Enter new PIN"
          />
          <Button onClick={handleSetPin} disabled={newPin.length !== 4} isLoading={saving}>
            Set PIN
          </Button>
        </div>
      </Card>

      {/* Upgrade to Reseller */}
      <Card glass={user?.tier !== "reseller"}>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Membership
        </h3>

        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Current Tier</p>
              <p className="text-xl font-bold capitalize">{user?.tier || "standard"}</p>
            </div>
            {user?.tier === "reseller" ? (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Reseller Active
              </span>
            ) : (
              <Button onClick={handleUpgrade} isLoading={upgrading}>
                Upgrade — {formatPrice(getUpgradeFee())}
              </Button>
            )}
          </div>
        </div>

        {user?.tier !== "reseller" && (
          <div className="space-y-2 text-sm text-gray-600">
            <p className="font-medium">Reseller benefits:</p>
            <ul className="space-y-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Data: API + ₦7 (vs ₦20 for Standard)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Airtime/Bills: API + 1% (vs 3% for Standard)
              </li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}
