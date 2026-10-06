// Fecha de corte en la URL (?fecha=AAAA-MM-DD) para poder compartir el link de una vista.
export const DATE_QUERY_PARAM = "fecha";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readDateFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get(DATE_QUERY_PARAM);
  return value && ISO_DATE.test(value) ? value : null;
}

// Escribe la fecha en la URL actual sin recargar ni agregar entradas al historial.
export function writeDateToUrl(date: string) {
  if (typeof window === "undefined" || !ISO_DATE.test(date)) return;
  const url = new URL(window.location.href);
  if (url.searchParams.get(DATE_QUERY_PARAM) === date) return;
  url.searchParams.set(DATE_QUERY_PARAM, date);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

// Ruta con la fecha actual de la URL, para no perderla al navegar entre secciones.
export function withDateQuery(path: string) {
  const date = readDateFromUrl();
  if (!date) return path;
  const [base, hash] = path.split("#");
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${DATE_QUERY_PARAM}=${date}${hash !== undefined ? `#${hash}` : ""}`;
}
