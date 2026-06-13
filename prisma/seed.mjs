import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  // Remove any existing demo user so the seed is idempotent.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {
          fullName: "Demo User",
          title: "Full-Stack Developer",
          location: "Remote",
          bio: "I build web applications with Next.js, TypeScript and Prisma.",
          contactEmail: email,
          website: "https://example.com",
          github: "https://github.com/demo",
          linkedin: "https://linkedin.com/in/demo",
        },
      },
      skills: {
        create: [
          { name: "TypeScript", category: "Languages", level: 5 },
          { name: "React", category: "Frontend", level: 5 },
          { name: "Next.js", category: "Frontend", level: 4 },
          { name: "Prisma", category: "Backend", level: 4 },
          { name: "PostgreSQL", category: "Database", level: 3 },
        ],
      },
      projects: {
        create: [
          {
            title: "Portfolio Manager",
            description:
              "A full-stack portfolio management system built with Next.js.",
            url: "https://example.com",
            repoUrl: "https://github.com/demo/portfolio-manager",
            tags: "Next.js, Prisma, Tailwind, SQLite",
          },
        ],
      },
    },
  });

  console.log(`Seeded demo user: ${user.email} / password123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
