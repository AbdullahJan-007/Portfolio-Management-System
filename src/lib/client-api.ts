type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; error: string; status: number };

export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  init?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, init);
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };

    if (!res.ok) {
      return {
        ok: false,
        error: data.error ?? `Request failed (${res.status})`,
        status: res.status,
      };
    }

    return { ok: true, data, status: res.status };
  } catch {
    return { ok: false, error: "Network error. Please try again.", status: 0 };
  }
}

export async function uploadImage(file: File): Promise<ApiResult<{ url: string }>> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ url: string }>("/api/upload", { method: "POST", body: formData });
}
