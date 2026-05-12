"use client"

import { motion } from "framer-motion"
import { Gift, Copy, Share2, Users, TrendingUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useUiStore } from "@/store/useUiStore"

export default function ReferralPage() {
  const [copied, setCopied] = useState(false)
  const { addToast } = useUiStore()

  const referralCode = "EXCEL2025"
  const referralLink = `https://ejempay.com/ref/${referralCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    addToast("success", "Referral code copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Ejempay",
        text: `Use my referral code ${referralCode} to sign up on Ejempay and get instant discounts!`,
        url: referralLink,
      })
    } else {
      navigator.clipboard.writeText(referralLink)
      addToast("success", "Referral link copied!")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <h2 className="text-h2 font-bold text-on-surface">Refer & Earn</h2>

      <div className="bg-gradient-to-br from-primary-container to-primary rounded-[2rem] p-6 shadow-[0_12px_24px_rgba(91,45,142,0.15)] relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-secondary-container/20 rounded-full blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Gift className="w-7 h-7 text-on-secondary-container" />
          </div>
          <h3 className="text-xl font-bold text-white">Refer a Friend</h3>
          <p className="text-purple-200 text-sm mt-1">Share your code and earn rewards</p>
          <div className="mt-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <p className="text-label-caps text-purple-200 uppercase">Your Referral Code</p>
            <p className="text-2xl font-bold text-white tracking-widest mt-1">{referralCode}</p>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCopy}
              className="flex-1 bg-secondary-container text-on-secondary-container rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy Code"}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 bg-white/10 backdrop-blur-md text-white rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition-all"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-on-surface">₦0</p>
          <p className="text-body-sm text-on-surface-variant">Total Earned</p>
        </div>
        <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-on-surface">0</p>
          <p className="text-body-sm text-on-surface-variant">Referrals</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-purple-50 shadow-sm p-5">
        <h3 className="font-bold text-on-surface mb-2">How It Works</h3>
        <div className="space-y-4 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">1</div>
            <p className="text-body-sm text-on-surface-variant">Share your unique referral code with friends</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">2</div>
            <p className="text-body-sm text-on-surface-variant">They sign up using your code</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-sm font-bold text-primary shrink-0">3</div>
            <p className="text-body-sm text-on-surface-variant">You earn rewards on their transactions</p>
          </div>
        </div>
      </div>

      <div className="pb-6">
        <Button className="w-full" onClick={handleShare}>
          <Share2 className="w-5 h-5 mr-2" />
          Share Referral Link
        </Button>
      </div>
    </motion.div>
  )
}
