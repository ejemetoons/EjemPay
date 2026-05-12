"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getUpgradeFee, formatPrice } from "@/lib/pricing"
import {
  Crown,
  User,
  Lock,
  KeyRound,
  Moon,
  Fingerprint,
  LifeBuoy,
  Shield,
  Info,
  LogOut,
  ChevronRight,
  Mail,
  Calendar,
  Phone,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        enabled ? "bg-primary" : "bg-outline/30"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { user, setUser, clearSession } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { addToast, openPinModal } = useUiStore()
  const { theme, toggle: toggleTheme } = useTheme()
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [editing, setEditing] = useState(false)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setFullName(user.full_name || "")
      setPhone(user.phone || "")
      /* eslint-enable react-hooks/set-state-in-effect */
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
      setEditing(false)
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

  const firstLetter =
    user?.full_name?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "U"

  const isReseller = user?.tier === "reseller"

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 pb-8">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary-container to-primary rounded-2xl p-6 shadow-[0_4px_12px_rgba(91,45,142,0.15)]">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full border-4 border-secondary-container flex items-center justify-center text-white font-bold text-2xl bg-primary">
            {firstLetter}
          </div>
          <h2 className="text-xl font-bold text-white mt-3">
            {user?.full_name || "User"}
          </h2>
          <p className="text-purple-200 text-body-sm">
            {user?.email || user?.phone || ""}
          </p>
          {isReseller ? (
            <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-secondary-container text-on-secondary-container">
              Top Seller
            </span>
          ) : (
            <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/10 text-white">
              Standard
            </span>
          )}
        </div>
      </div>

      {/* ACCOUNT */}
      <div>
        <p className="text-label-caps text-outline uppercase mb-2 ml-1">Account</p>
        <div className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden divide-y divide-outline-variant/30">
          {/* Edit Profile */}
          <div>
            <button
              onClick={() => setEditing(!editing)}
              className="w-full flex items-center justify-between p-4"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                  <User className="w-5 h-5 text-on-surface" />
                </div>
                <span className="font-medium text-on-surface ml-3">Edit Profile</span>
              </div>
              <ChevronRight className="w-5 h-5 text-outline" />
            </button>
            {editing && (
              <div className="px-4 pb-4">
                <form onSubmit={handleUpdateProfile} className="space-y-3">
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
                  <Button type="submit" isLoading={loading} className="w-full">
                    Save Changes
                  </Button>
                </form>
              </div>
            )}
          </div>
          {/* Change PIN */}
          <button
            onClick={handleSetPin}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Lock className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Change PIN</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </button>
          {/* Change Password */}
          <button
            onClick={() => addToast("info", "Change password coming soon")}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Change Password</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </button>
        </div>
      </div>

      {/* PREFERENCES */}
      <div>
        <p className="text-label-caps text-outline uppercase mb-2 ml-1">Preferences</p>
        <div className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden divide-y divide-outline-variant/30">
          {/* Biometric Login */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Fingerprint className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Biometric Login</span>
            </div>
            <Toggle enabled={biometricEnabled} onToggle={() => setBiometricEnabled(!biometricEnabled)} />
          </div>
          {/* Dark Mode */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Moon className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Dark Mode</span>
            </div>
            <Toggle enabled={theme === "dark"} onToggle={toggleTheme} />
          </div>
        </div>
      </div>

      {/* SUPPORT */}
      <div>
        <p className="text-label-caps text-outline uppercase mb-2 ml-1">Support</p>
        <div className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden divide-y divide-outline-variant/30">
          <a href="#" className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <LifeBuoy className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Help Center</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </a>
          <a href="#" className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Shield className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">Privacy Policy</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </a>
          <a href="#" className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <Info className="w-5 h-5 text-on-surface" />
              </div>
              <span className="font-medium text-on-surface ml-3">About</span>
            </div>
            <ChevronRight className="w-5 h-5 text-outline" />
          </a>
        </div>
      </div>

      {/* ACTIONS */}
      <div>
        <p className="text-label-caps text-outline uppercase mb-2 ml-1">Actions</p>
        <div className="bg-white rounded-2xl border border-outline-variant/50 overflow-hidden divide-y divide-outline-variant/30">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center">
                <LogOut className="w-5 h-5 text-error" />
              </div>
              <span className="font-medium text-error ml-3">
                {loggingOut ? "Logging out..." : "Logout"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl border border-outline-variant/50 p-4 space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-outline shrink-0" />
          <span className="text-on-surface-variant">Email:</span>
          <span className="text-on-surface font-medium">{user?.email}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Crown className="w-4 h-4 text-yellow-500 shrink-0" />
          <span className="text-on-surface-variant">Tier:</span>
          <span
            className={`font-semibold capitalize ${
              isReseller ? "text-yellow-600" : "text-on-surface"
            }`}
          >
            {isReseller ? "Top Seller" : "Standard"}
          </span>
        </div>
        {memberSince && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-outline shrink-0" />
            <span className="text-on-surface-variant">Member since:</span>
            <span className="text-on-surface">{memberSince}</span>
          </div>
        )}
      </div>

      {/* Upgrade Card */}
      {!isReseller && (
        <div className="bg-white rounded-2xl border border-outline-variant/50 p-5 space-y-4">
          <h3 className="font-semibold text-on-surface flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            Top Seller Upgrade
          </h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Upgrade your account to Top Seller tier and enjoy{" "}
            <span className="font-semibold text-secondary">discounted prices</span> on data
            bundles and other services. One-time fee of{" "}
            <span className="font-semibold text-on-surface">{formatPrice(getUpgradeFee())}</span>.
          </p>
          <Button onClick={handleUpgrade} isLoading={upgrading} className="w-full">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Top Seller
          </Button>
        </div>
      )}
    </motion.div>
  )
}
