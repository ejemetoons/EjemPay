"use client"

import { InputHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-label-caps text-on-surface-variant mb-1 ml-1">
            {label.toUpperCase()}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "w-full h-14 bg-surface-container-low border border-outline-variant rounded-xl",
              "focus:ring-2 focus:ring-secondary-container focus:border-secondary transition-all",
              "text-body-md text-on-surface placeholder:text-outline",
              icon ? "pl-12 pr-4" : "px-4",
              className
            )}
            {...props}
          />
        </div>
      </div>
    )
  }
)

Input.displayName = "Input"

export { Input }
