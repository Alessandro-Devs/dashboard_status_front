// Estructuras de Gestión Escolar que se capturan en el panel y se muestran en el dashboard:
// formación de directores, contactos a directores, resueltos por motivo y universos semanales.
// Se comparten aquí para que el formulario y el dashboard usen la misma forma de los datos.

type Json = unknown;
const isObject = (value: Json): value is Record<string, Json> => value !== null && typeof value === "object" && !Array.isArray(value);
export const toNumber = (value: Json): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
};
const cell = (value: Json) => (typeof value === "number" || typeof value === "string" ? value : "");

/* ---------- Formación de directores ---------- */

// Ejes formativos y las sesiones que agrupa cada uno (estructura fija del programa).
export const TRAINING_AXES = [
  { nombre: "Eje formativo 1", sesiones: [1, 2, 3] },
  { nombre: "Eje formativo 2", sesiones: [4, 5] },
  { nombre: "Eje formativo 3", sesiones: [6, 7] },
];
export const TRAINING_SESSIONS = TRAINING_AXES.flatMap((axis) => axis.sesiones);
export const axisOfSession = (session: number) => TRAINING_AXES.find((axis) => axis.sesiones.includes(session))?.nombre ?? "";

export type TrainingSessionInput = { sesion: number; eje: string; formados: string | number };
export type TrainingBlockInput = { nombre: string | number; ce: string | number; porcentajes: Array<string | number> };
// totalCE, meta y realizadas son editables; si quedan vacíos se calculan (suma de CE de los bloques, CE × sesiones y suma de formados).
export type DirectorsTrainingInput = { totalCE: string | number; meta: string | number; realizadas: string | number; sesiones: TrainingSessionInput[]; bloques: TrainingBlockInput[] };

// Deja los datos con la forma que espera el formulario: 7 sesiones fijas y bloques con 7 porcentajes.
export function normalizeDirectorsTraining(value: Json): DirectorsTrainingInput {
  const source = isObject(value) ? value : {};
  const sessions = Array.isArray(source.sesiones) ? source.sesiones : [];
  const blocks = Array.isArray(source.bloques) ? source.bloques : [];
  return {
    totalCE: cell(source.totalCE),
    meta: cell(source.meta),
    realizadas: cell(source.realizadas),
    sesiones: TRAINING_SESSIONS.map((sesion, index) => {
      const found = sessions.find((item) => isObject(item) && toNumber(item.sesion) === sesion) ?? sessions[index];
      return { sesion, eje: axisOfSession(sesion), formados: isObject(found) ? cell(found.formados) : "" };
    }),
    bloques: blocks.filter(isObject).map((block) => {
      const percentages = Array.isArray(block.porcentajes) ? block.porcentajes : [];
      return { nombre: cell(block.nombre), ce: cell(block.ce), porcentajes: TRAINING_SESSIONS.map((_, index) => cell(percentages[index])) };
    }),
  };
}

export type DirectorsTrainingData = {
  totalCE: number;
  meta: number;
  realizadas: number;
  formados: number[];
  bloques: Array<{ nombre: string; ce: number; pct: Array<number | null> }>;
};

// Lectura para el dashboard. Devuelve null si no hay datos capturados.
export function readDirectorsTraining(value: Json): DirectorsTrainingData | null {
  const normalized = normalizeDirectorsTraining(value);
  const formados = normalized.sesiones.map((session) => toNumber(session.formados) ?? 0);
  const bloques = normalized.bloques
    .map((block) => ({ nombre: String(block.nombre).trim(), ce: toNumber(block.ce) ?? 0, pct: block.porcentajes.map((item) => toNumber(item) ?? null) }))
    .filter((block) => block.nombre !== "" || block.ce > 0);
  const totalCE = toNumber(normalized.totalCE) ?? bloques.reduce((sum, block) => sum + block.ce, 0);
  const meta = toNumber(normalized.meta) ?? totalCE * TRAINING_SESSIONS.length;
  const realizadas = toNumber(normalized.realizadas) ?? formados.reduce((sum, item) => sum + item, 0);
  if (totalCE <= 0 && formados.every((item) => item === 0)) return null;
  return { totalCE, meta, realizadas, formados, bloques };
}

/* ---------- Contacto a directores ---------- */

export const CONTACT_TYPES = ["Llamada", "Videollamada", "Correo", "WhatsApp"];
export type DirectorContactsInput = { totalDirectores: string | number; tipos: Array<{ tipo: string; contactados: string | number }> };

export function normalizeDirectorContacts(value: Json): DirectorContactsInput {
  const source = isObject(value) ? value : {};
  const types = Array.isArray(source.tipos) ? source.tipos : [];
  return {
    totalDirectores: cell(source.totalDirectores),
    tipos: CONTACT_TYPES.map((tipo) => {
      const found = types.find((item) => isObject(item) && String(item.tipo ?? item.nombre ?? "").toLowerCase() === tipo.toLowerCase());
      return { tipo, contactados: isObject(found) ? cell(found.contactados) : "" };
    }),
  };
}

export type DirectorContactsData = { totalDirectores: number; tipos: Array<{ nombre: string; contactados: number }> };

export function readDirectorContacts(value: Json): DirectorContactsData | null {
  const normalized = normalizeDirectorContacts(value);
  const totalDirectores = toNumber(normalized.totalDirectores) ?? 0;
  const tipos = normalized.tipos.map((item) => ({ nombre: item.tipo, contactados: toNumber(item.contactados) ?? 0 }));
  if (totalDirectores <= 0 || tipos.every((item) => item.contactados <= 0)) return null;
  return { totalDirectores, tipos };
}
