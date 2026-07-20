import { prisma } from "@/lib/db";
import { getCurrentUserId, hashPassword, verifyPassword } from "@/lib/auth";
import { ok, unauthorized, error, serverError } from "@/lib/api";
import { isNonEmptyString } from "@/lib/validation";

export async function POST(request: Request) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const body = await request.json().catch(() => null);
    if (!body) return error("Invalid request body");

    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");

    if (!isNonEmptyString(currentPassword)) {
      return error("Current password is required");
    }
    if (!isNonEmptyString(newPassword)) {
      return error("New password is required");
    }
    if (newPassword.length < 8) {
      return error("New password must be at least 8 characters");
    }
    if (currentPassword === newPassword) {
      return error("New password must be different from current password");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return unauthorized();

    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) return error("Current password is incorrect");

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return ok({ message: "Password changed successfully" });
  } catch (err) {
    console.error("change password error", err);
    if (err instanceof Error && /(AUTH_SECRET|Missing required environment|DATABASE_URL)/i.test(err.message)) {
      return serverError("Server configuration error. Please contact the administrator.");
    }
    return serverError();
  }
}
