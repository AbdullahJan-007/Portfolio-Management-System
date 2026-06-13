import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error } from "@/lib/api";
import { isNonEmptyString, asStringOrNull, clampLevel } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const skills = await prisma.skill.findMany({
    where: { userId },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return ok({ skills });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const name = String(body.name ?? "").trim();
    if (!isNonEmptyString(name)) return error("Skill name is required");

    const skill = await prisma.skill.create({
      data: {
        userId,
        name,
        category: asStringOrNull(body.category),
        level: clampLevel(body.level),
      },
    });

    return ok({ skill }, 201);
  } catch (err) {
    console.error("skill create error", err);
    return serverError();
  }
}
