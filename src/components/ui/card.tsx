import { cn } from "@/lib/utils"
import { forwardRef } from "react"
import type { HTMLAttributes, ReactNode } from "react"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  glass?: boolean
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, glass = false, hover = false, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300",
          glass
            ? "bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg dark:shadow-gray-900/50"
            : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm dark:shadow-gray-900/30",
          hover && "hover:shadow-lg dark:hover:shadow-gray-900/50 hover:-translate-y-0.5",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"
