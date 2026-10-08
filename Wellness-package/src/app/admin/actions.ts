"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminPassword, createSession, destroySession } from "@/lib/admin-auth";
import { toggleContacted as toggleContactedInStore } from "@/lib/store";

export async function login(formData: FormData): Promise<void> {
  const password = String(formData.get("password") ?? "");
  if (!password || password !== adminPassword()) {
    redirect("/admin?error=1");
  }
  await createSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/admin");
}

export async function toggleContacted(formData: FormData): Promise<void> {
  const kind = String(formData.get("kind"));
  const id = String(formData.get("id"));
  const contacted = String(formData.get("contacted")) === "true";
  if (kind !== "order" && kind !== "enquiry") return;
  await toggleContactedInStore(kind, id, contacted);
  revalidatePath("/admin");
}
