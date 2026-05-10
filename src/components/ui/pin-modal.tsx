"use client"

import { useUiStore } from "@/store/useUiStore"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useState } from "react"

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
    pinCallback?.(pin)
    setPin("")
    closePinModal()
  }

  const handleDigit = (d: string) => {
    if (pin.length < 4) {
      setPin((p) => p + d)
      setError("")
    }
  }

  const handleDelete = () => setPin((p) => p.slice(0, -1))

  return (
    <AnimatePresence>
      {pinModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { closePinModal(); setPin(""); setError("") }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Enter Transaction PIN</h3>
              <button
                onClick={() => { closePinModal(); setPin(""); setError("") }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={false}
                  animate={pin[i] ? { scale: [1, 1.2, 1] } : {}}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    pin[i]
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            <div className="grid grid-cols-3 gap-3 max-w-[220px] mx-auto">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
                <button
                  key={d}
                  onClick={() => handleDigit(d)}
                  className="w-16 h-16 rounded-xl text-xl font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-all"
                >
                  {d}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleDigit("0")}
                className="w-16 h-16 rounded-xl text-xl font-semibold bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                0
              </button>
              <button
                onClick={handleDelete}
                className="w-16 h-16 rounded-xl text-sm font-medium bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 active:scale-95 transition-all"
              >
                DEL
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4}
              className="w-full mt-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Confirm
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
