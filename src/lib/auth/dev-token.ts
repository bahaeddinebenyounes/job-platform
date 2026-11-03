import { createHmac, timingSafeEqual } from "node:crypto";

const secret = () => {
  const s = process.env.DEV_AUTH_SECRET;
  if (!s) throw new Error("DEV_AUTH_SECRET manquant dans .env");
  return s;
};
const hmac = (p: string) => createHmac("sha256", secret()).update(p).digest();

export function signDevToken(userId: string, ttl = 8 * 3600) {
  const payload = Buffer.from(
    JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1000) + ttl }),
  ).toString("base64url");
  return `${payload}.${hmac(payload).toString("base64url")}`;
}

export function verifyDevToken(token: string): string | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (typeof sub !== "string" || typeof exp !== "number" || exp < Date.now() / 1000) return null;
    return sub;
  } catch {
    return null;
  }
}