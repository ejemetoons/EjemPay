"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { ButtonHTMLAttributes, ReactNode } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  children: ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25",
    secondary: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/25",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  }

  return (
    <button
      className={cn(
        "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
        </span>
      )}
      <span className={cn("relative flex items-center gap-2", isLoading && "opacity-0")}>
        {children}
      </span>
    </button>
  )
}
