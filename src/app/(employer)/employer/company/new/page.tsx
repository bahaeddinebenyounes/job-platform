import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { getEmployerContext } from "@/lib/authz/employer";
import { CompanyForm } from "@/components/employer/CompanyForm";

export default async function NewCompanyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYER") redirect("/");

  const ctx = await getEmployerContext();
  if (ctx.companyId) redirect("/employer/company");

  const places = await prisma.place.findMany({
    orderBy: [{ governorate: "asc" }, { name: "asc" }],
    select: { id: true, name: true, governorate: true },
  });

  return (
    <main className="p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Créer le compte de mon entreprise</h1>
      <CompanyForm places={places} />
    </main>
  );
}