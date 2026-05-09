"use client"

import { useUiStore } from "@/store/useUiStore"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { X, Lock } from "lucide-react"
import { Button } from "./button"

export function PinModal() {
  const { pinModalOpen, pinCallback, closePinModal } = useUiStore()
  const [pin, setPin] = useState(["", "", "", ""])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (pinModalOpen) {
      setPin(["", "", "", ""])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    }
  }, [pinModalOpen])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value.slice(-1)
    setPin(newPin)

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4)
    const newPin = [...pin]
    for (let i = 0; i < data.length; i++) {
      newPin[i] = data[i]
    }
    setPin(newPin)
    if (data.length < 4) {
      inputRefs.current[data.length]?.focus()
    } else {
      inputRefs.current[3]?.focus()
    }
  }

  const handleSubmit = () => {
    const pinStr = pin.join("")
    if (pinStr.length === 4) {
      pinCallback?.(pinStr)
      closePinModal()
    }
  }

  return (
    <AnimatePresence>
      {pinModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        >
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Enter Transaction PIN</h3>
              </div>
              <button onClick={closePinModal} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              ))}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={pin.join("").length !== 4}
              className="w-full"
              size="lg"
            >
              Confirm
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Enter your 4-digit transaction PIN
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
