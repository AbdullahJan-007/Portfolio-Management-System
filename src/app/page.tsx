import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { BrandLogo, IconBox } from "@/components/icons";

export default async function HomePage() {
  const user = await getCurrentUser();

  const features = [
    {
      title: "Profile & About",
      desc: "Maintain your personal info, headline, bio and contact details in one place.",
      icon: "profile" as const,
      variant: "blue" as const,
    },
    {
      title: "Skills",
      desc: "Add, update and remove skills with proficiency levels and categories.",
      icon: "skills" as const,
      variant: "amber" as const,
    },
    {
      title: "Projects",
      desc: "Showcase your work with live demos, source links, tags and images.",
      icon: "projects" as const,
      variant: "violet" as const,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-brand-50/40 to-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/">
          <BrandLogo className="text-lg" />
        </Link>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link href="/dashboard" className="btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </nav>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-1.5 text-sm font-medium text-brand-700 shadow-sm">
          <IconBox name="terminal" size="sm" variant="soft" />
          Build & manage your developer portfolio
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Your portfolio,{" "}
          <span className="text-brand-600">fully under control</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          A complete portfolio management system. Create an account and manage
          your personal information, skills and projects through a clean,
          interactive dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href={user ? "/dashboard" : "/register"}
            className="btn-primary px-6 py-3 text-base"
          >
            {user ? "Open Dashboard" : "Create your account"}
          </Link>
          <Link
            href={user ? "/dashboard/projects" : "/login"}
            className="btn-secondary px-6 py-3 text-base"
          >
            {user ? "Manage projects" : "I already have an account"}
          </Link>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 text-left animate-fade-in">
              <IconBox name={f.icon} size="lg" variant={f.variant} className="mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        Portfolio Management System — built with Next.js, Prisma & SQLite.
      </footer>
    </main>
  );
}
