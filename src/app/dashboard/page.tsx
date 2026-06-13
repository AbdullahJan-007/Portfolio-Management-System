import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardOverview() {
  const userId = (await getCurrentUserId())!;

  const [profile, skills, projects] = await Promise.all([
    prisma.profile.findUnique({ where: { userId } }),
    prisma.skill.findMany({
      where: { userId },
      select: { category: true },
    }),
    prisma.project.findMany({
      where: { userId },
      select: { category: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const [skillCount, projectCount] = await Promise.all([
    prisma.skill.count({ where: { userId } }),
    prisma.project.count({ where: { userId } }),
  ]);

  const skillCategories = new Set(
    skills.map((s) => s.category).filter(Boolean)
  );
  const projectCategories = new Set(
    projects.map((p) => p.category).filter(Boolean)
  );
  const totalCategories = new Set([...skillCategories, ...projectCategories]);

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
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  })();

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
      label: "Categories",
      value: totalCategories.size,
      sub: "across skills & projects",
      href: "/dashboard/skills",
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
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""}! 👋
        </h2>
        <p className="mt-1 text-slate-500">
          Here&apos;s a snapshot of your portfolio dashboard.
        </p>
      </div>

      {/* Stat cards */}
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

      {/* Profile completion bar */}
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
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-2 rounded-full bg-amber-500 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
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
        </div>
      </div>

      {/* Category breakdown */}
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
