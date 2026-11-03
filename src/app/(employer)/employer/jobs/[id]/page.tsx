import { notFound } from "next/navigation";
import { requireEmployerCompanyPage } from "@/lib/authz/pages";
import { AppError } from "@/lib/errors";
import { getJob, getReferentials } from "@/modules/employer/jobs/service";
import { JobForm } from "@/components/employer/JobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { companyId } = await requireEmployerCompanyPage();
  const { id } = await params;

  const job = await getJob(companyId, id).catch((e) => {
    if (e instanceof AppError && e.status === 404) return null;
    throw e;
  });
  if (!job) notFound(); // inexistante OU d'une autre entreprise

  const { places, professions, skills } = await getReferentials();
  return (
    <main className="p-6">
      <h1 className="mb-6 text-center text-2xl font-semibold">Modifier l&apos;offre</h1>
      <JobForm
        defaults={{
          id: job.id, title: job.title, description: job.description,
          professionId: job.professionId, experienceMinYears: job.experienceMinYears,
          educationLevel: job.educationLevel, contractType: job.contractType,
          workMode: job.workMode, salaryMin: job.salaryMin, salaryMax: job.salaryMax,
          placeId: job.placeId, deadline: job.deadline?.toISOString().slice(0, 10),
          skillIds: job.skills.map((s) => s.skillId),
        }}
        places={places.map((p) => ({ id: p.id, name: `${p.name} (${p.governorate})` }))}
        professions={professions.map((p) => ({ id: p.id, name: p.nameFr }))}
        skills={skills.map((s) => ({ id: s.id, name: s.name }))}
      />
    </main>
  );
}