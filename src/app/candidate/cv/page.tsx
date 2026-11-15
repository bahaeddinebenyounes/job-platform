import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  removeSkillAction,
  deleteExperienceAction,
  deleteEducationAction,
} from "./actions";
import SkillForm from "./SkillForm";
import ExperienceForm from "./ExperienceForm";
import EducationForm from "./EducationForm";

const LEVELS = ["", "Beginner", "Intermediate", "Advanced", "Expert"];

function formatMonth(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatPeriod(start: Date, end: Date | null, isCurrent: boolean) {
  return `${formatMonth(start)} – ${isCurrent || !end ? "Present" : formatMonth(end)}`;
}

export default async function CvPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: { include: { skill: true }, orderBy: { level: "desc" } },
      experiences: { orderBy: { startDate: "desc" } },
      educations: { orderBy: { startDate: "desc" } },
    },
  });
  if (!profile) redirect("/");

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">My CV</h1>
        <p className="text-sm text-muted">
          Fill each section. This is the data used to match you with jobs.
        </p>
      </div>

      {/* Skills */}
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Skills</h2>

        {profile.skills.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {profile.skills.map((cs) => (
              <li
                key={cs.skillId}
                className="flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand"
              >
                <span>
                  {cs.skill.name}
                  {cs.level ? ` · ${LEVELS[cs.level]}` : ""}
                </span>
                <form action={removeSkillAction}>
                  <input type="hidden" name="skillId" value={cs.skillId} />
                  <button
                    type="submit"
                    aria-label={`Remove ${cs.skill.name}`}
                    className="text-brand/60 transition hover:text-red-600"
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <div className="border-t border-line pt-4">
          <SkillForm />
        </div>
      </section>

      {/* Experience */}
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Experience</h2>

        {profile.experiences.map((exp) => (
          <div
            key={exp.id}
            className="flex flex-col gap-1 rounded-lg border border-line p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{exp.title}</p>
                <p className="text-sm">
                  {exp.companyName}
                  {exp.location ? ` · ${exp.location}` : ""}
                </p>
                <p className="text-sm text-muted">
                  {formatPeriod(exp.startDate, exp.endDate, exp.isCurrent)}
                </p>
              </div>
              <form action={deleteExperienceAction}>
                <input type="hidden" name="id" value={exp.id} />
                <button
                  type="submit"
                  className="text-sm text-muted transition hover:text-red-600"
                >
                  Delete
                </button>
              </form>
            </div>
            {exp.description && (
              <p className="whitespace-pre-line text-sm">{exp.description}</p>
            )}
          </div>
        ))}

        <div className="border-t border-line pt-4">
          <ExperienceForm />
        </div>
      </section>

      {/* Education */}
      <section className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Education</h2>

        {profile.educations.map((edu) => (
          <div
            key={edu.id}
            className="flex flex-col gap-1 rounded-lg border border-line p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">
                  {edu.degree}
                  {edu.field ? `, ${edu.field}` : ""}
                </p>
                <p className="text-sm">{edu.school}</p>
                <p className="text-sm text-muted">
                  {formatPeriod(edu.startDate, edu.endDate, edu.isCurrent)}
                </p>
              </div>
              <form action={deleteEducationAction}>
                <input type="hidden" name="id" value={edu.id} />
                <button
                  type="submit"
                  className="text-sm text-muted transition hover:text-red-600"
                >
                  Delete
                </button>
              </form>
            </div>
            {edu.description && (
              <p className="whitespace-pre-line text-sm">{edu.description}</p>
            )}
          </div>
        ))}

        <div className="border-t border-line pt-4">
          <EducationForm />
        </div>
      </section>
    </main>
  );
}