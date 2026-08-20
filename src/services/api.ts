const API_URL = "/api";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init });

  if (!response.ok) {
    throw new ApiError(`La API respondió con estado ${response.status}`, response.status);
  }

  return response.json() as Promise<T>;
}
