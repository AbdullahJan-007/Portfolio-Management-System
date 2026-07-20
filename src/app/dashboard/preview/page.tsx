"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { IconBox } from "@/components/icons";

type Profile = {
  fullName: string;
  title: string | null;
  avatarUrl: string | null;
  location: string | null;
  bio: string | null;
  contactEmail: string | null;
  phone: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  url: string | null;
  repoUrl: string | null;
  imageUrl: string | null;
  tags: string | null;
};

type Skill = {
  id: string;
  name: string;
  category: string | null;
  level: number;
};

function tagList(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((tag) => tag.trim()).filter(Boolean);
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function PreviewPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [skillFilter, setSkillFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    const [profileRes, projectsRes, skillsRes] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/projects"),
      fetch("/api/skills"),
    ]);
    const profileJson = await profileRes.json();
    const projectsJson = await projectsRes.json();
    const skillsJson = await skillsRes.json();
    setProfile(profileJson.profile ?? null);
    setProjects(projectsJson.projects ?? []);
    setSkills(skillsJson.skills ?? []);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function handleFocus() {
      load();
    }
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [load]);

  useEffect(() => {
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const categories = useMemo(() => {
    const set = new Set(projects.map((project) => project.category?.trim()).filter(Boolean) as string[]);
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  const skillNames = useMemo(() => {
    const set = new Set(skills.map((skill) => skill.name.trim()).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [skills]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = categoryFilter === "All" || project.category?.trim() === categoryFilter;
      const matchesSkill =
        skillFilter === "All" ||
        tagList(project.tags).some((tag) => tag.toLowerCase() === skillFilter.toLowerCase());
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query) ||
        (project.tags ?? "").toLowerCase().includes(query) ||
        (project.category ?? "").toLowerCase().includes(query);
      return matchesCategory && matchesSkill && matchesSearch;
    });
  }, [projects, categoryFilter, skillFilter, search]);

  const activityStats = useMemo(() => {
    const skillsCompleted = skills.filter((skill) => skill.level >= 4).length;
    const projectsWithImage = projects.filter((project) => project.imageUrl).length;
    return {
      totalProjects: projects.length,
      totalSkills: skills.length,
      projectsWithImage,
      strongSkills: skillsCompleted,
    };
  }, [projects, skills]);

  if (loading && !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="card bg-gradient-to-br from-slate-50 via-white to-white p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-5">
            {profile?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-white shadow-md"
              />
            ) : (
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-2xl font-bold text-white ring-4 ring-white shadow-md">
                {getInitials(profile?.fullName ?? "P")}
              </div>
            )}
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">
                Live Portfolio Preview
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                {profile?.fullName ?? "Your name"}
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                {profile?.title ?? "Portfolio preview for your projects, skills and personal story."}
              </p>
              {profile?.location && (
                <p className="mt-1 text-sm text-slate-500">{profile.location}</p>
              )}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">{activityStats.totalProjects}</p>
              <p className="mt-1 text-xs text-slate-500">Projects</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">{activityStats.totalSkills}</p>
              <p className="mt-1 text-xs text-slate-500">Skills</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">{activityStats.projectsWithImage}</p>
              <p className="mt-1 text-xs text-slate-500">With images</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-600">{activityStats.strongSkills}</p>
              <p className="mt-1 text-xs text-slate-500">Advanced skills</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Search &amp; filters</h2>
            <p className="mt-1 text-sm text-slate-500">
              Changes from the dashboard appear here automatically.
              {lastUpdated && (
                <span className="ml-1 text-slate-400">
                  Last synced {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={load}
              className="btn-secondary text-sm"
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh now"}
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Search preview…"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="input"
          >
            {skillNames.map((skill) => (
              <option key={skill} value={skill}>{skill}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-6">
          <div className="card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900">About</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {profile?.bio ?? "Add a personal story in your dashboard profile page to make the preview complete."}
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Contact</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {profile?.contactEmail && <p>Email: {profile.contactEmail}</p>}
                  {profile?.phone && <p>Phone: {profile.phone}</p>}
                  {profile?.website && <p>Website: {profile.website}</p>}
                  {profile?.github && <p>GitHub: {profile.github}</p>}
                  {profile?.linkedin && <p>LinkedIn: {profile.linkedin}</p>}
                  {profile?.twitter && <p>Twitter / X: {profile.twitter}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-900">Skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length === 0 ? (
                <p className="text-sm text-slate-500">No skills yet.</p>
              ) : (
                skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    {skill.name}
                    {skill.category && (
                      <span className="ml-1 text-slate-400">· {skill.category}</span>
                    )}
                  </span>
                ))
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-900">Live summary</h3>
            <p className="mt-3 text-sm text-slate-500">
              This preview auto-refreshes when you return to this tab and every 30 seconds.
            </p>
            <dl className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <dt>Total projects</dt>
                <dd className="font-semibold text-slate-900">{activityStats.totalProjects}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total skills</dt>
                <dd className="font-semibold text-slate-900">{activityStats.totalSkills}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Projects with images</dt>
                <dd className="font-semibold text-slate-900">{activityStats.projectsWithImage}</dd>
              </div>
            </dl>
          </div>

          <div className="card p-6">
            <h3 className="text-base font-semibold text-slate-900">Active filters</h3>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Category: <span className="font-medium text-slate-900">{categoryFilter}</span></p>
              <p>Skill: <span className="font-medium text-slate-900">{skillFilter}</span></p>
              <p>Search: <span className="font-medium text-slate-900">{search || "All projects"}</span></p>
            </div>
          </div>
        </aside>
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredProjects.length} of {projects.length} projects shown.
            </p>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No portfolio projects match the current filters.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                {project.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.imageUrl} alt={project.title} className="h-44 w-full object-cover rounded-t-3xl" />
                ) : (
                  <div className="grid h-44 w-full place-items-center rounded-t-3xl bg-brand-50">
                    <IconBox name="folder-code" size="xl" variant="soft" />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-slate-900">{project.title}</h3>
                    {project.category && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {project.category}
                      </span>
                    )}
                  </div>
                  {project.description && <p className="mt-3 text-sm leading-6 text-slate-600">{project.description}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tagList(project.tags).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    {project.url && (
                      <a href={project.url} target="_blank" rel="noreferrer" className="font-medium text-brand-600 hover:text-brand-700">
                        Visit
                      </a>
                    )}
                    {project.repoUrl && (
                      <a href={project.repoUrl} target="_blank" rel="noreferrer" className="font-medium text-slate-500 hover:text-slate-900">
                        Source
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
