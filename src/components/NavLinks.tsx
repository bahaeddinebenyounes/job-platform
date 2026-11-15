"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  UserRound,
  FileText,
  Briefcase,
  Sparkles,
} from "lucide-react";

const ICONS = {
  home: Home,
  profile: UserRound,
  cv: FileText,
  applications: Briefcase,
  recommendations: Sparkles,
};

export type NavItem = {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
};

type Props = { items: NavItem[]; variant: "sidebar" | "tabbar" };

export default function NavLinks({ items, variant }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  if (variant === "tabbar") {
    return (
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition ${
                  active ? "text-brand" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon];
        const active = isActive(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-soft text-brand"
                  : "text-muted hover:bg-page hover:text-ink"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}