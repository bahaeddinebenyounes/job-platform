import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionUser, DEV_COOKIE } from "@/lib/auth/session";

export async function GET() {
  const hasCookie = !!(await cookies()).get(DEV_COOKIE)?.value;
  const user = await getSessionUser();
  return NextResponse.json({ hasCookie, user });
}