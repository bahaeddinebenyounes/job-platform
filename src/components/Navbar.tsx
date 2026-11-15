import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function Navbar() {
  const session = await auth();
  if (!session?.user) return null;

  const links =
    session.user.role === "CANDIDATE"
      ? [
          { href: "/home", label: "Home" },
          { href: "/candidate/profile", label: "Profile" },
          { href: "/candidate/cv", label: "CV" },
          { href: "/candidate/applications", label: "Applications" },
          { href: "/candidate/recommendations", label: "Recommendations" },
        ]
      : [{ href: "/home", label: "Home" }];

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/home" className="text-lg font-bold text-brand">
            JobMatch
          </Link>
          <ul className="hidden gap-4 text-sm text-muted sm:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button type="submit" className="btn-ghost">
            Log out
          </button>
        </form>
      </nav>
    </header>
  );
}