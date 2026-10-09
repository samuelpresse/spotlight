import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "spotlight_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

export const adminPasswordConfigured = () => !!process.env.ADMIN_PASSWORD;

const sessionToken = () =>
  createHmac("sha256", process.env.AUTH_SECRET || process.env.ADMIN_PASSWORD || "")
    .update("spotlight-admin-session")
    .digest("hex");

const safeEqual = (a: string, b: string) => {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
};

export async function isAdmin() {
  if (!adminPasswordConfigured()) return false;
  const value = (await cookies()).get(COOKIE_NAME)?.value;
  return !!value && safeEqual(value, sessionToken());
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function signIn(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !safeEqual(password, expected)) return false;
  (await cookies()).set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE_NAME);
}
