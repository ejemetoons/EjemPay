import { NextResponse } from "next/server"
import { validateWebhookSignature } from "@/lib/services/squad"
import { createClient } from "@supabase/supabase-js"
import { calculateTopUpFee } from "@/lib/pricing"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get("x-squad-encrypted-body")

    if (!validateWebhookSignature(body, signature ?? undefined)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const data = JSON.parse(body)

    if (data.Event !== "charge_successful") {
      return NextResponse.json({ message: "Ignored" }, { status: 200 })
    }

    const { transaction_ref, amount, meta } = data.Body
    const userId = meta?.user_id as string | undefined

    if (!userId || !amount) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const { data: existingTx } = await supabaseAdmin
      .from("transactions")
      .select("id")
      .eq("squad_reference", transaction_ref)
      .eq("status", "success")
      .maybeSingle()

    if (existingTx) {
      return NextResponse.json({ message: "Already processed" }, { status: 200 })
    }

    const amountNaira = amount / 100
    const fee = calculateTopUpFee(amountNaira)
    const creditAmount = amountNaira - fee

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

    await supabaseAdmin
      .from("transactions")
      .update({
        status: "success",
        amount: amountNaira,
        fee,
      })
      .eq("squad_reference", transaction_ref)

    return NextResponse.json({ message: "Wallet credited" }, { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
