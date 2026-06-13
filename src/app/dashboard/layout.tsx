import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    select: { fullName: true, avatarUrl: true },
  });

  return (
    <DashboardShell
      email={user.email}
      name={profile?.fullName}
      avatarUrl={profile?.avatarUrl}
    >
      {children}
    </DashboardShell>
  );
}
