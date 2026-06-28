"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ActivityIcon,
  Icon,
  IconBox,
  NotificationIcon,
} from "@/components/icons";

type Activity = {
  id: string;
  type: "project" | "skill" | "profile";
  action: "created" | "updated";
  label: string;
  href: string;
  timestamp: string;
};

type Notification = {
  id: string;
  type: "info" | "warning" | "success";
  title: string;
  message: string;
  href: string;
  timestamp: string;
};

type Stats = {
  skillCount: number;
  projectCount: number;
  categoryCount: number;
  completeness: number;
  skillCategoryCount: number;
  projectCategoryCount: number;
  totalItems: number;
  user: { email: string; createdAt: string };
  profile: { fullName: string | null } | null;
};

type DashboardData = {
  stats: Stats;
  activities: Activity[];
  notifications: Notification[];
  skillCategories: string[];
  projectCategories: string[];
};

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
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

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

const notificationStyles: Record<Notification["type"], string> = {
  info: "border-blue-200 bg-blue-50",
  warning: "border-amber-200 bg-amber-50",
  success: "border-green-200 bg-green-50",
};

export default function DashboardOverview() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then(setData)
      .catch(() => setError("Could not load dashboard data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-700">{error ?? "Something went wrong"}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary mt-4 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  const { stats, activities, notifications, skillCategories, projectCategories } =
    data;
  const firstName = stats.profile?.fullName?.split(" ")[0];

  const statCards = [
    {
      label: "Total Skills",
      value: stats.skillCount,
      sub: `${stats.skillCategoryCount} ${stats.skillCategoryCount === 1 ? "category" : "categories"}`,
      href: "/dashboard/skills",
      color: "from-blue-500 to-indigo-600",
      icon: "skills" as const,
    },
    {
      label: "Total Projects",
      value: stats.projectCount,
      sub: `${stats.projectCategoryCount} ${stats.projectCategoryCount === 1 ? "category" : "categories"}`,
      href: "/dashboard/projects",
      color: "from-violet-500 to-purple-600",
      icon: "projects" as const,
    },
    {
      label: "Managed Categories",
      value: stats.categoryCount,
      sub: "project categories",
      href: "/dashboard/categories",
      color: "from-emerald-500 to-teal-600",
      icon: "categories" as const,
    },
    {
      label: "Profile Complete",
      value: `${stats.completeness}%`,
      sub: stats.completeness < 100 ? "Keep filling in your info" : "Looking great!",
      href: "/dashboard/profile",
      color: "from-amber-500 to-orange-500",
      icon: "profile" as const,
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Welcome back{firstName ? `, ${firstName}` : ""}
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
                <Icon name={card.icon} className="h-6 w-6" />
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

      {notifications.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Notifications</h3>
          <ul className="mt-4 space-y-2">
            {notifications.slice(0, 4).map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  className={`flex items-start gap-3 rounded-xl border p-4 transition-colors hover:opacity-90 ${notificationStyles[n.type]}`}
                >
                  <NotificationIcon type={n.type} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-xs text-slate-600">{n.message}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
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
          {activities.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No activity yet. Start by adding skills or projects.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {activities.map((activity) => (
                <li key={activity.id}>
                  <Link
                    href={activity.href}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50"
                  >
                    <ActivityIcon type={activity.type} />
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

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">User Statistics</h3>
          <dl className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Account email</dt>
              <dd className="text-sm font-medium text-slate-900">{stats.user.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Member since</dt>
              <dd className="text-sm font-medium text-slate-900">
                {formatMemberSince(stats.user.createdAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Total portfolio items</dt>
              <dd className="text-sm font-medium text-slate-900">{stats.totalItems}</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Profile completeness</dt>
              <dd className="text-sm font-medium text-slate-900">{stats.completeness}%</dd>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <dt className="text-sm text-slate-500">Managed categories</dt>
              <dd className="text-sm font-medium text-slate-900">{stats.categoryCount}</dd>
            </div>
          </dl>
          {stats.completeness < 100 && (
            <div className="mt-4">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-brand-500 transition-all"
                  style={{ width: `${stats.completeness}%` }}
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

      {stats.completeness < 100 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Your profile is {stats.completeness}% complete
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Add more info to make your portfolio stand out.
              </p>
            </div>
            <Link
              href="/dashboard/profile"
              className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
            >
              Complete profile
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Quick actions</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            { href: "/dashboard/profile", icon: "profile" as const, label: "Edit profile", variant: "emerald" as const },
            { href: "/dashboard/skills", icon: "skills" as const, label: "Manage skills", variant: "blue" as const },
            { href: "/dashboard/projects", icon: "projects" as const, label: "Add a project", variant: "violet" as const },
            { href: "/dashboard/categories", icon: "categories" as const, label: "Categories", variant: "amber" as const },
            { href: "/dashboard/preview", icon: "preview" as const, label: "Live preview", variant: "brand" as const },
          ].map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-sm font-medium text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <IconBox name={action.icon} size="md" variant={action.variant} />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {(skillCategories.length > 0 || projectCategories.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {skillCategories.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Skill Categories</h3>
              <div className="flex flex-wrap gap-2">
                {skillCategories.map((cat) => (
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
          {projectCategories.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900">Project Categories</h3>
              <div className="flex flex-wrap gap-2">
                {projectCategories.map((cat) => (
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
