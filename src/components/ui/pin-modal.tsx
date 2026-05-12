"use client"

import { useState } from "react"
import { useUiStore } from "@/store/useUiStore"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, X } from "lucide-react"

export function PinModal() {
  const { pinModalOpen, closePinModal, pinCallback } = useUiStore()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = () => {
    if (pin.length !== 4) {
      setError("PIN must be 4 digits")
      return
    }
    setError("")
    const cb = pinCallback
    closePinModal()
    if (cb) cb(pin)
    setPin("")
  }

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setPin(pin + d)
      setError("")
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError("")
  }

  const handleClose = () => {
    closePinModal()
    setPin("")
    setError("")
  }

  return (
    <AnimatePresence>
      {pinModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[150] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <button onClick={handleClose} className="text-outline hover:text-on-surface transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-h3 font-h3 text-center text-primary mb-1">Enter PIN</h3>
            <p className="text-body-sm text-on-surface-variant text-center mb-6">Confirm your transaction PIN</p>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin[i] ? "bg-primary border-primary scale-110" : "border-outline-variant"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-error text-center mb-4">{error}</p>
            )}

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(String(d))}
                  className="h-14 text-xl font-bold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleDigit("0")}
                className="h-14 text-xl font-bold text-on-surface bg-surface-container-high rounded-xl hover:bg-surface-container-highest active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="h-14 text-sm font-medium text-outline bg-surface-container-high rounded-xl hover:bg-surface-container-highest active:scale-95 transition-all"
              >
                DEL
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4}
              className="w-full h-12 bg-primary text-on-primary font-button rounded-xl shadow-lg shadow-primary/20 disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              Confirm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
