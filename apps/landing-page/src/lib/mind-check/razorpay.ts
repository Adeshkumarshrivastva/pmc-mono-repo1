import { createHmac } from "crypto";

export interface RazorpayKeys {
  keyId: string;
  keySecret: string;
}

export function razorpayKeys(): RazorpayKeys | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return null;
  return { keyId, keySecret };
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
}

export async function createRazorpayOrder(amount: number, receipt: string): Promise<RazorpayOrder> {
  const keys = razorpayKeys();
  if (!keys) throw new Error("Razorpay keys are not configured");

  const auth = Buffer.from(`${keys.keyId}:${keys.keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Razorpay order creation failed: ${body}`);
  }

  return response.json() as Promise<RazorpayOrder>;
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const keys = razorpayKeys();
  if (!keys) return false;
  const expected = createHmac("sha256", keys.keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return expected === signature;
}
