import { NextResponse } from "next/server"

const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function POST(req: Request) {
  try {
    const { amount, email, customerName, transactionRef, metadata } = await req.json()

    if (!amount || !email || !transactionRef) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const body = {
      amount: amount * 100,
      email,
      currency: "NGN",
      initiate_type: "inline",
      transaction_ref: transactionRef,
      customer_name: customerName || "User",
      callback_url: `${APP_URL}/fund-wallet?ref=${transactionRef}`,
      payment_channels: ["card", "bank", "ussd", "transfer"],
      metadata: metadata || {},
      pass_charge: false,
    }

    const res = await fetch(`${SQUAD_BASE_URL}/transaction/initiate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data.message || "Payment initiation failed" },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Squad initiate error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
