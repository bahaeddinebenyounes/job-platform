import Link from "next/link";
import { LogOut } from "lucide-react";
import { auth, signOut } from "@/auth";
import NavLinks, { type NavItem } from "./NavLinks";

const CANDIDATE_NAV: NavItem[] = [
  { href: "/home", label: "Home", icon: "home" },
  { href: "/candidate/profile", label: "Profile", icon: "profile" },
  { href: "/candidate/cv", label: "CV", icon: "cv" },
  { href: "/candidate/applications", label: "Applications", icon: "applications" },
  { href: "/candidate/recommendations", label: "Matches", icon: "recommendations" },
];

// Your colleague adds the employer links here
const EMPLOYER_NAV: NavItem[] = [{ href: "/home", label: "Home", icon: "home" }];

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Logo() {
  return (
    <Link href="/home" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand font-[family-name:var(--font-display)] text-lg font-bold text-white">
        J
      </span>
      <span className="font-[family-name:var(--font-display)] text-lg font-bold">
        JobMatch
      </span>
    </Link>
  );
}

export default async function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return <>{children}</>;

  const items =
    session.user.role === "CANDIDATE" ? CANDIDATE_NAV : EMPLOYER_NAV;

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between border-r border-line bg-surface p-4 lg:flex">
        <div className="flex flex-col gap-8">
          <div className="px-2 pt-2">
            <Logo />
          </div>
          <NavLinks items={items} variant="sidebar" />
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-line p-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-ink">
            {initials(session.user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.user.name}</p>
            <p className="text-xs capitalize text-muted">
              {session.user.role?.toLowerCase()}
            </p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              aria-label="Log out"
              className="rounded-lg p-2 text-muted transition hover:bg-page hover:text-ink"
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-surface px-4 py-3 lg:hidden">
        <Logo />
        <form action={logout}>
          <button
            type="submit"
            aria-label="Log out"
            className="rounded-lg p-2 text-muted transition hover:bg-page hover:text-ink"
          >
            <LogOut size={18} />
          </button>
        </form>
      </header>

      <div className="pb-20 lg:pb-0 lg:pl-64">{children}</div>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface lg:hidden">
        <NavLinks items={items} variant="tabbar" />
      </nav>
    </div>
  );
}