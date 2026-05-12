import { NextResponse } from "next/server"

const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""

export async function POST(req: Request) {
  try {
    const { accountNumber, bankCode } = await req.json()

    if (!accountNumber || !bankCode) {
      return NextResponse.json({ error: "Missing account number or bank code" }, { status: 400 })
    }

    if (!SQUAD_SECRET_KEY) {
      return NextResponse.json({
        status: "success",
        accountName: `${accountNumber} (Verification not configured)`,
      })
    }

    const res = await fetch(`${SQUAD_BASE_URL}/payout/account/lookup`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bank_code: bankCode,
        account_number: accountNumber,
      }),
    })

    const data = await res.json()

    if (data.status === 200 && data.data?.account_name) {
      return NextResponse.json({ status: "success", accountName: data.data.account_name })
    }

    return NextResponse.json({
      status: "error",
      message: data.message || "Account verification failed. Check the account number and try again.",
    })
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
