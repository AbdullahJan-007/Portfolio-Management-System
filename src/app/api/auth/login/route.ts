import { prisma } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";
import { ok, error, serverError } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!isValidEmail(email) || password.length === 0) {
      return error("Invalid email or password", 401);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return error("Invalid email or password", 401);

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) return error("Invalid email or password", 401);

    await setSessionCookie(user.id);
    return ok({
      user: { id: user.id, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    console.error("login error", err);
    if (err instanceof Error && /(AUTH_SECRET|Missing required environment|DATABASE_URL)/i.test(err.message)) {
      return serverError("Server configuration error. Please contact the administrator.");
    }
    return serverError();
  }
}
