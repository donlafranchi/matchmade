import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac } from "node:crypto";
import { prisma } from "./prisma";

const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const authSecret = () => process.env.AUTH_SECRET || "dev-secret";

function sign(value: string) {
  return createHmac("sha256", authSecret()).update(value).digest("hex");
}

function encodeSession(userId: string) {
  const signature = sign(userId);
  return `${userId}.${signature}`;
}

function decodeSession(token: string) {
  const [userId, signature] = token.split(".");
  if (!userId || !signature) return null;
  if (sign(userId) !== signature) return null;
  return userId;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  const userId = cookie?.value ? decodeSession(cookie.value) : null;
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { contextProfiles: true },
  });
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  return user;
}

export async function setSessionCookie(userId: string) {
  const token = encodeSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
