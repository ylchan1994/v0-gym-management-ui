'use server'

import { getEzypayToken } from "./ezypay-token";

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`
const merchantId = process.env.EZYPAY_MERCHANT_ID 

function normalisedEzypayInvoice(invoices, customerName = null) {

  function extractPaymentMethodData(paymentMethodData) {
    const type = paymentMethodData.type.toLowerCase()    

    switch (type) {
      case 'card':
        return `${paymentMethodData.card?.type} **** ${paymentMethodData.card?.last4}`
        break;
      case 'bank':
        return `**** ${paymentMethodData.bank?.last4}`
        break
      case 'payto':
        return paymentMethodData.payto.bbanAccountNo ?? paymentMethodData.payto.aliasId
    }
  }

  function mergeItemsByDescription(items) {
    const merged = {};

    items.forEach(item => {
      const desc = item.description;
      const amount = item.amount.value;

      if (merged[desc]) {
        merged[desc] += amount;
      } else {
        merged[desc] = amount;
      }
    });

    return Object.entries(merged).map(([description, amount]) => ({
      description,
      amount: `$${amount.toFixed(2)}`
    }));
  }
  const normalisedInvoice = invoices.data.map( invoice => ({
      id: invoice.id,
      member: customerName,
      amount: `$${invoice.amount.value}`,
      number: 'IN' + parseInt(invoice.documentNumber.substring(4)),
      date: invoice.date,
      dueDate: invoice.dueDate,
      paymentMethod: extractPaymentMethodData(invoice.paymentMethodData),
      items: mergeItemsByDescription(invoice.items),
      status: invoice.status.toLowerCase(),
      paymentAttempts: [],
      customerId: invoice.customerId,
      failedPaymentReason: invoice.failedPaymentReason,
      paymentProviderResponse: invoice.paymentProviderResponse
  }))

  return normalisedInvoice
}

export async function listInvoice(): Promise<any> {

  try {          
    // Get token directly from utility function instead of HTTP request
    const tokenData = await getEzypayToken()
    const token = tokenData.access_token
    if (!token) {
      console.error("No access_token from token utility", tokenData)
      throw new Error(`List customer failed: No access_token from token utility`)
    }    

    const invoiceResponse = await fetch(`${apiEndpoint}?limit=30&cursor=50`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List invoice failed:", invoiceResponse.status, text)
      throw new Error(`List invoice failed: ${invoiceResponse.status}`)
    }

    const invoiceData = await invoiceResponse.json()  

    let normalisedInvoice  = normalisedEzypayInvoice(invoiceData)   
    

    return normalisedInvoice
  } catch (err) {
    console.error("List invoice error:", err)
    throw err
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
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!invoiceResponse.ok) {
      const text = await invoiceResponse.text()
      console.error("List Customer invoice failed:", invoiceResponse.status, text)
      throw new Error(`List Customer invoice failed: ${invoiceResponse.status}`)
    }

    const invoiceData = await invoiceResponse.json()  

    let normalisedInvoice  = normalisedEzypayInvoice(invoiceData, customerName)

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
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
      },
    })

    if (!transactionResponse.ok) {
      const text = await transactionResponse.text()
      console.error("List transaction failed:", transactionResponse.status, text)
      throw new Error(`List transaction failed: ${transactionResponse.status}`)
    }

    const transactionData = await transactionResponse.json()  

    let transactions = transactionData.data.map( ( transaction ) => ({
      id: transaction.id,
      date: transaction.createdOn?.split('T')[0],
      amount: `$${transaction.amount.value}`,
      status: transaction.status.toLowerCase(),
      method: paymentMethod
    }))
    
    return transactions
  } catch (err) {
    console.error("List transaction error:", err)
    throw err
  }
}

export async function retryInvoice(invoiceId) {
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
      method: 'POST',
      headers: {
        "Authorization": `Bearer ${token}`,
        merchant: merchantId ,
        'Content-type': 'application/json'
      },
      body: '{}',
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
