"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const { theme, toggle } = useTheme()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 transition-colors duration-300">
      <button
        onClick={toggle}
        className="fixed top-4 right-4 p-2 rounded-xl bg-surface-container border border-outline-variant/50 z-50"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Ejempay</h1>
          <p className="text-on-surface-variant mt-2">Reset your password</p>
        </div>

        <Card glass>
          {sent ? (
            <div className="text-center py-4">
              <p className="text-on-surface font-medium">Check your email</p>
              <p className="text-sm text-on-surface-variant mt-2">
                We've sent a password reset link to <span className="font-medium text-on-surface">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-error-container text-error text-sm p-3 rounded-xl"
                >
                  {error}
                </motion.div>
              )}

              <p className="text-sm text-on-surface-variant">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                </Button>
              </motion.div>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-primary hover:underline">
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
