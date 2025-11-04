'use server'

import { getEzypayToken } from "./ezypay-token";

const apiEndpoint = `${process.env.API_ENDPOINT}/v2/billing/invoices`
const transactionEndpoint = `${process.env.API_ENDPOINT}/v2/billing/transactions`
const merchantId = process.env.EZYPAY_MERCHANT_ID || "5ee1dffe-70ab-43a9-bc1c-d8b7bd66586d"

export async function listInvoiceByCustomer(customerId, customerName): Promise<any> {

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

    const invoiceResponse = await fetch(`${apiEndpoint}?customerId=${customerId}&limit=10`, {
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

    let invoices = invoiceData.data.map( invoice => ({
      id: invoice.id,
      member: customerName,
      amount: `$${invoice.amount.value}`,
      number: invoice.documentNumber.replace(/0/g, ''),
      date: invoice.date,
      dueDate: invoice.dueDate,
      paymentMethod: extractPaymentMethodData(invoice.paymentMethodData),
      items: mergeItemsByDescription(invoice.items),
      status: invoice.status.toLowerCase()
    }))

    
    const finalInvoice = await Promise.all(
      invoices.map(async invoice => {
        const paymentAttempts = await listTransactionByInvoice(invoice.id, invoice.paymentMethod);

        return {
          ...invoice,
          paymentAttempts,
        };
      })
    );

    return finalInvoice
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
