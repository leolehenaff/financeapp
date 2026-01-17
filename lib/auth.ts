import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

async function createSignature(value: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(value);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createAuthToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET!;
  const timestamp = Date.now().toString();
  const signature = await createSignature(timestamp, secret);
  return `${timestamp}.${signature}`;
}

export async function verifyAuthToken(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET!;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;

  // Check if token is expired (30 days)
  const tokenTime = parseInt(timestamp, 10);
  if (isNaN(tokenTime)) return false;

  const now = Date.now();
  const maxAge = COOKIE_MAX_AGE * 1000;
  if (now - tokenTime > maxAge) return false;

  const expectedSignature = await createSignature(timestamp, secret);
  return signature === expectedSignature;
}

export function verifyPassword(password: string): boolean {
  const expectedPassword = process.env.AUTH_PASSWORD;
  return password === expectedPassword;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAuthCookie();
  if (!token) return false;
  return verifyAuthToken(token);
}
