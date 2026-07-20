import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error, notFound } from "@/lib/api";
import { isNonEmptyString, slugifyString } from "@/lib/validation";
import { Prisma } from "@prisma/client";

type Params = { params: { id: string } };

export async function PUT(request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const existing = await prisma.projectCategory.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.userId !== userId) return notFound("Category not found");

    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const name = String(body.name ?? "").trim();
    if (!isNonEmptyString(name)) return error("Category name is required");

    const category = await prisma.projectCategory.update({
      where: { id: params.id },
      data: { name, slug: slugifyString(name) },
    });

    return ok({ category });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return error("A category with this name already exists", 409);
    }
    console.error("category update error", err);
    return serverError();
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const existing = await prisma.projectCategory.findUnique({
      where: { id: params.id },
    });
    if (!existing || existing.userId !== userId) return notFound("Category not found");

    await prisma.project.updateMany({
      where: { userId, category: existing.name },
      data: { category: null },
    });

    await prisma.projectCategory.delete({ where: { id: params.id } });
    return ok({ success: true });
  } catch (err) {
    console.error("category delete error", err);
    return serverError();
  }
}
