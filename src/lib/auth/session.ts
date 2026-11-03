import { cookies, headers } from "next/headers";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/errors";
import { verifyDevToken } from "./dev-token";

export type SessionUser = { id: string; email: string; role: Role };
export const DEV_COOKIE = "dev_auth";

// ───── DEV UNIQUEMENT : à remplacer par l'authentification réelle ─────
export async function getSessionUser(): Promise<SessionUser | null> {
  if (process.env.NODE_ENV === "production") return null;
  const bearer = (await headers()).get("authorization")?.replace(/^Bearer /i, "");
  const token = bearer || (await cookies()).get(DEV_COOKIE)?.value;
  if (!token) return null;
  const userId = verifyDevToken(token);
  if (!userId) return null;
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true }, // le rôle vient de la base
  });
}
// ──────────────────────────────────────────────────────────────────────

export async function requireUser(): Promise<SessionUser> {
  const u = await getSessionUser();
  if (!u) throw unauthorized();
  return u;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const u = await requireUser();
  if (!roles.includes(u.role)) throw forbidden();
  return u;
}
