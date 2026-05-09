import { NextResponse } from "next/server"

const API_BASE = process.env.API_247_BASE_URL || "https://www.247api.com.ng/api"
const API_KEY = process.env.API_247_KEY || ""

const allowedPaths = [
  "get-networks",
  "airtime",
  "data_plans",
  "data",
  "get-cable-plan",
  "cable/cable-validation",
  "cable",
  "get-bill",
  "bill/bill-validation",
  "bill",
  "get-exam",
  "exam",
  "user",
]

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join("/")

  if (!allowedPaths.includes(path)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)
  const queryString = url.search

  try {
    const res = await fetch(`${API_BASE}/${path}${queryString}`, {
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 502 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const path = (await params).path.join("/")

  if (!allowedPaths.includes(path)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  try {
    const res = await fetch(`${API_BASE}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Token ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "API request failed" }, { status: 502 })
  }
}
