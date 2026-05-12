import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const API_BASE = process.env.API_247_BASE_URL || "https://www.247api.com.ng/api"
const API_KEY = process.env.API_247_KEY || ""

const SERVICE_PATHS: Record<string, string> = {
  airtime: "/airtime",
  data: "/data",
  cable: "/cable",
  electricity: "/bill",
}

const ALLOWED_SERVICES = ["airtime", "data", "cable", "electricity", "withdrawal"]

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

function sanitizeError(message: string): string {
  const patterns = [
    /[\₦NGN]\s*[\d,]+\.?\d*/g,
    /\bwallet\s*balance\b.*/gi,
  ]
  let sanitized = message
  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, "").trim()
  }
  sanitized = sanitized.replace(/\s+/g, " ").trim()
  if (!sanitized || sanitized.length < 3) {
    return "Transaction failed. Please try again."
  }
  return sanitized
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll() {},
        },
      }
    )

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError || !authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { service, userPrice, providerCost, beneficiary, apiParams, details } = await req.json()

    if (!service || !userPrice || !apiParams || (!SERVICE_PATHS[service] && !ALLOWED_SERVICES.includes(service))) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 })
    }

    const price = Number(userPrice)
    const cost = Number(providerCost || 0)
    const fee = price - cost

    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", authUser.id)
      .single()

    if (!wallet || Number(wallet.balance) < price) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
    }

    await supabaseAdmin
      .from("wallets")
      .update({ balance: Number(wallet.balance) - price })
      .eq("user_id", authUser.id)

    const path = SERVICE_PATHS[service]
    let apiSuccess = false
    let apiData: Record<string, unknown> = {}
    let apiError = ""

    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Token ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiParams),
      })
      apiData = await res.json()
      apiSuccess = apiData.status === "success"
      if (!apiSuccess) {
        apiError = String(apiData.message || apiData.response || "Purchase failed")
      }
    } catch {
      apiError = "Network error contacting provider"
    }

    if (apiSuccess) {
      await supabaseAdmin.from("transactions").insert({
        user_id: authUser.id,
        type: service,
        amount: price,
        fee,
        status: "success",
        details: { ...details, beneficiary } as Record<string, unknown>,
        api_reference: String(apiData["request-id"] || apiData.requestId || ""),
      })

      const newBalance = Number(wallet.balance) - price

      return NextResponse.json({
        status: "success",
        message: `${service} purchase successful`,
        newBalance,
        apiReference: apiData["request-id"],
        token: apiData.token || null,
      })
    }

    await supabaseAdmin
      .from("wallets")
      .update({ balance: Number(wallet.balance) })
      .eq("user_id", authUser.id)

    await supabaseAdmin.from("transactions").insert({
      user_id: authUser.id,
      type: service,
      amount: price,
      fee: 0,
      status: "failed",
      details: { ...details, beneficiary, error: apiError } as Record<string, unknown>,
    })

    const sanitized = sanitizeError(apiError)

    return NextResponse.json({
      status: "failed",
      error: sanitized,
      message: sanitized,
    }, { status: 200 })

  } catch (error) {
    console.error("Purchase route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
