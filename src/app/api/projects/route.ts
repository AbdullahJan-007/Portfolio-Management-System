import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error } from "@/lib/api";
import { isNonEmptyString, asStringOrNull } from "@/lib/validation";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const projects = await prisma.project.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return ok({ projects });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const title = String(body.title ?? "").trim();
    if (!isNonEmptyString(title)) return error("Project title is required");

    const project = await prisma.project.create({
      data: {
        userId,
        title,
        description: asStringOrNull(body.description),
        category: asStringOrNull(body.category),
        url: asStringOrNull(body.url),
        repoUrl: asStringOrNull(body.repoUrl),
        imageUrl: asStringOrNull(body.imageUrl),
        tags: asStringOrNull(body.tags),
      },
    });

    return ok({ project }, 201);
  } catch (err) {
    console.error("project create error", err);
    return serverError();
  }
}
