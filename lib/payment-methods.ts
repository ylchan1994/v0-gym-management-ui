"use server"

import { getEzypayToken } from "./ezypay-token"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/customers`
const merchantId = process.env.EZYPAY_MERCHANT_ID  

export async function replacePaymentMethod(customerId, paymentMethod, newPaymentMethod) {
  try {
    if (!customerId || !paymentMethod || !newPaymentMethod) {
      throw new Error("Not enough information")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Replace Payment Method failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}/new`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"newPaymentMethodToken":"${newPaymentMethod}"}`,
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Replace Payment Method failed:", response.status, text)

      try {
        const errorData = JSON.parse(text)
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        }
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Replace Payment Method failed: ${response.status}`,
          },
        }
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result,
    }
  } catch (err) {
    console.error("Replace Payment Method failed error:", err)
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    }
  }
}

export async function deletePaymentMethod(customerId, paymentMethod) {
  try {
    if (!customerId || !paymentMethod) {
      throw new Error("Not enough information")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Delete Payment Method failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${customerId}/paymentmethods/${paymentMethod}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Delete Payment Method failed:", response.status, text)

      try {
        const errorData = JSON.parse(text)
        return {
          success: false,
          error: {
            type: errorData.type,
            code: errorData.code,
            message: errorData.message,
          },
        }
      } catch (parseError) {
        return {
          success: false,
          error: {
            message: `Delete Payment Method failed: ${response.status}`,
          },
        }
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result,
    }
  } catch (err) {
    console.error("Delete Payment Method failed error:", err)
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    }
  }
}
