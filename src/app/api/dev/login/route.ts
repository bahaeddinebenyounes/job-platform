import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signDevToken } from "@/lib/auth/dev-token";
import { DEV_COOKIE } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") return new NextResponse(null, { status: 404 });

  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email requis" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "utilisateur inconnu (lance le seed)" }, { status: 404 });

  const token = signDevToken(user.id);
  if (req.nextUrl.searchParams.get("json")) return NextResponse.json({ token, role: user.role });

  const next = req.nextUrl.searchParams.get("next") ?? "/employer/company";
  const res = NextResponse.redirect(new URL(next.startsWith("/") ? next : "/", req.url));
  res.cookies.set(DEV_COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 8 * 3600 });
  return res;
}