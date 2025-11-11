import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getCustomer, listInvoiceByCustomer } from './passer-functions'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract a customer id from a URL path.
 *
 * Behavior:
 * - If `path` is provided, use it. Otherwise try `window.location.pathname` when available.
 * - If the path contains a `members` segment, return the segment immediately after it.
 * - Otherwise return the last non-empty segment.
 * - Returns `null` when no id can be determined (server-side without a path, or empty path).
 */
export function getCustomerIdFromPath(path?: string): string | null {
  const pathname = path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined)
  if (!pathname) return null

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return null

  const membersIndex = segments.findIndex(s => s.toLowerCase() === 'members')
  if (membersIndex >= 0 && membersIndex + 1 < segments.length) {
    return segments[membersIndex + 1]
  }

  return segments[segments.length - 1] ?? null
}

export function normalisedEzypayCustomer(customer) {
  let memberDataState = {};

  try {

    if (!customer.id) {
      throw new Error('Customer not found during normalising.');
    }

    const customerName = `${customer.firstName} ${customer.lastName}`;

    memberDataState = {
      id: customer.id,
      name: customerName,
      email: customer.email,
      phone: customer.mobilePhone,
      address: Object.values(customer.address).join(' '),
      dateOfBirth: customer.dateofBirth,
      emergencyContact: customer.homePhone,
      status: customer.metadata?.status ?? 'trial',
      plan: customer.metadata?.plan ?? 'Trial',
      joinDate: customer.metadata?.joinDate ?? new Date().toISOString().split('T')[0],
      expiryDate: customer.metadata?.expiryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      invoices: [],
      attendanceLogs: [
        { id: "1", date: "2024-10-14", time: "06:30 AM", class: "Yoga" },
        { id: "2", date: "2024-10-13", time: "05:00 PM", class: "CrossFit" },
        { id: "3", date: "2024-10-12", time: "07:00 AM", class: "Spinning" },
        { id: "4", date: "2024-10-11", time: "06:30 AM", class: "Yoga" },
      ],
      paymentMethods: [],
    };

  } catch (error) {
    console.error(error);
  }

  return memberDataState;
}

export async function normalisedEzypayInvoice(customerId) {
  let memberDataState = {};

  try {
    const customer = await getCustomer(customerId);

    if (!customer.id) {
      throw new Error('Customer not found');
    }

    const customerName = `${customer.firstName} ${customer.lastName}`;

    memberDataState = normalisedEzypayCustomer(customer)

    const invoices = await listInvoiceByCustomer(memberDataState.id, memberDataState.name);
    memberDataState.invoices = invoices;

  } catch (error) {
    console.error(error);
  }

  return memberDataState;
}
