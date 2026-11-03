import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getEmployerContext } from "@/lib/authz/employer";
import { logoUrl } from "@/lib/storage/logo";
import { getMyCompany } from "@/modules/employer/company/service";
import { HIRING_LABELS } from "@/modules/employer/company/constants";
import { HiringStatusForm } from "@/components/employer/HiringStatusForm";

const BADGE = {
  ACTIVELY_HIRING: "bg-green-100 text-green-800",
  OPEN_TO_APPLICATIONS: "bg-amber-100 text-amber-800",
  NOT_HIRING: "bg-gray-100 text-gray-700",
} as const;

export default async function CompanyPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "EMPLOYER") redirect("/");

  const { companyId } = await getEmployerContext();
  if (!companyId) redirect("/employer/company/new");

  const c = await getMyCompany(companyId);
  const logo = logoUrl(c.logoKey);

  return (
    <main className="mx-auto max-w-3xl space-y-8 p-6">
      <header className="space-y-3">
        <div className="flex items-center gap-4">
          {logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt={`Logo ${c.name}`} className="h-20 w-20 rounded-md border object-cover" />
          )}
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold">{c.name}</h1>
            <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${BADGE[c.hiringStatus]}`}>
              {HIRING_LABELS[c.hiringStatus]}
            </span>
          </div>
        </div>
        {c.hiringNote && <p className="text-sm text-gray-600">{c.hiringNote}</p>}
        <p className="text-sm text-gray-600">
          {[c.industry, c.employeeCount && `${c.employeeCount} employés`, c.place?.name]
            .filter(Boolean)
            .join(" · ")}
        </p>
        {c.description && <p className="whitespace-pre-line">{c.description}</p>}
      </header>

      <section>
        <h2 className="mb-2 text-lg font-medium">Informations</h2>
        <ul className="space-y-1 text-sm text-gray-700">
          <li>Patente : {c.patenteNumber}</li>
          {c.phone && <li>Téléphone : {c.phone}</li>}
          {c.contactEmail && <li>Email : {c.contactEmail}</li>}
          {c.website && <li>Site : {c.website}</li>}
          {c.address && <li>Adresse : {c.address}</li>}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Statut de recrutement</h2>
        <HiringStatusForm defaultStatus={c.hiringStatus} defaultNote={c.hiringNote ?? ""} />
      </section>
    </main>
  );
}