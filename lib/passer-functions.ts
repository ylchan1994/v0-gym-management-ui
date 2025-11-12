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
  retryInvoice as retryEzypayInvoice
 } from "@/lib/invoice"
import { getEzypayToken as innerGetEzypayToken } from './ezypay-token' 

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

export async function retryInvoice(invoiceId) {
  return await retryEzypayInvoice(invoiceId)
}