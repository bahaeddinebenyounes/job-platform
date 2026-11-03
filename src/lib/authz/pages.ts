import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getEmployerContext } from "./employer";

/** Pour les pages employeur qui exigent une entreprise. Dev : pas de redirection vers /login. */
export async function requireEmployerCompanyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (user.role !== "EMPLOYER") redirect("/");
  const ctx = await getEmployerContext();
  if (!ctx.companyId) redirect("/employer/company/new");
  return { ...ctx, companyId: ctx.companyId };
}