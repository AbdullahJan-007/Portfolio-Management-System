import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError, error } from "@/lib/api";
import { isNonEmptyString, slugifyString } from "@/lib/validation";
import { Prisma } from "@prisma/client";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  const categories = await prisma.projectCategory.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });

  return ok({ categories });
}

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const name = String(body.name ?? "").trim();
    if (!isNonEmptyString(name)) return error("Category name is required");

    const slug = slugifyString(name);
    const category = await prisma.projectCategory.create({
      data: { userId, name, slug },
    });

    return ok({ category }, 201);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return error("A category with this name already exists", 409);
    }
    console.error("category create error", err);
    return serverError();
  }
}
