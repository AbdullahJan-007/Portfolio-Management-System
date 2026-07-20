import type { Prisma } from "@prisma/client";

export type ProjectFilterParams = {
  search?: string | null;
  category?: string | null;
  skill?: string | null;
};

export function buildProjectWhere(
  userId: string,
  filters: ProjectFilterParams
): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = { userId };

  const category = filters.category?.trim();
  if (category && category !== "All") {
    where.category = category;
  }

  const search = filters.search?.trim();
  const skill = filters.skill?.trim();

  if (search || (skill && skill !== "All")) {
    const and: Prisma.ProjectWhereInput[] = [];

    if (search) {
      and.push({
        OR: [
          { title: { contains: search } },
          { description: { contains: search } },
          { tags: { contains: search } },
          { category: { contains: search } },
        ],
      });
    }

    if (skill && skill !== "All") {
      and.push({
        OR: [
          { tags: { contains: skill } },
          { tags: { contains: skill.toLowerCase() } },
          { tags: { contains: skill.toUpperCase() } },
        ],
      });
    }

    if (and.length > 0) {
      where.AND = and;
    }
  }

  return where;
}

export function buildSkillWhere(
  userId: string,
  filters: { search?: string | null; category?: string | null }
): Prisma.SkillWhereInput {
  const where: Prisma.SkillWhereInput = { userId };

  const category = filters.category?.trim();
  if (category && category !== "All") {
    where.category =
      category === "Uncategorized" ? null : category;
  }

  const search = filters.search?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { category: { contains: search } },
    ];
  }

  return where;
}
