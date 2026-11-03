import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

function required<T>(value: T | null, label: string): T {
  if (value === null) throw new Error(`Référentiel manquant : ${label}. Exécutez seed-p2.ts d'abord.`);
  return value;
}

async function main() {
  const [devResult, designResult, nabeulResult, tunisResult, reactResult, tsResult, figmaResult] = await Promise.all([
    prisma.profession.findUnique({ where: { slug: "web-developer" } }),
    prisma.profession.findUnique({ where: { slug: "graphic-designer" } }),
    prisma.place.findUnique({ where: { governorate_name: { governorate: "Nabeul", name: "Nabeul" } } }),
    prisma.place.findUnique({ where: { governorate_name: { governorate: "Tunis", name: "Tunis" } } }),
    prisma.skill.findUnique({ where: { name: "React" } }),
    prisma.skill.findUnique({ where: { name: "TypeScript" } }),
    prisma.skill.findUnique({ where: { name: "Figma" } }),
  ]);
  const dev = required(devResult, "web-developer");
  const design = required(designResult, "graphic-designer");
  const nabeul = required(nabeulResult, "Nabeul");
  const tunis = required(tunisResult, "Tunis");
  const react = required(reactResult, "React");
  const ts = required(tsResult, "TypeScript");
  const figma = required(figmaResult, "Figma");

  const data = [
    { email: "cand1@test.local", prof: dev, place: nabeul, years: 3, visibility: "SEARCHABLE" as const, skills: [react, ts] },
    { email: "cand2@test.local", prof: dev, place: tunis, years: 6, visibility: "SEARCHABLE" as const, skills: [ts] },
    { email: "cand3@test.local", prof: design, place: tunis, years: 2, visibility: "APPLICANTS_ONLY" as const, skills: [figma] },
  ];

  for (const d of data) {
    const user = await prisma.user.findUnique({ where: { email: d.email } });
    if (!user) throw new Error(`Utilisateur manquant : ${d.email}. Exécutez seed-applications.ts d'abord.`);
    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {
        professionId: d.prof?.id,
        placeId: d.place?.id,
        yearsExperience: d.years,
        profileVisibility: d.visibility,
      },
      create: {
        userId: user.id,
        professionId: d.prof.id,
        placeId: d.place.id,
        yearsExperience: d.years,
        profileVisibility: d.visibility,
      },
    });
    for (const s of d.skills) {
      await prisma.candidateSkill.upsert({
        where: { candidateId_skillId: { candidateId: profile.id, skillId: s.id } },
        update: {},
        create: { candidateId: profile.id, skillId: s.id },
      });
    }
  }
  console.log("Candidats enrichis : 2 SEARCHABLE, 1 APPLICANTS_ONLY.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());