import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { calculateTopUpFee } from "@/lib/pricing"

const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: Request) {
  try {
    const { transactionRef } = await req.json()
    if (!transactionRef) {
      return NextResponse.json({ error: "Missing transactionRef" }, { status: 400 })
    }

    const verifyRes = await fetch(
      `${SQUAD_BASE_URL}/transaction/verify?reference=${encodeURIComponent(transactionRef)}`,
      { headers: { Authorization: `Bearer ${SQUAD_SECRET_KEY}` } }
    )

    const verifyData = await verifyRes.json()
    if (verifyData.status !== 200 || verifyData.data?.transaction_status !== "success") {
      return NextResponse.json(
        { error: "Transaction not successful" },
        { status: 400 }
      )
    }

    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id, status, user_id")
      .eq("squad_reference", transactionRef)
      .maybeSingle()

    if (existingTx?.status === "success") {
      return NextResponse.json({ message: "Already credited", alreadyCredited: true })
    }

    const amountNaira = verifyData.data.amount / 100
    const fee = calculateTopUpFee(amountNaira)
    const creditAmount = amountNaira - fee

    const meta = verifyData.data.transaction_data?.meta
    const userId = meta?.user_id || existingTx?.user_id

    if (!userId) {
      return NextResponse.json({ error: "Could not identify user" }, { status: 400 })
    }

    const { data: wallet } = await supabaseAdmin
      .from("wallets")
      .select("balance")
      .eq("user_id", userId)
      .single()

    const newBalance = Number(wallet?.balance || 0) + creditAmount

    await supabaseAdmin
      .from("wallets")
      .update({ balance: newBalance })
      .eq("user_id", userId)

    if (existingTx) {
      await supabaseAdmin
        .from("transactions")
        .update({ status: "success", amount: amountNaira, fee })
        .eq("squad_reference", transactionRef)
    } else {
      await supabaseAdmin.from("transactions").insert({
        user_id: userId,
        type: "fund_wallet",
        amount: amountNaira,
        fee,
        status: "success",
        squad_reference: transactionRef,
        details: { amount: amountNaira, fee, credited_amount: creditAmount },
      })
    }

    return NextResponse.json({
      message: "Wallet credited",
      amount_credited: creditAmount,
      new_balance: newBalance,
    })
  } catch (error) {
    console.error("Verify-and-credit error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
