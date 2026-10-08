import { NextRequest, NextResponse } from "next/server";
import { razorpayKeys, verifyRazorpaySignature } from "@/lib/mind-check/razorpay";
import { updateOrder } from "@/lib/mind-check/store";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { localOrderId, simulated, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};

  if (!localOrderId) return NextResponse.json({ ok: false }, { status: 400 });

  if (simulated) {
    // Simulated payments are only for local development. Never trust the client's word in production or when Razorpay is configured.
    if (razorpayKeys() || process.env.NODE_ENV === "production") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const order = await updateOrder(localOrderId, { status: "paid", paymentId: "TEST_SIMULATED", method: "test" });
    return NextResponse.json({ ok: Boolean(order) });
  }

  const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!valid) {
    await updateOrder(localOrderId, { status: "failed", failureReason: "Signature verification failed" });
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const order = await updateOrder(localOrderId, { status: "paid", paymentId: razorpay_payment_id, method: "razorpay" });
  return NextResponse.json({ ok: Boolean(order) });
}
