"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  phone: z.string().max(30, "Phone is too long"),
  location: z.string().max(100, "Location is too long"),
  headline: z.string().max(120, "Headline is too long"),
  bio: z.string().max(2000, "Bio is too long"),
});

export type ProfileState = { error?: string; success?: boolean };

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "CANDIDATE") {
    return { error: "Unauthorized" };
  }

  const parsed = profileSchema.safeParse({
    phone: String(formData.get("phone") ?? ""),
    location: String(formData.get("location") ?? ""),
    headline: String(formData.get("headline") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const clean = (value: string) => value.trim() || null;

  await prisma.candidateProfile.update({
    where: { userId: session.user.id },
    data: {
      phone: clean(parsed.data.phone),
      location: clean(parsed.data.location),
      headline: clean(parsed.data.headline),
      bio: clean(parsed.data.bio),
    },
  });

  revalidatePath("/candidate/profile");
  return { success: true };
}