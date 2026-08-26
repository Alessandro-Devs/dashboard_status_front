const API_URL = "/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const retryable = method === "GET";
  const delays = retryable ? [0, 800, 1800, 3500] : [0];
  let lastError: unknown;
  for (const delay of delays) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });
      if (response.ok) return response.json() as Promise<T>;
      const body = await response.json().catch(() => null) as { error?: string } | null;
      const error = new ApiError(body?.error ?? "No fue posible completar la solicitud.", response.status);
      if (![502, 503, 504].includes(response.status)) throw error;
      lastError = error;
    } catch (error) {
      if (error instanceof ApiError && ![502, 503, 504].includes(error.status)) throw error;
      lastError = error;
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new ApiError("No fue posible conectar con el servicio.", 503);
}
