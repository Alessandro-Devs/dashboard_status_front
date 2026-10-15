// Aprendizaje / contenido: datos que se capturan en Administración > Aprendizaje y se muestran en el dashboard
// (cards de avance promedio, flujo editorial, avance por línea y clases publicadas por asignatura y fase).
// Se guardan en aprendizaje.editorial.

type Json = unknown;
const isObject = (value: Json): value is Record<string, Json> => value !== null && typeof value === "object" && !Array.isArray(value);
const cell = (value: Json): string | number => (typeof value === "number" || typeof value === "string" ? value : "");
export const toNumber = (value: Json): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export const EDITORIAL_STAGES = ["Autoría", "Producción / edición", "Publicación"];
export const SUMMARY_TITLES = ["Autoría", "Edición", "Publicación"];
export const PUBLISHED_PHASES = ["Fase 1", "Fase 2", "Fase 3"];
export const DEFAULT_LINES = ["IHFB", "Kira", "xAI"];
export const DEFAULT_SUBJECTS = ["Matemáticas", "Lenguaje", "Ciencias Naturales", "Desarrollo del Pensamiento", "Remediación"];

/* ---------- Forma del formulario ---------- */

export type EditorialStageInput = { pct: string | number; clases: string | number };
export type EditorialLineInput = { nombre: string; rango: string; producido: string | number; total: string | number; etapas: EditorialStageInput[] };
export type PublishedSubjectInput = { asignatura: string; valores: Array<string | number> };
export type EditorialInput = { lineas: EditorialLineInput[]; publicadas: PublishedSubjectInput[] };

export const blankEditorialLine = (nombre = ""): EditorialLineInput => ({ nombre, rango: "", producido: "", total: "", etapas: EDITORIAL_STAGES.map(() => ({ pct: "", clases: "" })) });
export const blankPublishedSubject = (asignatura = ""): PublishedSubjectInput => ({ asignatura, valores: PUBLISHED_PHASES.map(() => "") });
export const blankEditorial = (): EditorialInput => ({ lineas: DEFAULT_LINES.map(blankEditorialLine), publicadas: DEFAULT_SUBJECTS.map(blankPublishedSubject) });

export function normalizeEditorial(value: Json): EditorialInput {
  if (!isObject(value)) return blankEditorial();
  const lines = Array.isArray(value.lineas) ? value.lineas.filter(isObject) : [];
  const subjects = Array.isArray(value.publicadas) ? value.publicadas.filter(isObject) : [];
  return {
    lineas: lines.length ? lines.map((line) => {
      const stages = Array.isArray(line.etapas) ? line.etapas : [];
      return {
        nombre: String(line.nombre ?? ""),
        rango: String(line.rango ?? ""),
        producido: cell(line.producido),
        total: cell(line.total),
        etapas: EDITORIAL_STAGES.map((_, index) => {
          const stage = isObject(stages[index]) ? stages[index] : {};
          return { pct: cell(stage.pct), clases: cell(stage.clases) };
        }),
      };
    }) : blankEditorial().lineas,
    publicadas: subjects.length ? subjects.map((subject) => {
      const values = Array.isArray(subject.valores) ? subject.valores : [];
      return { asignatura: String(subject.asignatura ?? ""), valores: PUBLISHED_PHASES.map((_, index) => cell(values[index])) };
    }) : blankEditorial().publicadas,
  };
}

/* ---------- Lectura para el dashboard ---------- */

export type EditorialLine = { nombre: string; rango: string; producido: number; total: number; etapas: Array<{ label: string; pct: number; clases: number | null }> };
export type PublishedSubject = { asignatura: string; fases: number[] };
export type EditorialData = { lineas: EditorialLine[]; publicadas: PublishedSubject[]; resumen: Array<{ title: string; value: number; description: string }> };

export function readEditorial(value: Json): EditorialData | null {
  const input = normalizeEditorial(value);
  const lineas = input.lineas
    .filter((line) => line.nombre.trim() !== "" && line.etapas.some((stage) => toNumber(stage.pct) !== null))
    .map((line) => ({
      nombre: line.nombre.trim(),
      rango: line.rango.trim(),
      producido: toNumber(line.producido) ?? 0,
      total: toNumber(line.total) ?? 0,
      etapas: line.etapas.map((stage, index) => ({ label: EDITORIAL_STAGES[index], pct: Math.min(100, Math.max(0, toNumber(stage.pct) ?? 0)), clases: toNumber(stage.clases) })),
    }));
  const publicadas = input.publicadas
    .filter((subject) => subject.asignatura.trim() !== "" && subject.valores.some((item) => toNumber(item) !== null))
    .map((subject) => ({ asignatura: subject.asignatura.trim(), fases: subject.valores.map((item) => toNumber(item) ?? 0) }));
  if (!lineas.length && !publicadas.length) return null;
  const resumen = lineas.length ? SUMMARY_TITLES.map((title, index) => ({
    title,
    value: Math.round(lineas.reduce((sum, line) => sum + (line.etapas[index]?.pct ?? 0), 0) / lineas.length),
    description: "Avance promedio",
  })) : [];
  return { lineas, publicadas, resumen };
}

// Promedio por etapa para mostrarlo en el formulario mientras se captura.
export const editorialSummary = (value: EditorialInput) => readEditorial(value)?.resumen ?? SUMMARY_TITLES.map((title) => ({ title, value: 0, description: "Avance promedio" }));
