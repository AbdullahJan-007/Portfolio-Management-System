import { prisma } from "@/lib/db";

export type ActivityItem = {
  id: string;
  type: "project" | "skill" | "profile";
  action: "created" | "updated";
  label: string;
  href: string;
  timestamp: string;
};

export type NotificationItem = {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  href: string;
  timestamp: string;
};

export type DashboardStats = {
  skillCount: number;
  projectCount: number;
  categoryCount: number;
  completeness: number;
  skillCategoryCount: number;
  projectCategoryCount: number;
  totalItems: number;
  user: {
    email: string;
    createdAt: string;
  };
  profile: {
    fullName: string | null;
  } | null;
};

function calcCompleteness(profile: {
  fullName: string;
  title: string | null;
  bio: string | null;
  location: string | null;
  contactEmail: string | null;
  phone: string | null;
  website: string | null;
  avatarUrl: string | null;
} | null): number {
  if (!profile) return 0;
  const fields = [
    profile.fullName,
    profile.title,
    profile.bio,
    profile.location,
    profile.contactEmail,
    profile.phone,
    profile.website,
    profile.avatarUrl,
  ];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

export async function getDashboardData(userId: string) {
  const [user, profile, skills, recentProjects, recentSkills, categoryCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, createdAt: true },
      }),
      prisma.profile.findUnique({ where: { userId } }),
      prisma.skill.findMany({
        where: { userId },
        select: { category: true },
      }),
      prisma.project.findMany({
        where: { userId },
        select: {
          id: true,
          title: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.skill.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          category: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take: 10,
      }),
      prisma.projectCategory.count({ where: { userId } }),
    ]);

  const [skillCount, projectCount] = await Promise.all([
    prisma.skill.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
  ]);

  const skillCategories = new Set(
    skills.map((s) => s.category).filter(Boolean)
  );
  const projectCategories = new Set(
    recentProjects.map((p) => p.category).filter(Boolean)
  );

  const completeness = calcCompleteness(profile);

  const activities: ActivityItem[] = [];

  for (const project of recentProjects) {
    const action =
      project.updatedAt.getTime() - project.createdAt.getTime() > 1000
        ? "updated"
        : "created";
    activities.push({
      id: `project-${project.id}`,
      type: "project",
      action,
      label: project.title,
      href: "/dashboard/projects",
      timestamp: project.updatedAt.toISOString(),
    });
  }

  for (const skill of recentSkills) {
    const action =
      skill.updatedAt.getTime() - skill.createdAt.getTime() > 1000
        ? "updated"
        : "created";
    activities.push({
      id: `skill-${skill.id}`,
      type: "skill",
      action,
      label: skill.name,
      href: "/dashboard/skills",
      timestamp: skill.updatedAt.toISOString(),
    });
  }

  if (profile?.updatedAt) {
    activities.push({
      id: "profile",
      type: "profile",
      action: "updated",
      label: profile.fullName || "Profile",
      href: "/dashboard/profile",
      timestamp: profile.updatedAt.toISOString(),
    });
  }

  activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const notifications = buildNotifications({
    completeness,
    skillCount,
    projectCount,
    categoryCount,
    profile,
    userCreatedAt: user?.createdAt ?? new Date(),
  });

  const stats: DashboardStats = {
    skillCount,
    projectCount,
    categoryCount,
    completeness,
    skillCategoryCount: skillCategories.size,
    projectCategoryCount: projectCategories.size,
    totalItems: skillCount + projectCount,
    user: {
      email: user?.email ?? "",
      createdAt: (user?.createdAt ?? new Date()).toISOString(),
    },
    profile: profile ? { fullName: profile.fullName } : null,
  };

  return {
    stats,
    activities: activities.slice(0, 8),
    notifications,
    skillCategories: [...skillCategories],
    projectCategories: [...projectCategories],
  };
}

function buildNotifications(input: {
  completeness: number;
  skillCount: number;
  projectCount: number;
  categoryCount: number;
  profile: { fullName: string } | null;
  userCreatedAt: Date;
}): NotificationItem[] {
  const notifications: NotificationItem[] = [];
  const now = new Date().toISOString();

  const daysSinceSignup = Math.floor(
    (Date.now() - input.userCreatedAt.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceSignup <= 7) {
    notifications.push({
      id: "welcome",
      type: "info",
      title: "Welcome to Portfolio Manager",
      message: "Start by completing your profile and adding your first project.",
      href: "/dashboard/profile",
      timestamp: now,
    });
  }

  if (input.completeness < 100) {
    notifications.push({
      id: "profile-incomplete",
      type: "warning",
      title: "Profile incomplete",
      message: `Your profile is ${input.completeness}% complete. Add more details to stand out.`,
      href: "/dashboard/profile",
      timestamp: now,
    });
  }

  if (input.skillCount === 0) {
    notifications.push({
      id: "no-skills",
      type: "warning",
      title: "No skills added",
      message: "Showcase your expertise by adding your skills.",
      href: "/dashboard/skills",
      timestamp: now,
    });
  }

  if (input.projectCount === 0) {
    notifications.push({
      id: "no-projects",
      type: "warning",
      title: "No projects yet",
      message: "Add your first project to build your portfolio.",
      href: "/dashboard/projects",
      timestamp: now,
    });
  }

  if (input.categoryCount === 0 && input.projectCount > 0) {
    notifications.push({
      id: "no-categories",
      type: "info",
      title: "Organize with categories",
      message: "Create project categories to keep your portfolio organized.",
      href: "/dashboard/categories",
      timestamp: now,
    });
  }

  if (
    input.completeness === 100 &&
    input.skillCount > 0 &&
    input.projectCount > 0
  ) {
    notifications.push({
      id: "portfolio-ready",
      type: "success",
      title: "Portfolio looking great!",
      message: "Your portfolio is ready. Preview it and share with others.",
      href: "/dashboard/preview",
      timestamp: now,
    });
  }

  return notifications;
}
