import { NextRequest, NextResponse } from "next/server";
import { findPackage } from "@/lib/catalog";
import { encodeAnswers, computeOverallPercent } from "@/lib/assessment";
import { createRazorpayOrder, razorpayKeys } from "@/lib/razorpay";
import { createOrder, generateId, type OrderRecord } from "@/lib/store";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();
  const { packageId, customer, answers } = body ?? {};

  const pkg = findPackage(packageId);
  if (!pkg) return NextResponse.json({ error: "Unknown package" }, { status: 400 });
  if (!customer?.name || !customer?.phone || !customer?.email || !customer?.city) {
    return NextResponse.json({ error: "Missing customer details" }, { status: 400 });
  }

  const orderId = generateId("order");
  const receipt = `rcpt_${orderId}`;
  const overallPercent = Array.isArray(answers) ? computeOverallPercent(answers) : 0;

  const order: OrderRecord = {
    id: orderId,
    receipt,
    status: "created",
    customer: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      age: Number(customer.age) || 0,
      gender: customer.gender ?? "",
      city: customer.city,
    },
    items: [{ packageId: pkg.id, name: pkg.name, price: pkg.price }],
    total: pkg.price,
    createdAt: new Date().toISOString(),
    contacted: false,
    checkIns: Array.isArray(answers)
      ? [{ answers: encodeAnswers(answers), overallPercent, createdAt: new Date().toISOString() }]
      : [],
    source: "mind-check-quiz",
  };

  await createOrder(order);

  const keys = razorpayKeys();
  if (!keys) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Online payment is currently unavailable" }, { status: 503 });
    }
    return NextResponse.json({ simulated: true, localOrderId: order.id, package: pkg });
  }

  try {
    const rzpOrder = await createRazorpayOrder(pkg.price, receipt);
    return NextResponse.json({
      simulated: false,
      localOrderId: order.id,
      keyId: keys.keyId,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      package: pkg,
    });
  } catch (error) {
    console.error("[checkout] razorpay order failed:", error);
    return NextResponse.json({ simulated: true, localOrderId: order.id, package: pkg });
  }
}
