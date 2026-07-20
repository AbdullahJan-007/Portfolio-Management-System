import { NextRequest } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { ok, unauthorized, error, serverError } from "@/lib/api";

// NOTE ON STORAGE STRATEGY
// -------------------------------------------------------------------------
// Vercel (and most serverless platforms) run route handlers on a read-only,
// ephemeral filesystem — anything written to disk during one invocation is
// not guaranteed to exist on the next, and the deployed `public/` directory
// itself cannot be written to at all. Writing uploads to `public/uploads`
// (the previous approach) works locally but silently breaks in production.
//
// To keep this project a zero-config, single-command Vercel deployment, we
// encode the image as a base64 data URI and store it directly on the
// Profile/Project row (`avatarUrl` / `imageUrl` are just strings). This
// requires no external service, no billing setup, and works identically in
// development and production.
//
// For a larger real-world app with many/large images, swap this for a
// dedicated object store — Vercel Blob, Cloudinary, S3, or Supabase Storage —
// and store the returned URL instead. The upload contract below (POST a
// `file`, receive `{ url }`) stays the same either way.

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB — keeps DB rows lightweight

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return unauthorized();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return error("No file provided");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return error("Only image files (JPEG, PNG, GIF, WebP) are allowed.");
    }

    if (file.size > MAX_SIZE_BYTES) {
      return error("File is too large. Maximum size is 2 MB.");
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return ok({ url: dataUrl });
  } catch (err) {
    console.error("upload error", err);
    return serverError("Upload failed. Please try again.");
  }
}
