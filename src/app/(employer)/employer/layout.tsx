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
      {children}
    </div>
  );
}