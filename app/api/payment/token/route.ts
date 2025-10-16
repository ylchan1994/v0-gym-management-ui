import { NextResponse } from "next/server"

// Server-side route to exchange credentials for an access token with Ezypay identity sandbox.
// IMPORTANT: Put real credentials in environment variables, do NOT commit secrets.
export async function POST(req: Request) {
  try {
    const {
      EZYPAY_CLIENT_ID = '0oa1yspeszvuG97wq0h8',
      EZYPAY_CLIENT_SECRET = 'eGiBZQZ2P7rkBFavu8xa89MINPsgaCgfWVeMupIhspyg9vY6pM8uD2Vl8pn-5Wxc',
      EZYPAY_USERNAME = 'EzypayFitnessCenter',
      EZYPAY_PASSWORD = 'Password1234!',
    } = process.env

    if (!EZYPAY_CLIENT_ID || !EZYPAY_CLIENT_SECRET || !EZYPAY_USERNAME || !EZYPAY_PASSWORD) {
      return NextResponse.json({ error: "Missing EZYPAY_* environment variables" }, { status: 500 })
    }

    const tokenUrl = "https://identity-sandbox.ezypay.com/token"

    const body = new URLSearchParams()
    body.append("grant_type", "password")
    body.append("client_id", EZYPAY_CLIENT_ID)
    body.append("client_secret", EZYPAY_CLIENT_SECRET)
    body.append("username", EZYPAY_USERNAME)
    body.append("password", EZYPAY_PASSWORD)
    body.append("scope", "integrator billing_profile create_payment_method offline_access")

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: body.toString(),
    })

    const data = await response.json()

    // Forward the identity provider response (access_token, token_type, expires_in, etc.)
    return NextResponse.json(data, { status: response.status })
  } catch (err) {
    console.error("/api/payment/token error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
