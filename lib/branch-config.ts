"use server"

// Branch configuration with environment variable mapping
// Each branch has its own set of Ezypay credentials stored in env vars

export type BranchId = "main" | "branch2"

export interface BranchConfig {
  id: BranchId
  name: string
}

export const BRANCHES: Record<BranchId, BranchConfig> = {
  main: {
    id: "main",
    name: "Main Branch",
  },
  branch2: {
    id: "branch2",
    name: "Branch 2",
  },
}

// Helper function to get branch credentials from environment variables
export function getBranchCredentials(branchId: BranchId) {
  const branchPrefix = branchId === "main" ? "" : "BRANCH2_"

  const clientIdVar = branchPrefix ? `${branchPrefix}EZYPAY_CLIENT_ID` : "EZYPAY_CLIENT_ID"
  const clientSecretVar = branchPrefix ? `${branchPrefix}EZYPAY_CLIENT_SECRET` : "EZYPAY_CLIENT_SECRET"
  const usernameVar = branchPrefix ? `${branchPrefix}EZYPAY_USERNAME` : "EZYPAY_USERNAME"
  const passwordVar = branchPrefix ? `${branchPrefix}EZYPAY_PASSWORD` : "EZYPAY_PASSWORD"
  const merchantIdVar = branchPrefix ? `${branchPrefix}EZYPAY_MERCHANT_ID` : "EZYPAY_MERCHANT_ID"

  return {
    clientId: process.env[clientIdVar] || "",
    clientSecret: process.env[clientSecretVar] || "",
    username: process.env[usernameVar] || "",
    password: process.env[passwordVar] || "",
    merchantId: process.env[merchantIdVar] || "",
  }
}

// Helper to validate credentials exist
export function validateBranchCredentials(branchId: BranchId): boolean {
  const creds = getBranchCredentials(branchId)
  return !!(creds.clientId && creds.clientSecret && creds.username && creds.password && creds.merchantId)
}
