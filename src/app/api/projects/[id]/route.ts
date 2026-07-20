import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error, notFound } from "@/lib/api";
import { isNonEmptyString, asStringOrNull } from "@/lib/validation";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const existing = await prisma.project.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.userId !== userId)
      return notFound("Project not found");

    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const title = String(body.title ?? "").trim();
    if (!isNonEmptyString(title)) return error("Project title is required");

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        title,
        description: asStringOrNull(body.description),
        category: asStringOrNull(body.category),
        url: asStringOrNull(body.url),
        repoUrl: asStringOrNull(body.repoUrl),
        imageUrl: asStringOrNull(body.imageUrl),
        tags: asStringOrNull(body.tags),
      },
    });

    return ok({ project });
  } catch (err) {
    console.error("project update error", err);
    return serverError();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const existing = await prisma.project.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.userId !== userId)
      return notFound("Project not found");

    await prisma.project.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    console.error("project delete error", err);
    return serverError();
  }
}
