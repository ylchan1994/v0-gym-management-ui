"use server";

// Branch configuration with environment variable mapping
// Each branch has its own set of Ezypay credentials stored in env vars

// Helper function to get branch credentials from environment variables
export async function getBranchCredentials(branchId: String) {
  const isMainBranch = branchId === "main";
  return {
    clientId: process.env.EZYPAY_CLIENT_ID,
    clientSecret: process.env.EZYPAY_CLIENT_SECRET,
    username:
      process.env[
        isMainBranch
          ? "EZYPAY_USERNAME"
          : `${branchId.toUpperCase()}_EZYPAY_USERNAME`
      ] || "",
    password:
      process.env[
        isMainBranch
          ? "EZYPAY_PASSWORD"
          : `${branchId.toUpperCase()}_EZYPAY_PASSWORD`
      ] || "",
    merchantId:
      process.env[
        isMainBranch
          ? "EZYPAY_MERCHANT_ID"
          : `${branchId.toUpperCase()}_EZYPAY_MERCHANT_ID`
      ] || "",
  };
}
