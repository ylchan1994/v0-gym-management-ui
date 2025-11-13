'use server'

// Shared utility to fetch Ezypay access token
export async function getEzypayToken(): Promise<{ access_token: string; error?: string }> {
  try {
    const {
      EZYPAY_CLIENT_SECRET = 'eGiBZQZ2P7rkBFavu8xa89MINPsgaCgfWVeMupIhspyg9vY6pM8uD2Vl8pn-5Wxc',
      EZYPAY_CLIENT_ID = '0oa1yspeszvuG97wq0h8',
      EZYPAY_USERNAME = 'EzypayFitnessCenter',
      EZYPAY_PASSWORD = 'Password1234!'
    } = process.env

    if (!EZYPAY_CLIENT_ID || !EZYPAY_CLIENT_SECRET || !EZYPAY_USERNAME || !EZYPAY_PASSWORD) {
      throw new Error("Missing EZYPAY_* environment variables")
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
      },
      body: body.toString(),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Ezypay token fetch failed:", response.status, text)
      throw new Error(`Token fetch failed: ${response.status}`)
    }

    const data = await response.json()

    if (!data.access_token) {
      console.error("No access_token in response:", data)
      throw new Error("No access_token in response")
    }

    return data
  } catch (err) {
    console.error("getEzypayToken error:", err)
    throw err
  }
}
