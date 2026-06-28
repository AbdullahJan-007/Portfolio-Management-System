"use client";

import { useEffect, useRef, useState } from "react";
import { IconBox } from "@/components/icons";

type Skill = {
  id: string;
  name: string;
  category: string | null;
  level: number;
};

const blank = { name: "", category: "", level: 3 };

const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Elementary",
  3: "Intermediate",
  4: "Advanced",
  5: "Expert",
};

function groupByCategory(skills: Skill[]): Record<string, Skill[]> {
  const groups: Record<string, Skill[]> = {};
  for (const skill of skills) {
    const key = skill.category?.trim() || "Uncategorized";
    if (!groups[key]) groups[key] = [];
    groups[key].push(skill);
  }
  return groups;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const [form, setForm] = useState<{ name: string; category: string; level: number }>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/skills");
    const data = await res.json();
    setSkills(data.skills ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setForm(blank);
    setEditingId(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const url = editingId ? `/api/skills/${editingId}` : "/api/skills";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save skill");
        return;
      }
      resetForm();
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(skill: Skill) {
    setEditingId(skill.id);
    setForm({
      name: skill.name,
      category: skill.category ?? "",
      level: skill.level,
    });
    setError(null);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function remove(id: string) {
    if (!confirm("Delete this skill?")) return;
    await fetch(`/api/skills/${id}`, { method: "DELETE" });
    if (editingId === id) resetForm();
    await load();
  }

  const categories = ["All", ...Array.from(new Set(skills.map((s) => s.category?.trim() || "Uncategorized"))).sort()];
  const filtered = filterCategory === "All"
    ? skills
    : skills.filter((s) => (s.category?.trim() || "Uncategorized") === filterCategory);
  const grouped = groupByCategory(filtered);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Skills</h2>
        <p className="mt-1 text-slate-500">
          Add, update and remove the skills shown on your portfolio.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">{skills.length}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Total Skills</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">
            {new Set(skills.map((s) => s.category?.trim()).filter(Boolean)).size}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Categories</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-brand-600">
            {skills.filter((s) => s.level >= 4).length}
          </p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">Advanced+</p>
        </div>
      </div>

      {/* Add / Edit form */}
      <form ref={formRef} onSubmit={handleSubmit} className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">
          {editingId ? "Edit skill" : "Add a skill"}
        </h3>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Skill name *</label>
            <input
              className="input"
              placeholder="e.g. TypeScript"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Category</label>
            <input
              className="input"
              placeholder="e.g. Frontend"
              list="category-suggestions"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="category-suggestions">
              {["Frontend", "Backend", "Mobile", "DevOps", "Database", "Design", "Tools"].map(
                (c) => <option key={c} value={c} />
              )}
            </datalist>
          </div>
          <div>
            <label className="label">
              Proficiency —{" "}
              <span className="font-semibold text-brand-600">
                {LEVEL_LABELS[form.level]}
              </span>
            </label>
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              className="mt-2 w-full accent-brand-600"
              value={form.level}
              onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
            />
            <div className="mt-1 flex justify-between text-xs text-slate-400">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Saving…" : editingId ? "Update skill" : "Add skill"}
          </button>
          {editingId && (
            <button type="button" className="btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Category filter */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {cat}
              {cat !== "All" && (
                <span className="ml-1.5 opacity-70">
                  ({skills.filter((s) => (s.category?.trim() || "Uncategorized") === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Skill list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        </div>
      ) : skills.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto w-fit">
            <IconBox name="skills" size="2xl" variant="amber" />
          </div>
          <p className="mt-4 text-base font-medium text-slate-700">No skills yet</p>
          <p className="mt-1 text-sm text-slate-400">
            Add your first skill using the form above.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No skills match this filter.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([category, categorySkills]) => (
              <div key={category}>
                <div className="mb-3 flex items-center gap-3">
                  <h4 className="text-sm font-semibold text-slate-700">{category}</h4>
                  <span className="text-xs text-slate-400">
                    {categorySkills.length} {categorySkills.length === 1 ? "skill" : "skills"}
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="card flex items-center justify-between p-4 transition-shadow hover:shadow-md"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-900">{skill.name}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                            {LEVEL_LABELS[skill.level]}
                          </span>
                        </div>
                        <div className="mt-2.5 flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 w-7 rounded-full transition-colors ${
                                i < skill.level ? "bg-brand-600" : "bg-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="ml-4 flex shrink-0 gap-1.5">
                        <button
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                          onClick={() => startEdit(skill)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          onClick={() => remove(skill.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
