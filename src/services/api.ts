const API_URL = "/api";
const DEFAULT_TIMEOUT_MS = 12000;
const RETRYABLE_STATUSES = [502, 503, 504];

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

function createRequestSignal(externalSignal: AbortSignal | null | undefined, timeoutMs: number) {
  const controller = new AbortController();
  let timedOut = false;

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  const abort = () => controller.abort();
  if (externalSignal?.aborted) abort();
  else externalSignal?.addEventListener("abort", abort, { once: true });

  return {
    signal: controller.signal,
    timedOut: () => timedOut,
    cleanup: () => {
      clearTimeout(timeout);
      externalSignal?.removeEventListener("abort", abort);
    },
  };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const retryable = method === "GET";
  const delays = retryable ? [0, 800, 1800, 3500] : [0];
  let lastError: unknown;
  for (const delay of delays) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    const requestSignal = createRequestSignal(init?.signal, DEFAULT_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...init, signal: requestSignal.signal });
      if (response.ok) return response.json() as Promise<T>;
      const body = await response.json().catch(() => null) as { error?: string } | null;
      const error = new ApiError(body?.error ?? "No fue posible completar la solicitud.", response.status);
      if (!RETRYABLE_STATUSES.includes(response.status)) throw error;
      lastError = error;
    } catch (error) {
      if (requestSignal.timedOut()) {
        throw new ApiError("La consulta tardó demasiado. Intenta nuevamente en unos segundos.", 408);
      }
      if (init?.signal?.aborted) throw error;
      if (error instanceof ApiError && !RETRYABLE_STATUSES.includes(error.status)) throw error;
      lastError = error;
    } finally {
      requestSignal.cleanup();
    }
  }
  if (lastError instanceof Error) throw lastError;
  throw new ApiError("No fue posible conectar con el servicio.", 503);
}
