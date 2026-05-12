"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
  glass?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, glass, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-button text-button rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" && "bg-primary text-on-primary shadow-lg shadow-primary/20 hover:bg-primary-container",
          variant === "secondary" && "bg-surface-container text-on-surface hover:bg-surface-container-high",
          variant === "ghost" && "text-primary hover:bg-primary/5",
          variant === "outline" && "border-2 border-outline-variant text-on-surface hover:border-primary hover:text-primary bg-white",
          glass && "glass-card",
          size === "sm" && "h-10 px-4 text-sm",
          size === "md" && "h-12 px-6",
          size === "lg" && "h-14 px-8",
          className
        )}
        {...props}
      >
        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
