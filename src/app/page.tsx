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
    data: "Cheap rates",
    airtime: "Face value",
    features: ["All services available", "Affordable data pricing", "Transaction history", "24/7 support"],
    cta: "Get Started",
  },
  {
    name: "Top Seller",
    price: "₦6,500",
    data: "Discounted prices",
    airtime: "Discounted + face value",
    features: ["All Standard features", "Lowest data pricing", "Priority support", "Bulk purchases", "API access"],
    cta: "Upgrade Now",
    popular: true,
  },
]

export default function LandingPage() {
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-surface transition-colors duration-300">
      <nav className="fixed top-0 w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/50 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary">
            Ejempay
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="p-2 rounded-xl bg-surface-container border border-outline-variant/50"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link href="/login">
              <Button variant="secondary" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 bg-surface-container text-primary text-sm font-medium rounded-full mb-6">
              🇳🇬 Nigeria's Trusted VTU Platform
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-on-surface leading-tight">
              Buy Airtime, Data &amp; Pay Bills{" "}
              <span className="text-primary">at Best Prices</span>
            </h1>
            <p className="text-on-surface-variant mt-6 text-lg max-w-2xl mx-auto">
              The easiest way to top up your phone, buy data bundles, pay for cable TV, electricity, and more. Instant delivery, lowest prices.
            </p>
            <div className="flex justify-center gap-4 mt-10">
              <Link href="/register">
                <Button size="lg">
                  Create Free Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 px-6 bg-surface-container/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-on-surface">Why Ejempay?</h2>
            <p className="text-on-surface-variant mt-3">Everything you need in one place</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-on-surface mb-2">{feature.title}</h3>
                  <p className="text-on-surface-variant">{feature.desc}</p>
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
            <h2 className="text-3xl font-bold text-on-surface">Simple Pricing</h2>
            <p className="text-on-surface-variant mt-3">Choose the plan that works for you</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card glass={tier.popular} className={tier.popular ? "border-secondary-container/30 ring-2 ring-secondary-container/20" : ""}>
                  {tier.popular && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      className="inline-block px-3 py-1 bg-secondary-container/10 text-secondary text-xs font-medium rounded-full mb-4"
                    >
                      Most Popular
                    </motion.span>
                  )}
                  <h3 className="text-xl font-bold text-on-surface">{tier.name}</h3>
                  <p className="text-3xl font-bold mt-2 text-on-surface">{tier.price}</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Data pricing</span>
                      <span className="font-medium text-on-surface">{tier.data}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">Airtime pricing</span>
                      <span className="font-medium text-on-surface">{tier.airtime}</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-on-surface-variant">
                        <Check className="w-4 h-4 text-secondary" />
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

      <section className="py-20 px-6 bg-gradient-to-r from-primary to-primary-container relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="max-w-3xl mx-auto text-center text-on-primary relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="text-on-primary/70 mt-4 text-lg">
              Create your free account and start buying airtime, data, and paying bills in seconds.
            </p>
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 mt-6">
                  Create Free Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </section>

      <footer className="py-8 px-6 border-t border-outline-variant/50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-on-surface-variant">© 2026 Ejempay. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-on-surface-variant">
            <Link href="#" className="hover:text-on-surface transition-colors">Terms</Link>
            <Link href="#" className="hover:text-on-surface transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-on-surface transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
