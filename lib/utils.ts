import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
