"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatCurrencyShort } from "@/lib/utils"
import { getUpgradeFee, formatPrice } from "@/lib/pricing"
import { Crown, User, Phone, Lock, Mail, Calendar, LogOut, Tag } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function SettingsPage() {
  const { user, setUser, clearSession } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { addToast, openPinModal } = useUiStore()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "")
      setPhone(user.phone || "")
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, phone })
        .eq("id", user.id)

      if (error) throw error

      setUser({ ...user, full_name: fullName, phone })
      addToast("success", "Profile updated successfully")
    } catch (err: unknown) {
      addToast("error", err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSetPin = () => {
    if (!user) return
    openPinModal(async (pin: string) => {
      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        addToast("error", "PIN must be exactly 4 digits")
        return
      }

      setLoading(true)
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ tx_pin: pin })
          .eq("id", user.id)

        if (error) throw error

        setUser({ ...user, tx_pin: pin })
        addToast("success", "Transaction PIN set successfully")
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Failed to set PIN")
      } finally {
        setLoading(false)
      }
    })
  }

  const handleUpgrade = async () => {
    if (!user) return
    const fee = getUpgradeFee()

    if (balance < fee) {
      addToast("error", `Insufficient balance. Upgrade fee is ${formatPrice(fee)}`)
      return
    }

    openPinModal(async (pin: string) => {
      if (pin !== user.tx_pin) {
        addToast("error", "Incorrect PIN")
        return
      }

      setUpgrading(true)
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ tier: "reseller" })
          .eq("id", user.id)

        if (error) throw error

        await supabase.from("transactions").insert({
          user_id: user.id,
          type: "upgrade",
          amount: fee,
          fee: 0,
          status: "success",
          details: { from: "standard", to: "reseller" },
        })

        await supabase
          .from("wallets")
          .update({ balance: balance - fee })
          .eq("user_id", user.id)

        setUser({ ...user, tier: "reseller" })
        setBalance(balance - fee)
        addToast("success", "Upgraded to Top Seller tier!")
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Upgrade failed")
      } finally {
        setUpgrading(false)
      }
    })
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await supabase.auth.signOut()
      clearSession()
      router.push("/login")
    } catch {
      addToast("error", "Failed to log out")
    } finally {
      setLoggingOut(false)
    }
  }

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-on-surface">Settings</h2>
        <Button onClick={handleLogout} variant="ghost" isLoading={loggingOut} className="!px-4 text-error hover:bg-error-container/20">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>

      <Card>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            icon={<User className="w-4 h-4" />}
          />
          <Input
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4" />}
          />
          <Button type="submit" isLoading={loading}>Update Profile</Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Account Info
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="w-4 h-4 text-outline" />
            <span className="text-on-surface-variant">Email:</span>
            <span className="text-on-surface font-medium">{user?.email}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-on-surface-variant">Tier:</span>
            <span className={`font-semibold capitalize ${user?.tier === "reseller" ? "text-yellow-600" : "text-on-surface"}`}>
              {user?.tier === "reseller" ? "Top Seller" : "Standard"}
            </span>
          </div>
          {memberSince && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-outline" />
              <span className="text-on-surface-variant">Member since:</span>
              <span className="text-on-surface">{memberSince}</span>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Transaction PIN
        </h3>
        <p className="text-sm text-on-surface-variant mb-4">
          {user?.tx_pin ? "Your transaction PIN is set." : "Set a 4-digit PIN for transaction authorization."}
        </p>
        <Button onClick={handleSetPin} variant={user?.tx_pin ? "secondary" : "primary"} isLoading={loading}>
          {user?.tx_pin ? "Change PIN" : "Set PIN"}
        </Button>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-600" />
          Top Seller Upgrade
        </h3>
        <p className="text-sm text-on-surface-variant mb-4">
          Current tier: <span className="font-semibold capitalize text-on-surface">{user?.tier === "reseller" ? "Top Seller" : "Standard"}</span>
        </p>
        {user?.tier === "standard" ? (
          <div className="space-y-4">
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-on-surface">Discounted Data Pricing</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                Standard tier users pay <span className="font-medium text-on-surface">affordable rates</span> on all data bundles. Upgrade to Top Seller for even lower prices.
              </p>
            </div>
            <p className="text-sm text-on-surface-variant">
              Upgrade to Top Seller for <span className="font-semibold text-secondary">discounted prices</span> on data and other services. One-time fee of {formatPrice(getUpgradeFee())}.
            </p>
            <Button onClick={handleUpgrade} isLoading={upgrading}>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Top Seller
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-secondary" />
                <span className="text-sm font-semibold text-on-surface">You're on discounted pricing!</span>
              </div>
              <p className="text-sm text-on-surface-variant">
                As a Top Seller, you enjoy the lowest prices on data bundles and other services.
              </p>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  )
}
