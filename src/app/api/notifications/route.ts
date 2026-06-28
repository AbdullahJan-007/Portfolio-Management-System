import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const { notifications } = await getDashboardData(userId);
    return ok({ notifications });
  } catch (err) {
    console.error("notifications error", err);
    return serverError();
  }
}
