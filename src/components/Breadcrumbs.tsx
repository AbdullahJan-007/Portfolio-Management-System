"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SEGMENTS: Record<string, string> = {
  dashboard: "Overview",
  profile: "Profile",
  skills: "Skills",
  projects: "Projects",
  categories: "Categories",
  preview: "Preview",
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  if (parts.length <= 1) return null;

  const crumbs = parts.map((part, index) => {
    const href = `/${parts.slice(0, index + 1).join("/")}`;
    const label = SEGMENTS[part] ?? part;
    const isLast = index === parts.length - 1;
    return { href, label, isLast };
  });

  return (
    <nav aria-label="Breadcrumb" className="mb-4 hidden sm:block">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
        <li>
          <Link href="/dashboard" className="hover:text-brand-600">
            Dashboard
          </Link>
        </li>
        {crumbs.slice(1).map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            {crumb.isLast ? (
              <span className="font-medium text-slate-700">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-brand-600">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
