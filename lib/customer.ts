'use server'
import { getEzypayToken } from "./passer-functions"

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
      address: customer.address ?? null,
      mobilePhone: customer.mobilePhone ?? null,
      dateOfBirth: customer.dateOfBirth ?? null,
      homePhone: customer.emergencyContact ?? null,
      metadata: {
        plan: customer.plan ?? 'Trial',
        status: customer.status ?? 'trial',
        startDate: new Date(customer.startDate).toISOString().split('T')[0] ?? new Date(Date.now()).toISOString().split('T')[0],
        dueDate: customer.startDate ? new Date(customer.startDate + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("Created customer failed:", response.status, text)
      throw new Error(`Create customer failed: ${response.status}`)
    }

    const data = await response.json()    

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

    const response = await fetch(`${apiEndpoint}?limit=30`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("List customer failed:", response.status, text)
      throw new Error(`List customer failed: ${response.status}`)
    }

    const data = await response.json()    

    return data
  } catch (err) {
    console.error("List customer error:", err)
    throw err
  }
}

export async function getCustomer(customerId: string | null): Promise<any> {
  console.log('Start calling the get customer API', new Date().toISOString())

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

    const response = await fetch(`${apiEndpoint}/${customerId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!response.ok) {
      const text = await response.text()
      console.error("List customer failed:", response.status, text)
      throw new Error(`List customer failed: ${response.status}`)
    }

    const data = await response.json()    

    return data
  } catch (err) {
    console.error("List customer error:", err)
    throw err
  }
}

export async function getCustomerPaymentMethods(customerId: string): Promise<any> {
  try {
    if (!customerId) {
      throw new Error('No customer ID provided')
    }

    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error('Unable to get access token')
    }

    const merchantId = process.env.EZYPAY_MERCHANT_ID || "5ee1dffe-70ab-43a9-bc1c-d8b7bd66586d"

    const res = await fetch(`https://api-sandbox.ezypay.com/v2/billing/customers/${customerId}/paymentmethods`, {
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
