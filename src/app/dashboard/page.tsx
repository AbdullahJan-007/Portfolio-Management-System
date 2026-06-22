import Link from "next/link";
import { getCurrentUser, getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

type Activity = {
  id: string;
  type: "project" | "skill" | "profile";
  action: "created" | "updated";
  label: string;
  href: string;
  timestamp: Date;
};

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function formatMemberSince(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default async function DashboardOverview() {
  const userId = (await getCurrentUserId())!;

  const [user, profile, skills, recentProjects, recentSkills, categoryCount] =
    await Promise.all([
      getCurrentUser(),
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

  const completeness = (() => {
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
  })();

  const activities: Activity[] = [];

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
      timestamp: project.updatedAt,
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
      timestamp: skill.updatedAt,
    });
  }

  if (profile?.updatedAt) {
    activities.push({
      id: "profile",
      type: "profile",
      action: "updated",
      label: profile.fullName || "Profile",
      href: "/dashboard/profile",
      timestamp: profile.updatedAt,
    });
  }

  activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  const recentActivities = activities.slice(0, 8);

  const activityIcons: Record<Activity["type"], string> = {
    project: "🚀",
    skill: "⚡",
    profile: "👤",
  };

  const statCards = [
    {
      label: "Total Skills",
      value: skillCount,
      sub: `${skillCategories.size} ${skillCategories.size === 1 ? "category" : "categories"}`,
      href: "/dashboard/skills",
      color: "from-blue-500 to-indigo-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: "Total Projects",
      value: projectCount,
      sub: `${projectCategories.size} ${projectCategories.size === 1 ? "category" : "categories"}`,
      href: "/dashboard/projects",
      color: "from-violet-500 to-purple-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      label: "Managed Categories",
      value: categoryCount,
      sub: "project categories",
      href: "/dashboard/categories",
      color: "from-emerald-500 to-teal-600",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      label: "Profile Complete",
      value: `${completeness}%`,
      sub: completeness < 100 ? "Keep filling in your info" : "Looking great!",
      href: "/dashboard/profile",
      color: "from-amber-500 to-orange-500",
      icon: (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}! 👋
        </h2>
        <p className="mt-1 text-slate-500">
          Here&apos;s a snapshot of your portfolio CMS dashboard.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity group-hover:opacity-5`}
            />
            <div className="flex items-start justify-between">
              <div
                className={`rounded-xl bg-gradient-to-br ${card.color} p-2.5 text-white shadow-sm`}
              >
                {card.icon}
              </div>
              <svg
                className="h-4 w-4 text-slate-300 transition-colors group-hover:text-brand-500"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{card.label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Recent Activities</h3>
            <Link
              href="/dashboard/preview"
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              View preview →
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No activity yet. Start by adding skills or projects.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivities.map((activity) => (
                <li key={activity.id}>
                  <Link
                    href={activity.href}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50"
                  >
                    <span className="text-lg">{activityIcons[activity.type]}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {activity.action === "created" ? "Added" : "Updated"}{" "}
                        {activity.type === "project"
                          ? "project"
                          : activity.type === "skill"
                            ? "skill"
                            : "profile"}
                        : {activity.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Statistics */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">User Statistics</h3>
          <dl className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Account email</dt>
              <dd className="text-sm font-medium text-slate-900">{user?.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Member since</dt>
              <dd className="text-sm font-medium text-slate-900">
                {user ? formatMemberSince(user.createdAt) : "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Total portfolio items</dt>
              <dd className="text-sm font-medium text-slate-900">
                {skillCount + projectCount}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Profile completeness</dt>
              <dd className="text-sm font-medium text-slate-900">{completeness}%</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Managed categories</dt>
              <dd className="text-sm font-medium text-slate-900">{categoryCount}</dd>
            </div>
          </dl>
          {completeness < 100 && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${completeness}%` }}
                />
              </div>
              <Link
                href="/dashboard/profile"
                className="mt-2 inline-block text-xs font-medium text-brand-600 hover:text-brand-700"
              >
                Complete your profile →
              </Link>
            </div>
          )}
        </div>
      </div>

      {completeness < 100 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Your profile is {completeness}% complete
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Add more info to make your portfolio stand out.
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 transition-colors"
            >
              Complete profile
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
              👤
            </span>
            Edit profile
          </Link>
          <Link
            href="/dashboard/skills"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
              ⚡
            </span>
            Manage skills
          </Link>
          <Link
            href="/dashboard/projects"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
              🚀
            </span>
            Add a project
          </Link>
          <Link
            href="/dashboard/categories"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
              🏷️
            </span>
            Categories
          </Link>
          <Link
            href="/dashboard/preview"
            className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-lg">
              👁️
            </span>
            Live preview
          </Link>
        </div>
      </div>

      {(skillCategories.size > 0 || projectCategories.size > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {skillCategories.size > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Skill Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[...skillCategories].map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
          {projectCategories.size > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Project Categories</h3>
              <div className="flex flex-wrap gap-2">
                {[...projectCategories].map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
