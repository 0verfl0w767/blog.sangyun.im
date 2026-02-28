import { cookies } from "next/headers";

const COOKIE_NAME = "blog_admin_token";

export function generateToken(): string {
  const secret = process.env.JWT_SECRET || "fallback-secret";
  // Simple hash-based token (no external JWT library needed)
  const payload = `admin:${Date.now()}:${secret}`;
  return Buffer.from(payload).toString("base64");
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  return !!token?.value;
}

export function verifyPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export { COOKIE_NAME };
