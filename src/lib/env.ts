// Simple environment validation helpers.
export function ensureEnv() {
  const missing: string[] = [];

  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 16) {
    missing.push("AUTH_SECRET (min 16 characters)");
  }

  if (!process.env.DATABASE_URL) {
    missing.push("DATABASE_URL");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function ensureAuthSecretPresent() {
  const authSecret = process.env.AUTH_SECRET;
  if (!authSecret || authSecret.length < 16) {
    throw new Error("AUTH_SECRET is missing or too short (min 16 chars).");
  }
}
