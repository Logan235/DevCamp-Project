const invalidEnvValues = new Set(["", "null", "undefined"]);

export function getRequiredEnvUrl(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().replace(/\/+$/, "");

  if (invalidEnvValues.has(normalized)) {
    return fallback;
  }

  return normalized;
}

export const API_BASE_URL = getRequiredEnvUrl(
  import.meta.env.VITE_API_URL,
  "http://localhost:3000",
);
