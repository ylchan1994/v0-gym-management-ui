"use server";

import {
  createCustomer as createEzypayCustomer,
  listCustomer as listEzypayCustomer,
  getCustomer as getEzypayCustomer,
  getCustomerPaymentMethods as getEzypayCustomerPaymentMethods,
} from "@/lib/customer";
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
} from "@/lib/invoice";
import { getEzypayToken as innerGetEzypayToken } from "./ezypay-token";
import {
  replacePaymentMethod as replaceEzypayPaymentMethod,
  deletePaymentMethod as deleteEzypayPaymentMethod,
  linkPaymentMethod as linkEzypayPaymentMethod,
} from "@/lib/payment-methods";
import {
  listSettlements as listEzypaySettlements,
  downloadDocument as downloadEzypayDocument,
} from "@/lib/settlements";

export async function createCustomer(customer, branch) {
  return await createEzypayCustomer(customer, branch);
}

export async function listCustomer(branch, customerNumber = null) {
  return await listEzypayCustomer(branch, customerNumber);
}

export async function getCustomer(customer, branch) {
  return await getEzypayCustomer(customer, branch);
}

export async function listInvoiceByCustomer(customerId, customerName, branch) {
  return await listEzypayInvoiceByCustomer(customerId, customerName, branch);
}

export async function getEzypayToken(branch) {
  return await innerGetEzypayToken(branch);
}

export async function getCustomerPaymentMethods(customer, branch) {
  return await getEzypayCustomerPaymentMethods(customer, branch);
}

export async function listInvoice(branch) {
  return await listEzypayInvoice(branch);
}

export async function listTransactionByInvoice(
  invoiceId,
  paymentMethod,
  branch
) {
  return await listEzypayTransactionByInvoice(invoiceId, paymentMethod, branch);
}

export async function retryInvoice(invoiceId, paymentMethodId, branch) {
  return await retryEzypayInvoice(invoiceId, paymentMethodId, branch);
}

export async function writeOffInvoice(invoiceId, branch) {
  return await writeOffEzypayInvoice(invoiceId, branch);
}

export async function recordExternalInvoice(invoiceId, method, branch) {
  return await recordEzypayExternalInvoice(invoiceId, method, branch);
}

export async function refundInvoice(invoiceId, amount, branch) {
  return await refundEzypayInvoice(invoiceId, amount, branch);
}

export async function createInvoice(invoiceData, branch) {
  return await createEzypayInvoice(invoiceData, branch);
}

export async function replacePaymentMethod(
  customerId,
  paymentMethod,
  newPaymentMethod,
  branch
) {
  return await replaceEzypayPaymentMethod(
    customerId,
    paymentMethod,
    newPaymentMethod,
    branch
  );
}

export async function deletePaymentMethod(customerId, paymentMethod, branch) {
  return await deleteEzypayPaymentMethod(customerId, paymentMethod, branch);
}

export async function createCheckout(invoiceData, branch) {
  return await createEzypayCheckout(invoiceData, branch);
}

export async function listSettlements(branch) {
  return await listEzypaySettlements(branch);
}

export async function downloadDocument(settlementId, documentType, branch) {
  return await downloadEzypayDocument(settlementId, documentType, branch);
}

export async function linkPaymentMethod(customerId, paymentMethod, branch) {
  return await linkEzypayPaymentMethod(customerId, paymentMethod, branch);
}
