import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const roleRoutes = {
  "/candidate": "CANDIDATE",
  "/employer": "EMPLOYER",
  "/admin": "ADMIN",
} as const;
export const proxy = auth((req) => {
      const { pathname } = req.nextUrl;
  const user = req.auth?.user;

  // Logged-in users don't need the login and register pages
  if (user && (pathname === "/login" || pathname === "/register")) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  for (const [prefix, role] of Object.entries(roleRoutes)) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      if (!user) {
        return Response.redirect(new URL("/login", req.nextUrl));
      }
      if (user.role !== role) {
        return Response.redirect(new URL("/", req.nextUrl));
      }
    }
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};