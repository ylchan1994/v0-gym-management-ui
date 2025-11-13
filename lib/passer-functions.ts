'use server'

import {
  createCustomer as createEzypayCustomer,
  listCustomer as listEzypayCustomer,
  getCustomer as getEzypayCustomer,
  getCustomerPaymentMethods as getEzypayCustomerPaymentMethods
} from '@/lib/customer'
import { 
  listInvoiceByCustomer as listEzypayInvoiceByCustomer,
  listInvoice as listEzypayInvoice,
  listTransactionByInvoice as listEzypayTransactionByInvoice,
  retryInvoice as retryEzypayInvoice,
  writeOffInvoice as writeOffEzypayInvoice,
  recordExternalInvoice as recordEzypayExternalInvoice,
  refundInvoice as refundEzypayInvoice,
  createInvoice as createEzypayInvoice,
  createCheckout as createEzypayCheckout,
 } from "@/lib/invoice"
import { getEzypayToken as innerGetEzypayToken } from './ezypay-token' 
import { 
  replacePaymentMethod as replaceEzypayPaymentMethod,
  deletePaymentMethod as deleteEzypayPaymentMethod
 } from "@/lib/payment-methods"

export async function createCustomer(customer) {
  return await createEzypayCustomer(customer)
}

export async function listCustomer() {
  return await listEzypayCustomer()
}

export async function getCustomer(customer) {
  return await getEzypayCustomer(customer)
}

export async function listInvoiceByCustomer(customerId, customerName) {
  return await listEzypayInvoiceByCustomer(customerId, customerName)
}

export async function getEzypayToken() {
  return await innerGetEzypayToken()
}

export async function getCustomerPaymentMethods(customer) {
  return await getEzypayCustomerPaymentMethods(customer)
}

export async function listInvoice() {
  return await listEzypayInvoice()
}

export async function listTransactionByInvoice(invoiceId, paymentMethod) {
  return await listEzypayTransactionByInvoice(invoiceId, paymentMethod)
}

export async function retryInvoice(invoiceId, paymentMethodId) {
  return await retryEzypayInvoice(invoiceId, paymentMethodId)
}

export async function writeOffInvoice(invoiceId) {
  return await writeOffEzypayInvoice(invoiceId)
}

export async function recordExternalInvoice(invoiceId, method) {
  return await recordEzypayExternalInvoice(invoiceId, method)
}

export async function refundInvoice(invoiceId, amount) {
  return await refundEzypayInvoice(invoiceId, amount)
}

export async function createInvoice(invoiceData) {
  return await createEzypayInvoice(invoiceData)
}

export async function replacePaymentMethod(customerId, paymentMethod, newPaymentMethod) {
  return await replaceEzypayPaymentMethod(customerId, paymentMethod, newPaymentMethod)
}

export async function deletePaymentMethod(customerId, paymentMethod ) {
  return await deleteEzypayPaymentMethod(customerId, paymentMethod)
}

export async function createCheckout(invoiceData) {
  return await createEzypayCheckout(invoiceData)
}