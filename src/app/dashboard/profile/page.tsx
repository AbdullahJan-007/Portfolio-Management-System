"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useToast } from "@/components/Toast";
import { apiFetch, uploadImage } from "@/lib/client-api";
import { getInitials } from "@/lib/utils";

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

export default function ProfilePage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    apiFetch<{ profile: Profile }>("/api/profile")
      .then((result) => {
        if (result.ok && result.data.profile) {
          const p = result.data.profile;
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
        } else if (!result.ok) {
          showError(result.error);
        }
      })
      .finally(() => setLoading(false));
  }, [showError]);

  function update<K extends keyof Profile>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadImage(file);
    if (!result.ok) {
      showError(result.error);
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setForm((f) => ({ ...f, avatarUrl: result.data.url }));
    showSuccess("Image uploaded. Save changes to apply it to your profile.");
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const result = await apiFetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!result.ok) {
      showError(result.error);
    } else {
      showSuccess("Profile saved successfully.");
      router.refresh();
    }

    setSaving(false);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    const result = await apiFetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!result.ok) {
      showError(result.error);
    } else {
      showSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setChangingPassword(false);
  }

  if (loading) {
    return <LoadingSpinner className="py-20" label="Loading profile…" />;
  }

  const initials = getInitials(form.fullName);

  return (
    <div className="animate-fade-in space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
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

        <section className="card p-6">
          <h3 className="text-base font-semibold text-slate-900">Profile Image</h3>
          <div className="mt-5 flex items-center gap-5">
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

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={saving || uploading}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Change Password */}
      <section className="card p-6">
        <h3 className="text-base font-semibold text-slate-900">Change Password</h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Update your account password. You will stay logged in after changing it.
        </p>

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
    </div>
  );
}
