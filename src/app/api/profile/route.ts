import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error } from "@/lib/api";
import { asStringOrNull, isNonEmptyString } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const profile = await prisma.profile.findUnique({ where: { userId } });
  return ok({ profile });
}

export async function PUT(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const fullName = String(body.fullName ?? "").trim();
    if (!isNonEmptyString(fullName)) return error("Full name is required");

    const data = {
      fullName,
      title: asStringOrNull(body.title),
      avatarUrl: asStringOrNull(body.avatarUrl),
      location: asStringOrNull(body.location),
      bio: asStringOrNull(body.bio),
      contactEmail: asStringOrNull(body.contactEmail),
      phone: asStringOrNull(body.phone),
      website: asStringOrNull(body.website),
      github: asStringOrNull(body.github),
      linkedin: asStringOrNull(body.linkedin),
      twitter: asStringOrNull(body.twitter),
    };

    const profile = await prisma.profile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });

    return ok({ profile });
  } catch (err) {
    console.error("profile update error", err);
    return serverError();
  }
}
