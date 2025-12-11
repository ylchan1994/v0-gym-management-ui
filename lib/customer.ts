"use server"
import { getEzypayToken } from "./passer-functions"
import { logApiCall } from "./api-logger"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`
const merchantId = process.env.EZYPAY_MERCHANT_ID || "5ee1dffe-70ab-43a9-bc1c-d8b7bd66586d"

export async function createCustomer(customer): Promise<any> {
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Create customer failed: No access_token from token utility`)
    }

    const body = {
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      address: {
        address1: customer.address ?? null,
      },
      mobilePhone: customer.mobilePhone ?? null,
      dateOfBirth: customer.dateOfBirth ?? null,
      //homePhone: customer.emergencyContact ?? null,
      metadata: {
        plan: customer.plan ?? "Trial",
        status: customer.status ?? "trial",
        startDate:
          new Date(customer.startDate).toISOString().split("T")[0] ?? new Date(Date.now()).toISOString().split("T")[0],
        dueDate: customer.startDate
          ? new Date(customer.startDate + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      },
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
      body: JSON.stringify(body),
    })

    const data = response.ok ? await response.json() : await response.text()
    await logApiCall("POST", apiEndpoint, data, response.status)

    if (!response.ok) {
      console.error("Created customer failed:", response.status, data)
      throw new Error(`Create customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("Create customer error:", err)
    throw err
  }
}

export async function listCustomer(): Promise<any> {
  try {
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const url = `${apiEndpoint}?limit=30`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = response.ok ? await response.json() : await response.text()

    if (!response.ok) {
      console.error("List customer failed:", response.status, data)
      throw new Error(`List customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("List customer error:", err)
    throw err
  }
}

export async function getCustomer(customerId: string | null): Promise<any> {
  try {
    if (!customerId) {
      throw new Error("No customer ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const url = `${apiEndpoint}/${customerId}`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = response.ok ? await response.json() : await response.text()

    if (!response.ok) {
      console.error("List customer failed:", response.status, data)
      throw new Error(`List customer failed: ${response.status}`)
    }

    return data
  } catch (err) {
    console.error("List customer error:", err)
    throw err
  }
}

export async function getCustomerPaymentMethods(customerId: string): Promise<any> {
  try {
    if (!customerId) {
      throw new Error("No customer ID provided")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error("Unable to get access token")
    }

    const merchantId = process.env.EZYPAY_MERCHANT_ID || "5ee1dffe-70ab-43a9-bc1c-d8b7bd66586d"

    const url = `${apiEndpoint}/${customerId}/paymentmethods`
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    const data = await res.json()

    return data
  } catch (err) {
    console.error("List customer payment method error:", err)
  }
}
