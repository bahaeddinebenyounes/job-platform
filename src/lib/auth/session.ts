import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { forbidden, unauthorized } from "@/lib/errors";

export type SessionUser = { id: string; email: string; role: Role };

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });
}

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
