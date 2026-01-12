"use server"

import { setItem, getItem, clearStore } from './json-store'

export type ApiLog = {
  id: string
  timestamp: string
  method: string
  url: string
  requestBody?: any
  response: any
  status: number
}

let apiLogs: ApiLog[] = []

export async function logApiCall(method: string, url: string, response: any, status: number, requestBody?: any) {
  const log: ApiLog = {
    id: `${Date.now()}-${Math.random()}`,
    timestamp: new Date().toISOString(),
    method,
    url,
    requestBody,
    response,
    status,
  }
  apiLogs.push(log)
  // Keep only last 100 logs
  if (apiLogs.length > 100) {
    apiLogs.shift()
  }
  //await setItem('apiLog', JSON.stringify(apiLogs))
}

export async function getApiLogFromLocal() {
  const localApiLog = await getItem('apiLog')
  if (!localApiLog) return
  apiLogs = JSON.parse(localApiLog)
}

export async function getApiLogs(): Promise<ApiLog[]> {
  return apiLogs
}

export async function clearApiLogs() {
  apiLogs.length = 0
  //await clearStore()
}
