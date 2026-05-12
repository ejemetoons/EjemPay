"use client"

import { useEffect, useState } from "react"
import { useUiStore } from "@/store/useUiStore"
import { CheckCircle, XCircle, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-xl flex items-start gap-3 ${
              toast.type === "success"
                ? "bg-white border-secondary-container/30"
                : "bg-white border-error-container/30"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            )}
            <p className="text-sm text-on-surface flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-outline hover:text-on-surface transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
