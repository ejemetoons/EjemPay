"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Smartphone, Wifi, Tv, Zap, Shield, TrendingUp, Crown, ArrowRight, Check, Moon, Sun } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "@/components/theme-provider"

const features = [
  { icon: Smartphone, title: "Airtime Top-up", desc: "Instant VTU airtime for all Nigerian networks at best rates" },
  { icon: Wifi, title: "Data Bundles", desc: "Cheap SME and corporate data plans with instant delivery" },
  { icon: Tv, title: "Cable TV", desc: "Pay for DSTV, GOTV, and Startimes subscriptions instantly" },
  { icon: Zap, title: "Electricity", desc: "Buy electricity tokens for all DisCos across Nigeria" },
  { icon: Shield, title: "Secure Transactions", desc: "4-digit PIN protection and encrypted data storage" },
  { icon: TrendingUp, title: "Best Prices", desc: "Competitive rates with reseller discounts available" },
]

const tiers = [
  {
    name: "Standard",
    price: "Free",
    data: "API + ₦20",
    airtime: "API + 3%",
    features: ["All services available", "Standard pricing", "Transaction history", "24/7 support"],
    cta: "Get Started",
  },
  {
    name: "Reseller",
    price: "₦6,500",
    data: "API + ₦7",
    airtime: "API + 1%",
    features: ["All Standard features", "Lowest pricing", "Priority support", "Bulk purchases", "API access"],
    cta: "Upgrade Now",
    popular: true,
  },
]

export default function LandingPage() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      <nav className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
            Ejempay
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5 text-gray-400" /> : <Moon className="w-5 h-5 text-gray-500" />}
            </button>
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-50/30 dark:from-blue-950/20 dark:via-transparent dark:to-blue-950/10 pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full mb-6"
            >
              Nigeria's Smartest VTU Platform
            </motion.span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Instant Airtime, Data & Bills
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent"> at Best Prices</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mt-6 max-w-2xl mx-auto">
              Buy airtime, data bundles, pay cable TV and electricity bills instantly. Upgrade to Reseller for the lowest prices in Nigeria.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link href="/register">
                <Button size="lg">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Everything You Need</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">All your VTU needs in one platform</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card hover className="h-full">
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                    <feature.icon className="w-10 h-10 text-blue-600 dark:text-blue-400 mb-4" />
                  </motion.div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Simple Pricing</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-3">Choose the plan that works for you</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card glass={tier.popular} hover className={tier.popular ? "border-blue-200 dark:border-blue-800 ring-2 ring-blue-100 dark:ring-blue-900" : ""}>
                  {tier.popular && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full mb-4"
                    >
                      Most Popular
                    </motion.span>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{tier.name}</h3>
                  <p className="text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{tier.price}</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Data pricing</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{tier.data}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Airtime pricing</span>
                      <span className="font-medium text-gray-900 dark:text-gray-200">{tier.airtime}</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-green-500" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register">
                    <Button className="w-full mt-6" variant={tier.popular ? "primary" : "secondary"}>
                      {tier.cta}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center text-white relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-blue-100 mt-4 text-lg">
              Create your free account and start buying airtime, data, and paying bills in seconds.
            </p>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 mt-6">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 Ejempay. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Terms</Link>
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Privacy</Link>
            <Link href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
