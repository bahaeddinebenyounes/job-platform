import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/session";
import { notFound } from "@/lib/errors";

export async function getEmployerContext() {
  const user = await requireRole("EMPLOYER");
  const profile = await prisma.employerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, companyId: true },
  });
  return { user, companyId: profile?.companyId ?? null };
}

export async function requireCompany() {
  const ctx = await getEmployerContext();
  if (!ctx.companyId) throw notFound();
  return { ...ctx, companyId: ctx.companyId };
}