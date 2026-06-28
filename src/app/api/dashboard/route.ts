import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, serverError } from "@/lib/api";
import { getDashboardData } from "@/lib/dashboard";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const data = await getDashboardData(userId);
    return ok(data);
  } catch (err) {
    console.error("dashboard error", err);
    return serverError();
  }
}
