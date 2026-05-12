"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { calculateWithdrawalFee } from "@/lib/pricing"
import { formatCurrencyShort, generateRequestId, isValidPhone } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useWalletStore } from "@/store/useWalletStore"
import { useUiStore } from "@/store/useUiStore"
import { Loader2, Landmark, Banknote, ArrowUpFromLine, Info, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
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
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingBanks, setLoadingBanks] = useState(true)
  const [verifyingAccount, setVerifyingAccount] = useState(false)
  const [success, setSuccess] = useState(false)
  const { user } = useAuthStore()
  const { balance, setBalance } = useWalletStore()
  const { openPinModal, addToast } = useUiStore()
  const supabase = createClient()

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
          setBalance(data.newBalance)
          setSuccess(true)
          addToast("success", `Withdrawal request submitted for ${formatCurrencyShort(numAmount)}`)
        } else {
          addToast("error", data.message || "Withdrawal failed")
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <Card glass>
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">Withdrawal Submitted!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              Your withdrawal request for {formatCurrencyShort(numAmount)} to {bankName} ({accountNumber}) has been submitted. You will be credited within 24 hours.
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Withdraw Funds</h2>

      <Card glass>
        <div className="space-y-5">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Current Balance: {formatCurrencyShort(balance)}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Withdrawals are processed manually within 24 hours. A fee applies.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Bank</label>
            {loadingBanks ? (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading banks...
              </div>
            ) : (
              <select
                value={bankCode}
                onChange={(e) => handleBankChange(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">-- Select Bank --</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>{b.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="space-y-1">
            <Input
              label="Account Number"
              type="tel"
              placeholder="0123456789"
              maxLength={10}
              value={accountNumber}
              onChange={(e) => {
                setAccountNumber(e.target.value.replace(/\D/g, ""))
                setAccountName("")
              }}
              icon={<Landmark className="w-4 h-4" />}
            />
            {verifyingAccount && (
              <div className="flex items-center gap-1.5 text-sm text-blue-600">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying account...
              </div>
            )}
            {accountName && !verifyingAccount && (
              <p className="text-sm font-medium text-green-600 dark:text-green-400 px-1">
                {accountName}
              </p>
            )}
          </div>

          <Input
            label="Amount (₦)"
            type="number"
            placeholder="Enter amount to withdraw"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<Banknote className="w-4 h-4" />}
            min="1000"
          />

          {numAmount >= 1000 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2"
            >
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">You withdraw</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrencyShort(numAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Processing fee</span>
                <span className="text-red-500">-{formatCurrencyShort(fee)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900 dark:text-gray-100">Total deducted</span>
                <span className="font-bold text-lg text-red-600 dark:text-red-400">{formatCurrencyShort(totalDeduction)}</span>
              </div>
              {balance < totalDeduction && (
                <p className="text-xs text-red-500 mt-1">Insufficient balance</p>
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
                <><ArrowUpFromLine className="w-5 h-5 mr-2" /> Withdraw</>
              )}
            </Button>
          </motion.div>
        </div>
      </Card>
    </motion.div>
  )
}
