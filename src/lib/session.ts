// Sesión del panel guardada en el navegador (misma regla que AdministrationLayout).
export const SESSION_USER_KEY = "dashboard:user";
export const SESSION_ACTIVITY_KEY = "dashboard:lastActivity";
const INACTIVITY_LIMIT_MS = 60 * 60 * 1000;

export function hasActiveSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const stored = window.localStorage.getItem(SESSION_USER_KEY);
    if (!stored) return false;
    const user = JSON.parse(stored) as { updatedPassword?: boolean };
    if (user.updatedPassword !== false) return false;
    const lastActivity = Number(window.localStorage.getItem(SESSION_ACTIVITY_KEY));
    return !lastActivity || Date.now() - lastActivity < INACTIVITY_LIMIT_MS;
  } catch {
    return false;
  }
}

// Para useSyncExternalStore: avisa cuando la sesión cambia en otra pestaña.
export function subscribeToSession(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("focus", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("focus", callback);
  };
}
