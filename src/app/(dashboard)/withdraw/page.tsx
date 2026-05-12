"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateWithdrawalFee } from "@/lib/pricing"
import { formatCurrencyShort, generateRequestId } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Landmark, Banknote, ArrowUpFromLine, CheckCircle, Wallet } from "lucide-react"
import { motion } from "framer-motion"

interface Bank {
  name: string
  code: string
}

export default function WithdrawPage() {
  const [banks, setBanks] = useState<Bank[]>([])
  const [bankCode, setBankCode] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [unverified, setUnverified] = useState(false)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuthStore()
  const { balance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()

  const numAmount = Number(amount) || 0
  const fee = calculateWithdrawalFee(numAmount)
  const totalDeduction = numAmount + fee

  useEffect(() => {
    async function loadBanks() {
      try {
        const res = await fetch("/api/withdraw/banks")
        const data = await res.json()
        setBanks(data.banks || [])
      } catch {
        addToast("error", "Failed to load bank list")
      } finally {
        setLoadingBanks(false)
      }
    }
    loadBanks()
  }, [])

  const handleBankChange = (code: string) => {
    setBankCode(code)
    const bank = banks.find((b) => b.code === code)
    setBankName(bank?.name || "")
    setAccountName("")
    setUnverified(false)
  }

  const verifyAccount = useCallback(async () => {
    if (accountNumber.length !== 10 || !bankCode) return
    setVerifyingAccount(true)
    setAccountName("")
    try {
      const res = await fetch("/api/withdraw/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber, bankCode }),
      })
      const data = await res.json()
      if (data.status === "success") {
        setAccountName(data.accountName)
        setUnverified(data.unverified || false)
      } else {
        addToast("error", data.message || "Account verification failed")
      }
    } catch {
      addToast("error", "Failed to verify account")
    } finally {
      setVerifyingAccount(false)
    }
  }, [accountNumber, bankCode])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (accountNumber.length === 10 && bankCode) {
        verifyAccount()
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [accountNumber, bankCode, verifyAccount])

  const handleWithdraw = () => {
    if (!user?.tx_pin) {
      addToast("error", "Please set your transaction PIN in settings first")
      return
    }

    openPinModal(async (pin: string) => {
      if (pin !== user.tx_pin) {
        addToast("error", "Incorrect PIN")
        return
      }

      if (balance < totalDeduction) {
        addToast("error", "Insufficient wallet balance")
        return
      }

      setLoading(true)

      try {
        const ref = generateRequestId("EJP_WD")

        const res = await fetch("/api/withdraw", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: numAmount,
            fee,
            bankName,
            bankCode,
            accountNumber,
            accountName,
            reference: ref,
          }),
        })

        const data = await res.json()

        if (data.status === "success") {
          const { setBalance } = useWalletStore.getState()
          setBalance(data.newBalance)
          setSuccess(true)
          addToast("success", `Withdrawal successful! ${formatCurrencyShort(numAmount)} sent to ${bankName}`)
        } else {
          addToast("error", data.message || "Withdrawal failed. Please try again.")
        }
      } catch (err: unknown) {
        addToast("error", err instanceof Error ? err.message : "Withdrawal failed")
      } finally {
        setLoading(false)
      }
    })
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
        <Card>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary-container/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-on-secondary-container" />
              </div>
            </div>
            <p className="text-h2 font-bold text-on-surface text-center">Transaction Successful</p>
            <p className="text-body-sm text-on-surface-variant text-center max-w-sm">
              {formatCurrencyShort(numAmount)} sent to {bankName} ({accountNumber}). Funds will reflect shortly.
            </p>
            <Button onClick={() => {
              setSuccess(false)
              setAmount("")
              setBankCode("")
              setBankName("")
              setAccountNumber("")
              setAccountName("")
            }}>
              Withdraw Again
            </Button>
          </div>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h2 className="text-h2 font-bold text-on-surface">Withdraw Funds</h2>
        <p className="text-body-sm text-on-surface-variant">Transfer your wallet balance to your bank account.</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-primary-container to-primary rounded-2xl p-5 shadow-[0_4px_12px_rgba(91,45,142,0.15)]">
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-purple-200 text-body-sm">Available Balance</p>
            <h3 className="text-white text-h3 font-bold mt-1">{formatCurrencyShort(balance)}</h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <Wallet className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="w-1 h-6 bg-secondary-container rounded-full" />
        <h3 className="text-h3 font-semibold text-primary">Transaction Details</h3>
      </div>

      <div>
        <label className="text-label-caps text-on-surface-variant mb-1 ml-1 block">SELECT BANK</label>
        {loadingBanks ? (
          <div className="flex items-center gap-2 text-sm text-on-surface-variant h-14 px-4 bg-surface-container-low rounded-xl border border-outline-variant">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading banks...
          </div>
        ) : (
          <div className="relative">
            <select
              value={bankCode}
              onChange={(e) => handleBankChange(e.target.value)}
              className="w-full h-14 pl-12 pr-10 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary-container focus:border-secondary transition-all appearance-none text-body-md text-on-surface"
            >
              <option value="">Choose your bank</option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>{b.name}</option>
              ))}
            </select>
            <Landmark className="absolute left-4 top-4 w-5 h-5 text-outline pointer-events-none" />
            <span className="absolute right-4 top-4 text-outline pointer-events-none text-lg">⌄</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <label className="text-label-caps text-on-surface-variant mb-1 ml-1 block">ACCOUNT NUMBER</label>
        <div className="relative">
          <input
            type="tel"
            placeholder="0123456789"
            maxLength={10}
            value={accountNumber}
            onChange={(e) => {
              setAccountNumber(e.target.value.replace(/\D/g, ""))
              setAccountName("")
            }}
            className="w-full h-14 pl-12 pr-4 bg-surface-container-low border border-outline-variant rounded-xl focus:ring-2 focus:ring-secondary-container focus:border-secondary transition-all text-body-md text-on-surface placeholder:text-outline"
          />
          <span className="absolute left-4 top-4 text-outline pointer-events-none text-lg">#</span>
        </div>
        {verifyingAccount && (
          <div className="flex items-center gap-1.5 text-sm text-primary mt-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying account...
          </div>
        )}
        {accountName && !verifyingAccount && (
          <div className={`flex items-center gap-2 h-12 px-4 rounded-xl mt-1 ${unverified ? "bg-amber-50 border border-amber-200" : "bg-purple-50/50 border border-purple-100"}`}>
            <div className={`w-2 h-2 rounded-full ${unverified ? "bg-amber-400" : "bg-secondary"}`} />
            <span className={`font-bold text-body-md ${unverified ? "text-amber-700" : "text-secondary"}`}>
              {unverified ? `${accountName} (Unverified)` : accountName}
            </span>
          </div>
        )}
      </div>

      <Input
        label="Amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        icon={<Banknote className="w-4 h-4" />}
        min="1000"
      />

      {numAmount >= 1000 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-surface-container-high rounded-2xl p-5 border border-outline-variant/30 border-dashed space-y-3"
        >
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Amount to receive</span>
            <span className="text-secondary font-bold">{formatCurrencyShort(numAmount)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Service fee</span>
            <span className="text-on-surface-variant">- {formatCurrencyShort(fee)}</span>
          </div>
          <div className="pt-3 border-t border-outline-variant/30 flex justify-between text-sm">
            <span className="text-on-surface">Total deducted from wallet</span>
            <span className="text-primary font-bold">{formatCurrencyShort(totalDeduction)}</span>
          </div>
          {balance < totalDeduction && (
            <p className="text-xs text-error mt-1">Insufficient balance</p>
          )}
        </motion.div>
      )}

      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          onClick={handleWithdraw}
          className="w-full"
          size="lg"
          disabled={!accountName || !accountNumber || numAmount < 1000 || loading || balance < totalDeduction}
          isLoading={loading}
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <><ArrowUpFromLine className="w-5 h-5 mr-2" /> Continue</>
          )}
        </Button>
      </motion.div>

      <div className="flex justify-center items-center gap-2 py-4">
        <span className="text-secondary text-sm">✓</span>
        <span className="text-xs text-outline font-medium">Secured by Ejempay Infrastructure</span>
      </div>
    </motion.div>
  )
}
