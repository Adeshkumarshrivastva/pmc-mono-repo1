"use server";

import { redirect } from "next/navigation";
import { addEnquiry, generateId } from "@/lib/store";
import type { EnquiryTypeId } from "@/lib/customer";

export async function submitEnquiry(formData: FormData): Promise<void> {
  const type = String(formData.get("type")) as EnquiryTypeId;

  await addEnquiry({
    id: generateId("enq"),
    name: String(formData.get("name") ?? ""),
    city: String(formData.get("city") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? "") || undefined,
    type: type === "csr" ? "csr" : "cghs",
    organisation: String(formData.get("organisation") ?? "") || undefined,
    message: String(formData.get("message") ?? "") || undefined,
    contacted: false,
    createdAt: new Date().toISOString(),
  });

  redirect("/enquire?sent=1");
}
