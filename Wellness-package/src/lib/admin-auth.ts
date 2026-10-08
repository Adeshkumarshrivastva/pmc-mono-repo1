import { createHash } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "admin_session";

export function adminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined;
}

function sessionToken(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function isAdmin(): Promise<boolean> {
  const password = adminPassword();
  if (!password) return false;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  return token === sessionToken(password);
}

export async function createSession(): Promise<void> {
  const password = adminPassword();
  if (!password) return;
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
