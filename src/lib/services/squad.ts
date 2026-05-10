const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""
const SQUAD_PUBLIC_KEY = process.env.SQUAD_PUBLIC_KEY || ""
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

interface InitiatePaymentParams {
  amount: number
  email: string
  customerName: string
  transactionRef: string
  callbackUrl?: string
  paymentChannels?: string[]
  metadata?: Record<string, unknown>
}

interface InitiateResponse {
  status: number
  message: string
  data: {
    checkout_url: string
    transaction_ref: string
    transaction_amount: number
    currency: string
    callback_url: string
  }
}

interface VerifyResponse {
  status: number
  message: string
  data: {
    transaction_ref: string
    gateway_ref: string
    transaction_status: string
    amount: number
    merchant_amount: number
    transaction_type: string
    currency: string
    email: string
    created_at: string
  }
}

export async function initiatePayment(
  params: InitiatePaymentParams
): Promise<InitiateResponse> {
  const body = {
    amount: params.amount * 100,
    email: params.email,
    currency: "NGN",
    initiate_type: "inline",
    transaction_ref: params.transactionRef,
    customer_name: params.customerName,
    callback_url: params.callbackUrl || `${APP_URL}/fund-wallet?ref=${params.transactionRef}`,
    payment_channels: params.paymentChannels || ["card", "bank", "ussd", "transfer"],
    metadata: params.metadata || {},
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

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Payment initiation failed" }))
    throw new Error(error.message || `Squad API Error: ${res.status}`)
  }

  return res.json() as Promise<InitiateResponse>
}

export async function verifyTransaction(
  transactionRef: string
): Promise<VerifyResponse> {
  const res = await fetch(
    `${SQUAD_BASE_URL}/transaction/verify?reference=${encodeURIComponent(transactionRef)}`,
    {
      headers: {
        Authorization: `Bearer ${SQUAD_SECRET_KEY}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Verification failed: ${res.status}`)
  }

  return res.json() as Promise<VerifyResponse>
}

export function validateWebhookSignature(
  body: string,
  signature: string | undefined
): boolean {
  if (!signature) return false

  const crypto = require("crypto")
  const hash = crypto
    .createHmac("sha512", SQUAD_SECRET_KEY)
    .update(body)
    .digest("hex")
    .toUpperCase()

  return hash === signature
}

export function getSquadPublicKey(): string {
  return SQUAD_PUBLIC_KEY
}
