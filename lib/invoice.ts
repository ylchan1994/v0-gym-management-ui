"use server"

import { getEzypayToken } from "./ezypay-token"

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const checkoutEndpoint = `${process.env.API_ENDPOINT}/v2/billing/checkout`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`
const merchantId = process.env.EZYPAY_MERCHANT_ID

function normalisedEzypayInvoice(invoices, customerName = null) {
  function extractPaymentMethodData(paymentMethodData) {
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

export async function listInvoice(): Promise<any> {
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

    const invoiceResponse = await fetch(`${apiEndpoint}?limit=30&cursor=50`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List invoice failed:", invoiceResponse.status, text)
      return []
    }

    const contentType = invoiceResponse.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await invoiceResponse.text()
      console.error("List invoice error: Expected JSON but received:", contentType, text.substring(0, 200))
      return []
    }

    const invoiceData = await invoiceResponse.json()

    const normalisedInvoice = normalisedEzypayInvoice(invoiceData)

    return normalisedInvoice
  } catch (err) {
    console.error("List invoice error:", err)
    return []
  }
}

export async function listInvoiceByCustomer(customerId, customerName): Promise<any> {
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

    const invoiceResponse = await fetch(`${apiEndpoint}?customerId=${customerId}&limit=30`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List Customer invoice failed:", invoiceResponse.status, text)
      throw new Error(`List Customer invoice failed: ${invoiceResponse.status}`)
    }

    const invoiceData = await invoiceResponse.json()

    const normalisedInvoice = normalisedEzypayInvoice(invoiceData, customerName)

    return normalisedInvoice
  } catch (err) {
    console.error("List invoice error:", err)
    throw err
  }
}

export async function listTransactionByInvoice(invoiceId, paymentMethod): Promise<any> {
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const transactionResponse = await fetch(`${transactionEndpoint}?documentId=${invoiceId}&limit=10`, {
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
      },
    })

    if (!transactionResponse.ok) {
      const text = await transactionResponse.text()
      console.error("List transaction failed:", transactionResponse.status, text)
      throw new Error(`List transaction failed: ${transactionResponse.status}`)
    }

    const transactionData = await transactionResponse.json()

    const transactions = transactionData.data.map((transaction) => ({
      id: transaction.id,
      date: transaction.createdOn?.split("T")[0],
      amount: `$${transaction.amount.value}`,
      status: transaction.status.toLowerCase(),
      method: transaction.source == "external_payment" ? `External (${transaction.paymentMethodType})` : paymentMethod,
    }))

    return transactions
  } catch (err) {
    console.error("List transaction error:", err)
    throw err
  }
}

export async function retryInvoice(invoiceId, paymentMethodId) {
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${invoiceId}/retrypayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"paymentMethodToken": "${paymentMethodId}",
        "oneOff": true}`,
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Retry Invoice failed:", response.status, text)
      throw new Error(`Retry invoice failed: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Retry Invoice failed error:", err)
    throw err
  }
}

export async function writeOffInvoice(invoiceId) {
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${invoiceId}/writeoff`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: "{}",
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Write off Invoice failed:", response.status, text)
      throw new Error(`Write off invoice failed: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Write off Invoice failed error:", err)
    throw err
  }
}

export async function recordExternalInvoice(invoiceId, method) {
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${invoiceId}/recordpayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: `{"paymentMethodType": "${method}"}`,
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Record External Invoice failed:", response.status, text)
      throw new Error(`Record External invoice failed: ${response.status}`)
    }

    return await response.json()
  } catch (err) {
    console.error("Record External Invoice failed error:", err)
    throw err
  }
}

export async function refundInvoice(invoiceId, amount = null) {
  try {
    if (!invoiceId) {
      throw new Error("No invoice ID")
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`Refund failed: No access_token from token utility`)
    }

    const response = await fetch(`${apiEndpoint}/${invoiceId}/refund`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        merchant: merchantId,
        "Content-type": "application/json",
      },
      body: amount ? `{"amount": "${amount}"}` : "{}",
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
      data: result,
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

export async function createInvoice(invoiceData) {
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
