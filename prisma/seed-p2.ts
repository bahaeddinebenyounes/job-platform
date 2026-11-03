import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type Role } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const passwordHash = "$2b$10$elgXH2On.ax0uLA1SebyquzM2PR66.d7trhQRsYyzhdvJTpqdSxji";

const places = [
  { name: "Tunis", governorate: "Tunis", latitude: 36.8065, longitude: 10.1815 },
  { name: "Nabeul", governorate: "Nabeul", latitude: 36.4513, longitude: 10.7357 },
  { name: "Sousse", governorate: "Sousse", latitude: 35.8256, longitude: 10.6084 },
  { name: "Sfax", governorate: "Sfax", latitude: 34.7406, longitude: 10.7603 },
];

const users: { email: string; name: string; role: Role }[] = [
  { email: "employer@test.local", name: "Employeur Test", role: "EMPLOYER" },
  { email: "employer2@test.local", name: "Employeur Test 2", role: "EMPLOYER" },
  { email: "candidate@test.local", name: "Candidat Test", role: "CANDIDATE" },
];

const professions = [
  { slug: "web-developer", nameFr: "Développeur web", category: "TECH" },
  { slug: "graphic-designer", nameFr: "Designer graphique", category: "TECH" },
  { slug: "accountant", nameFr: "Comptable", category: "GESTION" },
  { slug: "electrician", nameFr: "Électricien", category: "BATIMENT" },
  { slug: "plumber", nameFr: "Plombier", category: "BATIMENT" },
  { slug: "mechanic", nameFr: "Mécanicien", category: "AUTO" },
];

const skills = [
  { slug: "react", name: "React", aliases: ["reactjs", "react.js"] },
  { slug: "typescript", name: "TypeScript", aliases: ["ts"] },
  { slug: "nodejs", name: "Node.js", aliases: ["node"] },
  { slug: "postgresql", name: "PostgreSQL", aliases: ["postgres"] },
  { slug: "figma", name: "Figma", aliases: [] },
  { slug: "excel", name: "Excel", aliases: [] },
];

async function main() {
  for (const p of places) {
    await prisma.place.upsert({
      where: { governorate_name: { governorate: p.governorate, name: p.name } },
      update: p,
      create: p,
    });
  }
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, passwordHash, role: u.role },
      create: { ...u, passwordHash },
    });
  }
  for (const p of professions) {
    await prisma.profession.upsert({ where: { slug: p.slug }, update: p, create: p });
  }
  for (const s of skills) {
    await prisma.skill.upsert({
      where: { name: s.name },
      update: { slug: s.slug, aliases: s.aliases },
      create: s,
    });
  }
  console.log("Seed terminé : 4 villes, 3 utilisateurs, 6 métiers, 6 compétences.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());