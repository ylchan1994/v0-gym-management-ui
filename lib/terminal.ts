"use server"

import { getEzypayToken } from "./ezypay-token"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/terminal`
const merchantId = process.env.EZYPAY_MERCHANT_ID

function normalisedEzypayInvoice(invoices, customerName = null) {
  function extractPaymentMethodData(paymentMethodData) {
    if (!paymentMethodData) return
    const type = paymentMethodData.type.toLowerCase()

    switch (type) {
      case "card":
        return `${paymentMethodData.card?.type} **** ${paymentMethodData.card?.last4}`
        break
      case "bank":
        return `**** ${paymentMethodData.bank?.last4}`
        break
      case "payto":
        return paymentMethodData.payto.bbanAccountNo ?? paymentMethodData.payto.aliasId
    }
  }

  function mergeItemsByDescription(items) {
    const merged = {}

    items.forEach((item) => {
      const desc = item.description
      const amount = item.amount.value

      if (merged[desc]) {
        merged[desc] += amount
      } else {
        merged[desc] = amount
      }
    })

    return Object.entries(merged).map(([description, amount]) => ({
      description,
      amount: `$${amount.toFixed(2)}`,
    }))
  }
  const normalisedInvoice = invoices.data.map((invoice) => ({
    id: invoice.id,
    member: customerName,
    amount: `$${invoice.amount.value}`,
    number: "IN" + Number.parseInt(invoice.documentNumber.substring(4)),
    date: invoice.date,
    dueDate: invoice.dueDate,
    paymentMethod: extractPaymentMethodData(invoice.paymentMethodData),
    items: mergeItemsByDescription(invoice.items),
    status: invoice.status.toLowerCase(),
    paymentAttempts: [],
    customerId: invoice.customerId,
    failedPaymentReason: invoice.failedPaymentReason,
    paymentProviderResponse: invoice.paymentProviderResponse,
  }))

  return normalisedInvoice
}

export async function listTerminalInvoices(): Promise<any> {
  try {
    if (!process.env.API_ENDPOINT) {
      console.error("API_ENDPOINT environment variable is not configured")
      return []
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      return []
    }

    const invoiceResponse = await fetch(`${apiEndpoint}/invoices?limit=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List terminal invoice failed:", invoiceResponse.status, text)
      return []
    }

    const invoiceData = await invoiceResponse.json()

    const normalisedInvoice = normalisedEzypayInvoice(invoiceData)

    return normalisedInvoice
  } catch (err) {
    console.error("List terminal invoice error:", err)
    return []
  }
}

export async function listTerminalInvoiceByCustomer(customerId, customerName): Promise<any> {
  try {
    if (!customerId) {
      throw new Error("No customer ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Get terminal invoice failed: No access_token from token utility`)
    }

    const invoiceResponse = await fetch(`${apiEndpoint}/invoices?customerId=${customerId}&limit=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("Get terminal invoice failed:", invoiceResponse.status, text)
      throw new Error(`Get terminal invoice failed: ${invoiceResponse.status}`)
    }

    const invoiceData = await invoiceResponse.json()

    const normalisedInvoice = normalisedEzypayInvoice(invoiceData, customerName)

    return normalisedInvoice
  } catch (err) {
    console.error("List invoice error:", err)
    throw err
  }
}

export async function createTerminalInvoice(invoiceData, terminalId) {
  try {
    if (!invoiceData) {
      throw new Error("No invoice Data")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Create invoice failed: No access_token from token utility`)
    }

    const requestBody = {
      customerId: invoiceData.memberId,
      items: [
        {
          description: invoiceData.description,
          amount: {
            currency: "AUD",
            value: invoiceData.amount,
          },
        },
      ],
    }
    console.log(JSON.stringify(invoiceData))
    if (invoiceData.paymentMethodId) {
      requestBody.paymentMethodToken = invoiceData.paymentMethodId
    }

    const response = await fetch(`${apiEndpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const text = await response.text()
      console.log(response)
      console.error("Create Invoice failed:", response.status, text)
      throw new Error(`Create invoice failed: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Create Invoice failed error:", err)
    throw err
  }
}

export async function createCheckout(invoiceData) {
  console.log(invoiceData)
  try {
    if (!invoiceData) {
      throw new Error("No invoice data for checkout session")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Checkout session failed: No access_token from token utility`)
    }

    const requestBody = {      
      description: invoiceData.description,
      amount: {
        currency: "AUD",
        value: invoiceData.amount,
      },
      customerId: invoiceData.memberId,
    }

    const response = await fetch(`${checkoutEndpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Refund Invoice failed:", response.status, text)

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
            message: `Refund invoice failed: ${response.status}`,
          },
        }
      }
    }

    const result = await response.json()
    return {
      success: true,
      data: result.checkoutUrl,
    }
  } catch (err) {
    console.error("Refund Invoice failed error:", err)
    return {
      success: false,
      error: {
        message: err.message || "An unexpected error occurred",
      },
    }
  }
}
