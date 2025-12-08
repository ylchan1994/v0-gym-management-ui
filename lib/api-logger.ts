"use server"

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  response: any
  status: number
}

const apiLogs: ApiLog[] = []

export async function logApiCall(method: string, url: string, response: any, status: number) {
  const log: ApiLog = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    method,
    url,
    response,
    status,
  }
  apiLogs.push(log)
  // Keep only last 50 logs
  if (apiLogs.length > 50) {
    apiLogs.shift()
  }
}

export async function getApiLogs(): Promise<ApiLog[]> {
  return apiLogs
}

export async function clearApiLogs() {
  apiLogs.length = 0
}
