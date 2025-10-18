import { NextResponse } from "next/server"
import { getEzypayToken } from "@/lib/ezypay-token"

// Proxy route to fetch payment methods server-side to avoid CORS
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const customerId = body?.customerId
    if (!customerId) {
      return NextResponse.json({ error: "Missing customerId" }, { status: 400 })
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      return NextResponse.json({ error: "No access_token" }, { status: 502 })
    }

    const merchantId = process.env.EZYPAY_MERCHANT_ID || "5ee1dffe-70ab-43a9-bc1c-d8b7bd66586d"

    const res = await fetch(`https://api-sandbox.ezypay.com/v2/billing/customers/${customerId}/paymentmethods`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("/api/payment/methods error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
