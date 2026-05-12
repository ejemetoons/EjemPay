import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

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

    const { amount, fee, bankName, bankCode, accountNumber, accountName, reference } = await req.json()

    if (!amount || !bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const numAmount = Number(amount)
    const numFee = Number(fee || 50)
    const totalDeduction = numAmount + numFee

    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("user_id", authUser.id)
      .single()

    if (!wallet || Number(wallet.balance) < totalDeduction) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 })
    }

    // Debit wallet
    await supabaseAdmin
      .from("wallets")
      .update({ balance: Number(wallet.balance) - totalDeduction })
      .eq("user_id", authUser.id)

    // Try Squad transfer
    let transferSuccess = false
    let squadRef = ""
    let transferStatus = "pending"

    if (SQUAD_SECRET_KEY) {
      try {
        const squadRes = await fetch(`${SQUAD_BASE_URL}/payout/transfer`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: numAmount * 100,
            bank_code: bankCode,
            account_number: accountNumber,
            account_name: accountName,
            transaction_reference: reference,
            currency_id: "NGN",
            remark: "Wallet withdrawal",
          }),
        })

        const squadData = await squadRes.json()

        if (squadData.status === 200) {
          transferSuccess = true
          squadRef = squadData.data?.transaction_ref || reference
          transferStatus = "success"
        } else {
          // Refund wallet on Squad failure
          await supabaseAdmin
            .from("wallets")
            .update({ balance: Number(wallet.balance) })
            .eq("user_id", authUser.id)

          return NextResponse.json({
            status: "error",
            message: squadData.message || "Transfer failed. Please try again.",
          })
        }
      } catch (err) {
        console.error("Squad transfer error:", err)
        return NextResponse.json({
          status: "error",
          message: "Transfer service unavailable. Please try again later.",
        })
      }
    }

    // Record transaction
    const { error: txnError } = await supabaseAdmin.from("transactions").insert({
      user_id: authUser.id,
      type: "withdrawal",
      amount: numAmount,
      fee: numFee,
      status: transferStatus,
      details: {
        bankName,
        bankCode,
        accountNumber,
        accountName,
        reference,
        squadRef: squadRef || undefined,
      },
      api_reference: reference,
    })

    if (txnError) {
      await supabaseAdmin
        .from("wallets")
        .update({ balance: Number(wallet.balance) })
        .eq("user_id", authUser.id)
      return NextResponse.json({ error: "Failed to record transaction" }, { status: 500 })
    }

    return NextResponse.json({
      status: "success",
      message: transferSuccess
        ? "Withdrawal successful! Funds sent to your bank."
        : "Withdrawal request submitted for manual processing.",
      newBalance: Number(wallet.balance) - totalDeduction,
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
