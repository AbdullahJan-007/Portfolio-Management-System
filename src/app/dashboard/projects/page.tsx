"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Skill = {
  id: string;
  name: string;
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

function tagList(tags: string | null): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSkill, setActiveSkill] = useState("All");

  async function load() {
    setLoading(true);
    const [projectsRes, categoriesRes, skillsRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/categories"),
      fetch("/api/skills"),
    ]);
    const projectsData = await projectsRes.json();
    const categoriesData = await categoriesRes.json();
    const skillsData = await skillsRes.json();
    setProjects(projectsData.projects ?? []);
    setCategories(categoriesData.categories ?? []);
    setSkills(skillsData.skills ?? []);
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Image upload failed.");
        return;
      }
      setForm((f) => ({ ...f, imageUrl: data.url }));
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

  const categoryOptions = useMemo(() => {
    const fromProjects = new Set(
      projects.map((p) => p.category?.trim()).filter(Boolean) as string[]
    );
    const fromManaged = categories.map((c) => c.name);
    return ["All", ...Array.from(new Set([...fromManaged, ...fromProjects])).sort()];
  }, [projects, categories]);

  const skillOptions = useMemo(() => {
    const fromSkills = skills.map((s) => s.name.trim()).filter(Boolean);
    const fromTags = projects.flatMap((p) => tagList(p.tags));
    return ["All", ...Array.from(new Set([...fromSkills, ...fromTags])).sort()];
  }, [projects, skills]);

  const filtered = useMemo(() => {
    let list = projects;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category?.trim() === activeCategory);
    }
    if (activeSkill !== "All") {
      list = list.filter((p) =>
        tagList(p.tags).some(
          (tag) => tag.toLowerCase() === activeSkill.toLowerCase()
        )
      );
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
  }, [projects, activeCategory, activeSkill, search]);

  const formCategoryOptions = useMemo(() => {
    const names = categories.map((c) => c.name);
    if (form.category && !names.includes(form.category)) {
      return [...names, form.category];
    }
    return names;
  }, [categories, form.category]);

  return (
    <div className="animate-fade-in space-y-6">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            {new Set(projects.flatMap((p) => tagList(p.tags))).size}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Unique Tags</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">
            {projects.filter((p) => p.imageUrl).length}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">With Images</p>
        </div>
      </div>

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

      {projects.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Category filter
            </p>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((cat) => (
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
          </div>

          {skillOptions.length > 1 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Skill filter
              </p>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => setActiveSkill(skill)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeSkill === skill
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(search || activeCategory !== "All" || activeSkill !== "All") && !loading && (
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
          <p className="mt-3 text-sm font-medium text-slate-700">No projects match your filters</p>
          <button
            onClick={() => {
              setSearch("");
              setActiveCategory("All");
              setActiveSkill("All");
            }}
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
                  {formCategoryOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    No categories yet.{" "}
                    <a href="/dashboard/categories" className="text-brand-600 hover:text-brand-700">
                      Create one
                    </a>
                  </p>
                )}
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
                <label className="label">Project image</label>
                <div className="space-y-3">
                  {form.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.imageUrl}
                      alt="Project preview"
                      className="h-32 w-full rounded-xl object-cover border border-slate-200"
                    />
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn-secondary text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading…" : "Upload image"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>
                  <input
                    className="input"
                    placeholder="Or paste image URL…"
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </div>
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
                <button type="submit" className="btn-primary" disabled={submitting || uploading}>
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
