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
          "rounded-2xl p-6",
          glass
            ? "bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg"
            : "bg-white border border-gray-100 shadow-sm",
          hover && "transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
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
