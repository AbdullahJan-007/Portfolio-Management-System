"use client";

import { useEffect, useMemo, useState } from "react";

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

type FormState = {
  title: string;
  description: string;
  category: string;
  url: string;
  repoUrl: string;
  imageUrl: string;
  tags: string;
};

const blank: FormState = {
  title: "",
  description: "",
  category: "",
  url: "",
  repoUrl: "",
  imageUrl: "",
  tags: "",
};

const PROJECT_CATEGORIES = [
  "Web App",
  "Mobile App",
  "Backend / API",
  "Desktop App",
  "Data / ML",
  "DevOps / Tools",
  "Design",
  "Open Source",
  "Other",
];

function tagList(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [submitting, setSubmitting] = useState(false);

  // Search & filter state
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.projects ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(blank);
    setError(null);
    setOpen(true);
  }

  function openEdit(p: Project) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? "",
      category: p.category ?? "",
      url: p.url ?? "",
      repoUrl: p.repoUrl ?? "",
      imageUrl: p.imageUrl ?? "",
      tags: p.tags ?? "",
    });
    setError(null);
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const url = editingId ? `/api/projects/${editingId}` : "/api/projects";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save project");
        return;
      }
      setOpen(false);
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    await load();
  }

  // Derived category list
  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category?.trim()).filter(Boolean) as string[]);
    return ["All", ...Array.from(cats).sort()];
  }, [projects]);

  // Filtered + searched projects
  const filtered = useMemo(() => {
    let list = projects;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category?.trim() === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q) ||
          (p.tags ?? "").toLowerCase().includes(q) ||
          (p.category ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, activeCategory, search]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="mt-1 text-slate-500">
            Showcase your work. Add, update or remove projects.
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add project
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">{projects.length}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Total Projects</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">
            {new Set(projects.map((p) => p.category?.trim()).filter(Boolean)).size}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Categories</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">
            {new Set(
              projects.flatMap((p) => tagList(p.tags))
            ).size}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Unique Tags</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          className="input pl-10"
          placeholder="Search projects by title, description or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter pills */}
      {projects.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-70">
                  ({projects.filter((p) => p.category?.trim() === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      {(search || activeCategory !== "All") && !loading && (
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{" "}
          {projects.length} projects
          {search && (
            <>
              {" "}matching &ldquo;<span className="font-semibold text-slate-700">{search}</span>&rdquo;
            </>
          )}
        </p>
      )}

      {/* Project grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-4xl">🚀</p>
          <p className="mt-3 text-base font-medium text-slate-700">No projects yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Click &ldquo;Add project&rdquo; to showcase your first project.
          </p>
          <button onClick={openCreate} className="btn-primary mt-4 text-sm">
            + Add project
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-3xl">🔍</p>
          <p className="mt-3 text-sm font-medium text-slate-700">No projects match your search</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("All"); }}
            className="mt-3 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <div key={p.id} className="card flex flex-col overflow-hidden transition-shadow hover:shadow-md">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="grid h-44 w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100 text-5xl">
                  🚀
                </div>
              )}
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{p.title}</h3>
                  {p.category && (
                    <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                      {p.category}
                    </span>
                  )}
                </div>

                {p.description && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                    {p.description}
                  </p>
                )}

                {tagList(p.tags).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tagList(p.tags).map((t) => (
                      <span
                        key={t}
                        className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-brand-600 hover:text-brand-700"
                    >
                      Live demo ↗
                    </a>
                  )}
                  {p.repoUrl && (
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-500 hover:text-slate-900"
                    >
                      Source ↗
                    </a>
                  )}
                </div>

                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    onClick={() => openEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => remove(p.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-900/60 p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="card max-h-[92vh] w-full max-w-lg overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                {editingId ? "Edit project" : "Add project"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 p-6">
              <div>
                <label className="label">Title *</label>
                <input
                  className="input"
                  placeholder="My awesome project"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">— Select a category —</option>
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  className="input min-h-24 resize-y"
                  rows={3}
                  placeholder="What does this project do?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Live URL</label>
                  <input
                    className="input"
                    placeholder="https://…"
                    value={form.url}
                    onChange={(e) => setForm({ ...form, url: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Repository URL</label>
                  <input
                    className="input"
                    placeholder="https://github.com/…"
                    value={form.repoUrl}
                    onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Image URL</label>
                <input
                  className="input"
                  placeholder="https://…"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Tags (comma separated)</label>
                <input
                  className="input"
                  placeholder="Next.js, Prisma, Tailwind"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button type="button" className="btn-secondary" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : editingId ? "Update project" : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
