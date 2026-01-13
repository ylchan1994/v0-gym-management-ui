"use server";

import { getBranchCredentials } from "./branch-config";

export async function getEzypayToken(branch: "main" | "branch2"): Promise<{
  access_token: string;
  error?: string;
}> {
  try {
    // Get selected branch from client-side storage via header or default to main
    const credentials = await getBranchCredentials(branch);

    const { clientId, clientSecret, username, password } = credentials;

    if (!clientId || !clientSecret || !username || !password) {
      throw new Error(
        `Missing EZYPAY_* environment variables for branch '${branch}'`
      );
    }

    const tokenUrl = "https://identity-sandbox.ezypay.com/token";

    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("client_id", clientId);
    body.append("client_secret", clientSecret);
    body.append("username", username);
    body.append("password", password);
    body.append(
      "scope",
      "integrator billing_profile create_payment_method offline_access"
    );

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Ezypay token fetch failed:", response.status, text);
      throw new Error(`Token fetch failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.access_token) {
      console.error("No access_token in response:", data);
      throw new Error("No access_token in response");
    }

    return data;
  } catch (err) {
    console.error("getEzypayToken error:", err);
    throw err;
  }
}
