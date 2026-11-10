import Link from "next/link";
import type { ReactNode } from "react";

const links = [
  { href: "/employer/dashboard", label: "Tableau de bord" },
  { href: "/employer/company", label: "Mon entreprise" },
  { href: "/employer/jobs", label: "Mes offres" },
  { href: "/employer/candidates", label: "Candidats" },
    { href: "/employer/posts", label: "Publications" },

];

export default function EmployerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 px-6 py-3">
          <span className="font-semibold">Espace employeur</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-gray-700 hover:text-blue-600">
              {l.label}
            </Link>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}