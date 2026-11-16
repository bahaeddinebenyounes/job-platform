import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { getReferentials } from "@/modules/employer/jobs/service";
import { JobForm } from "@/components/employer/JobForm";

export default async function NewJobPage() {
  await requireEmployerCompanyPage();
  const { places, professions, skills } = await getReferentials();
  return (
    <main className="p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Nouvelle offre</h1>
      <JobForm
        places={places.map((p) => ({ id: p.id, name: `${p.name} (${p.governorate})` }))}
        professions={professions.map((p) => ({ id: p.id, name: p.nameFr }))}
        skills={skills.map((s) => ({ id: s.id, name: s.name }))}
      />
    </main>
  );
}