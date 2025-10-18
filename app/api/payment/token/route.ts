import { NextResponse } from "next/server"
import { getEzypayToken } from "@/lib/ezypay-token"

// Server-side route to exchange credentials for an access token with Ezypay identity sandbox.
// IMPORTANT: Put real credentials in environment variables, do NOT commit secrets.
export async function POST(req: Request) {
  try {
    const data = await getEzypayToken()
    return NextResponse.json(data, { status: 200 })
  } catch (err) {
    console.error("/api/payment/token error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
