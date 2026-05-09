"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-6">
          <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-gray-700">
            <ArrowLeft className="w-4 h-4" />
            Back to login
          </Link>
        </div>

        <Card glass>
          <h2 className="text-2xl font-bold mb-2">Reset Password</h2>
          <p className="text-gray-500 text-sm mb-6">
            Enter your email and we'll send you a reset link.
          </p>

          {sent ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Check your email</h3>
              <p className="text-sm text-gray-500">We've sent a password reset link to {email}</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{error}</div>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
