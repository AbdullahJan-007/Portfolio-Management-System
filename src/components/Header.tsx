"use client";

import { usePathname } from "next/navigation";
import NotificationsPanel from "./NotificationsPanel";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Overview", subtitle: "Welcome to your dashboard" },
  "/dashboard/profile": { title: "Profile", subtitle: "Manage your personal information" },
  "/dashboard/skills": { title: "Skills", subtitle: "Add and manage your skills" },
  "/dashboard/projects": { title: "Projects", subtitle: "Showcase your work" },
  "/dashboard/categories": { title: "Categories", subtitle: "Manage project categories" },
  "/dashboard/preview": { title: "Portfolio Preview", subtitle: "Live preview of your portfolio" },
};

function getInitials(name?: string | null, email?: string): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return (email?.[0] ?? "U").toUpperCase();
}

interface HeaderProps {
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  onMenuClick: () => void;
}

export default function Header({ email, name, avatarUrl, onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const page = PAGE_TITLES[pathname] ?? { title: "Dashboard", subtitle: "" };
  const initials = getInitials(name, email);
  const displayName = name || email;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden rounded-md p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none"
          aria-label="Open sidebar"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="hidden truncate text-xs text-slate-500 sm:block">
              {page.subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: notifications + user info */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <NotificationsPanel />
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900 truncate max-w-[160px]">
            {displayName}
          </p>
          {name && (
            <p className="text-xs text-slate-500 truncate max-w-[160px]">{email}</p>
          )}
        </div>

        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={displayName}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-100"
          />
        ) : (
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white ring-2 ring-brand-100">
            {initials}
          </div>
        )}
      </div>
    </header>
  );
}
