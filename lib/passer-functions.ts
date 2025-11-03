'use server'

import {
  createCustomer as createEzypayCustomer,
  listCustomer as listEzypayCustomer,
  getCustomer as getEzypayCustomer,
  getCustomerPaymentMethods as getEzypayCustomerPaymentMethods
} from '@/lib/customer'
import { listInvoiceByCustomer as listEzypayInvoiceByCustomer } from "@/lib/invoice"
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

export async function listInvoiceByCustomer(customerId) {
  return await listEzypayInvoiceByCustomer(customerId)
}

export async function getEzypayToken() {
  return await innerGetEzypayToken()
}

export async function getCustomerPaymentMethods(customer) {
  return await getEzypayCustomerPaymentMethods(customer)
}