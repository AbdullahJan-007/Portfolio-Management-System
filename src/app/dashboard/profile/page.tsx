"use client";

import { useEffect, useRef, useState } from "react";

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

const empty: Profile = {
  fullName: "",
  title: "",
  avatarUrl: "",
  location: "",
  bio: "",
  contactEmail: "",
  phone: "",
  website: "",
  github: "",
  linkedin: "",
  twitter: "",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function ProfilePage() {
  const [form, setForm] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          setForm({
            fullName: p.fullName ?? "",
            title: p.title ?? "",
            avatarUrl: p.avatarUrl ?? "",
            location: p.location ?? "",
            bio: p.bio ?? "",
            contactEmail: p.contactEmail ?? "",
            phone: p.phone ?? "",
            website: p.website ?? "",
            github: p.github ?? "",
            linkedin: p.linkedin ?? "",
            twitter: p.twitter ?? "",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof Profile>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
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
      setForm((f) => ({ ...f, avatarUrl: data.url }));
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save profile");
        return;
      }
      setMessage("Profile saved successfully.");
      setTimeout(() => setMessage(null), 4000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.error || "Could not change password");
        return;
      }
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch {
      setPasswordError("Network error. Please try again.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const initials = form.fullName ? getInitials(form.fullName) : "?";

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Profile</h2>
          <p className="mt-1 text-slate-500">
            Your personal information, about section and contact details.
          </p>
        </div>
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Profile Image */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">Profile Image</h3>
        <div className="mt-5 flex items-center gap-5">
          {/* Avatar preview */}
          <div className="relative">
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-brand-100"
              />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full bg-brand-600 text-2xl font-bold text-white ring-4 ring-brand-100">
                {initials}
              </div>
            )}
            {uploading && (
              <div className="absolute inset-0 grid place-items-center rounded-full bg-white/70">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              </div>
            )}
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <p className="mt-1.5 text-xs text-slate-400">
              JPEG, PNG, GIF or WebP. Max 5 MB.
            </p>
            {form.avatarUrl && (
              <button
                type="button"
                onClick={() => update("avatarUrl", "")}
                className="mt-1 text-xs text-red-500 hover:text-red-700"
              >
                Remove image
              </button>
            )}
          </div>
        </div>

        {/* Avatar URL fallback */}
        <div className="mt-4">
          <label className="label">Or enter image URL</label>
          <input
            className="input"
            placeholder="https://…"
            value={form.avatarUrl ?? ""}
            onChange={(e) => update("avatarUrl", e.target.value)}
          />
        </div>
      </section>

      {/* Personal information */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">Personal Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Full name *</label>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Professional title</label>
            <input
              className="input"
              placeholder="e.g. Full-Stack Developer"
              value={form.title ?? ""}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              className="input"
              placeholder="City, Country"
              value={form.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">About</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Tell visitors about yourself, your background and what you&apos;re passionate about.
        </p>
        <div className="mt-4">
          <label className="label">Bio</label>
          <textarea
            className="input min-h-36 resize-y"
            rows={5}
            placeholder="Tell people about yourself…"
            value={form.bio ?? ""}
            onChange={(e) => update("bio", e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-slate-400">
            {(form.bio ?? "").length} characters
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">Contact Information</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Contact email</label>
            <input
              type="email"
              className="input"
              value={form.contactEmail ?? ""}
              onChange={(e) => update("contactEmail", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Website</label>
            <input
              className="input"
              placeholder="https://…"
              value={form.website ?? ""}
              onChange={(e) => update("website", e.target.value)}
            />
          </div>
          <div>
            <label className="label">GitHub</label>
            <input
              className="input"
              placeholder="https://github.com/…"
              value={form.github ?? ""}
              onChange={(e) => update("github", e.target.value)}
            />
          </div>
          <div>
            <label className="label">LinkedIn</label>
            <input
              className="input"
              placeholder="https://linkedin.com/in/…"
              value={form.linkedin ?? ""}
              onChange={(e) => update("linkedin", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Twitter / X</label>
            <input
              className="input"
              placeholder="https://x.com/…"
              value={form.twitter ?? ""}
              onChange={(e) => update("twitter", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Update your account password. You will stay logged in after changing it.
        </p>

        {passwordMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {passwordMessage}
          </div>
        )}
        {passwordError && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Current password</label>
            <input
              type="password"
              className="input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">New password</label>
            <input
              type="password"
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="label">Confirm new password</label>
            <input
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="btn-secondary"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating…" : "Change password"}
            </button>
          </div>
        </form>
      </section>

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={saving || uploading}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
