import { getCurrentUser } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    return ok({ user });
  } catch (err) {
    console.error("me error", err);
    if (err instanceof Error && /(AUTH_SECRET|Missing required environment|DATABASE_URL)/i.test(err.message)) {
      return serverError("Server configuration error. Please contact the administrator.");
    }
    return serverError();
  }
}
