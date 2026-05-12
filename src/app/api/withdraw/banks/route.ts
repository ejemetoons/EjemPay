import { NextResponse } from "next/server"

const SQUAD_BASE_URL = process.env.SQUAD_BASE_URL || "https://api-d.squadco.com"
const SQUAD_SECRET_KEY = process.env.SQUAD_SECRET_KEY || ""

const FALLBACK_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank", code: "023" },
  { name: "Ecobank", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank", code: "011" },
  { name: "First City Monument Bank (FCMB)", code: "214" },
  { name: "Globus Bank", code: "001" },
  { name: "Guaranty Trust Bank (GTBank)", code: "058" },
  { name: "Heritage Bank", code: "030" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "50211" },
  { name: "Lotus Bank", code: "303" },
  { name: "Moniepoint", code: "50515" },
  { name: "Opay", code: "100029" },
  { name: "Paga", code: "100002" },
  { name: "Palmpay", code: "100033" },
  { name: "Parallex Bank", code: "526" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC Bank", code: "221" },
  { name: "Standard Chartered Bank", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "SunTrust Bank", code: "100" },
  { name: "Taj Bank", code: "302" },
  { name: "Titan Trust Bank", code: "102" },
  { name: "Union Bank", code: "032" },
  { name: "United Bank for Africa (UBA)", code: "033" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "566" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
]

export async function GET() {
  if (SQUAD_SECRET_KEY) {
    try {
      const res = await fetch(`${SQUAD_BASE_URL}/v1/misc/banks`, {
        headers: { Authorization: `Bearer ${SQUAD_SECRET_KEY}` },
      })
      const data = await res.json()
      if (data.status === 200 && Array.isArray(data.data)) {
        const banks = data.data.map((b: { name: string; code: string }) => ({
          name: b.name,
          code: b.code,
        }))
        return NextResponse.json({ banks })
      }
    } catch {
      // fall through to fallback
    }
  }

  return NextResponse.json({ banks: FALLBACK_BANKS })
}
