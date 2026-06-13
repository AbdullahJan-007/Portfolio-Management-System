import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/api";
import { isValidEmail, isNonEmptyString } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");
    const fullName = String(body.fullName ?? "").trim();

    if (!isValidEmail(email)) return error("Please provide a valid email address");
    if (password.length < 8)
      return error("Password must be at least 8 characters long");
    if (!isNonEmptyString(fullName)) return error("Full name is required");

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return error("An account with this email already exists", 409);

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            fullName,
            contactEmail: email,
          },
        },
      },
      select: { id: true, email: true, createdAt: true },
    });

    await setSessionCookie(user.id);
    return ok({ user }, 201);
  } catch (err) {
    console.error("register error", err);
    return serverError();
  }
}
