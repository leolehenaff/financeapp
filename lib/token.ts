const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

async function sign(value: string, secret: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(value));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createToken(secret: string) {
  const ts = Date.now().toString();
  return `${ts}.${await sign(ts, secret)}`;
}

export async function verifyToken(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return false;
  const [ts, sig] = token.split(".");
  if (!ts || !sig || Date.now() - Number(ts) > MAX_AGE_MS) return false;
  return sig === (await sign(ts, secret));
}
