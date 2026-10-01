const API_URL = "/api";
// Tiempo máximo de cada intento. Vercel y Neon (capas gratuitas) se duermen y el primer
// intento puede tardar mientras despiertan, así que un intento lento se reintenta sin avisar.
const ATTEMPT_TIMEOUT_MS = 20000;
// Las lecturas (GET) reintentan fallos temporales hasta este tiempo total antes de mostrar error.
const DEFAULT_READ_BUDGET_MS = 3 * 60 * 1000;
// Estados que suelen aparecer mientras el servidor o la base de datos despiertan.
const RETRYABLE_STATUSES = [500, 502, 503, 504];
const RETRY_DELAYS_MS = [800, 1500, 2500, 4000, 6000, 8000];

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiFetchInit = RequestInit & {
  // true: reintenta hasta obtener respuesta (o hasta que se cancele con `signal`). Lo usa la
  // carga del dashboard, que muestra el modal de carga mientras tanto.
  waitForServer?: boolean;
};

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

const wait = (ms: number, signal?: AbortSignal | null) => new Promise<void>((resolve, reject) => {
  if (signal?.aborted) return reject(new DOMException("Aborted", "AbortError"));
  const timer = setTimeout(() => { signal?.removeEventListener("abort", onAbort); resolve(); }, ms);
  const onAbort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
  signal?.addEventListener("abort", onAbort, { once: true });
});

export async function apiFetch<T>(path: string, init?: ApiFetchInit): Promise<T> {
  const { waitForServer = false, ...requestInit } = init ?? {};
  const method = (requestInit.method ?? "GET").toUpperCase();
  // Solo las lecturas se reintentan: repetir un guardado podría duplicar registros.
  const retryable = method === "GET";
  const startedAt = Date.now();
  let attempt = 0;
  let lastError: unknown;

  while (true) {
    const requestSignal = createRequestSignal(requestInit.signal, ATTEMPT_TIMEOUT_MS);
    try {
      const response = await fetch(`${API_URL}${path}`, { cache: "no-store", ...requestInit, signal: requestSignal.signal });
      if (response.ok) return response.json() as Promise<T>;
      const body = await response.json().catch(() => null) as { error?: string } | null;
      const error = new ApiError(body?.error ?? "No fue posible completar la solicitud.", response.status);
      if (!retryable || !RETRYABLE_STATUSES.includes(response.status)) throw error;
      lastError = error;
    } catch (error) {
      if (requestInit.signal?.aborted) throw error;
      if (error instanceof ApiError && !RETRYABLE_STATUSES.includes(error.status)) throw error;
      if (!retryable) {
        throw requestSignal.timedOut()
          ? new ApiError("El servidor está tardando en responder. Espera un momento e inténtalo de nuevo.", 408)
          : error;
      }
      // Tiempo agotado o fallo de red: el servidor probablemente está despertando. Se reintenta.
      lastError = error;
    } finally {
      requestSignal.cleanup();
    }

    const elapsed = Date.now() - startedAt;
    if (!waitForServer && elapsed >= DEFAULT_READ_BUDGET_MS) break;
    await wait(RETRY_DELAYS_MS[Math.min(attempt, RETRY_DELAYS_MS.length - 1)], requestInit.signal);
    attempt += 1;
  }

  if (lastError instanceof ApiError && lastError.status !== 408) throw lastError;
  throw new ApiError("No pudimos conectar con el servidor. Inténtalo de nuevo en unos minutos.", 503);
}
