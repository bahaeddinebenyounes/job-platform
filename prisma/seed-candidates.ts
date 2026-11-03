import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function main() {
  const [dev, design, nabeul, tunis, react, ts, figma] = await Promise.all([
    prisma.profession.findUnique({ where: { slug: "web-developer" } }),
    prisma.profession.findUnique({ where: { slug: "graphic-designer" } }),
    prisma.place.findFirst({ where: { name: "Nabeul" } }),
    prisma.place.findFirst({ where: { name: "Tunis" } }),
    prisma.skill.findUnique({ where: { slug: "react" } }),
    prisma.skill.findUnique({ where: { slug: "typescript" } }),
    prisma.skill.findUnique({ where: { slug: "figma" } }),
  ]);

  const data = [
    { email: "cand1@test.local", prof: dev, place: nabeul, years: 3, vis: "SEARCHABLE" as const, skills: [react, ts] },
    { email: "cand2@test.local", prof: dev, place: tunis, years: 6, vis: "SEARCHABLE" as const, skills: [ts] },
    { email: "cand3@test.local", prof: design, place: tunis, years: 2, vis: "APPLICANTS_ONLY" as const, skills: [figma] },
  ];

  for (const d of data) {
    const user = await prisma.user.findUnique({ where: { email: d.email } });
    if (!user) continue;
    const profile = await prisma.candidateProfile.update({
      where: { userId: user.id },
      data: {
        professionId: d.prof?.id,
        placeId: d.place?.id,
        yearsExperience: d.years,
        profileVisibility: d.vis,
      },
    });
    for (const s of d.skills) {
      if (!s) continue;
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