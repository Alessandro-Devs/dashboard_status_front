// Datos del heatmap de Progreso y de los factores de riesgo (treemap).
// Lo usan el dashboard (lectura) y el formulario de Administración (captura).

export const HEATMAP_MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"] as const;
export const HEATMAP_SUBJECTS = ["Lenguaje", "Matemática"] as const;
export const DEFAULT_HEATMAP_BLOCKS = ["B1", "B2", "B3", "B4", "B5"];
export const ALL_BLOCKS = "Todos";

// Del nivel más alto al más bajo. Cada celda va de `light` (0%) a `dark` (100%).
export const HEATMAP_LEVELS = [
  { name: "Excelente", dotColor: "#0f8b83", light: "#e3f4f2", dark: "#0b6e67" },
  { name: "Bueno", dotColor: "#20a98d", light: "#e0f6ec", dark: "#138a58" },
  { name: "Medio", dotColor: "#f3a617", light: "#fef4d9", dark: "#d98a04" },
  { name: "Bajo", dotColor: "#ea5b0c", light: "#feeadc", dark: "#d6500a" },
  { name: "Crítico", dotColor: "#e32932", light: "#fde6e7", dark: "#c81e28" },
] as const;
// Niveles que se muestran al activar "Factores de riesgo".
export const RISK_LEVELS = ["Bajo", "Crítico"];

export type MonthValues = (number | null)[];
export type LevelValues = Record<string, MonthValues>;
export type HeatmapProgreso = {
  bloques: string[];
  // Porcentaje por materia → bloque → nivel → mes.
  materias: Record<string, Record<string, LevelValues>>;
  // Universo de estudiantes por materia → bloque (captura manual).
  universos: Record<string, Record<string, number | null>>;
  // Bloques (por materia) cuyo universo se muestra en el hover del dashboard.
  mostrarUniverso: Record<string, string[]>;
  // Cantidad de estudiantes por materia → bloque → nivel → mes (captura manual).
  estudiantes: Record<string, Record<string, LevelValues>>;
};
export type RiskFactor = { nombre: string; porcentaje: number | null; estudiantes: number | null };
export type RiskFactorGroup = { intervenible: RiskFactor[]; noIntervenible: RiskFactor[] };
export type FactoresRiesgo = Record<string, RiskFactorGroup>;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

export const emptyMonths = (): MonthValues => HEATMAP_MONTHS.map(() => null);
export const emptyLevels = (): LevelValues => Object.fromEntries(HEATMAP_LEVELS.map((level) => [level.name, emptyMonths()]));

export function emptyHeatmap(blocks: string[] = DEFAULT_HEATMAP_BLOCKS): HeatmapProgreso {
  return {
    bloques: [...blocks],
    materias: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => [subject, Object.fromEntries(blocks.map((block) => [block, emptyLevels()]))])),
    universos: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => [subject, Object.fromEntries(blocks.map((block) => [block, null]))])),
    mostrarUniverso: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => [subject, []])),
    estudiantes: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => [subject, Object.fromEntries(blocks.map((block) => [block, emptyLevels()]))])),
  };
}

// Acepta cualquier JSON guardado y devuelve una estructura completa y segura.
export function normalizeHeatmap(value: unknown): HeatmapProgreso {
  const source = isRecord(value) ? value : {};
  const blocks = Array.isArray(source.bloques)
    ? [...new Set(source.bloques.filter((item): item is string => typeof item === "string" && item.trim() !== "" && item !== ALL_BLOCKS))]
    : [...DEFAULT_HEATMAP_BLOCKS];
  const levelTable = (table: unknown) => {
    const subjects = isRecord(table) ? table : {};
    return Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => {
      const subjectData = isRecord(subjects[subject]) ? subjects[subject] : {};
      return [subject, Object.fromEntries(blocks.map((block) => {
        const blockData = isRecord(subjectData[block]) ? subjectData[block] : {};
        return [block, Object.fromEntries(HEATMAP_LEVELS.map((level) => {
          const values = Array.isArray(blockData[level.name]) ? blockData[level.name] as unknown[] : [];
          return [level.name, HEATMAP_MONTHS.map((_, index) => toNumber(values[index]))];
        }))];
      }))];
    })) as Record<string, Record<string, LevelValues>>;
  };
  const universes = isRecord(source.universos) ? source.universos : {};
  const showUniverse = isRecord(source.mostrarUniverso) ? source.mostrarUniverso : {};
  return {
    bloques: blocks,
    materias: levelTable(source.materias),
    universos: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => {
      const subjectData = isRecord(universes[subject]) ? universes[subject] : {};
      return [subject, Object.fromEntries(blocks.map((block) => [block, toNumber(subjectData[block])]))];
    })),
    mostrarUniverso: Object.fromEntries(HEATMAP_SUBJECTS.map((subject) => {
      const list = Array.isArray(showUniverse[subject]) ? showUniverse[subject] as unknown[] : [];
      return [subject, blocks.filter((block) => list.includes(block))];
    })),
    estudiantes: levelTable(source.estudiantes),
  };
}

// "Todos" = promedio de los bloques que tienen dato en ese mes y nivel.
export function levelValuesFor(heatmap: HeatmapProgreso, subject: string, block: string): LevelValues {
  const subjectData = heatmap.materias[subject] ?? {};
  if (block !== ALL_BLOCKS) return subjectData[block] ?? emptyLevels();
  return Object.fromEntries(HEATMAP_LEVELS.map((level) => [level.name, HEATMAP_MONTHS.map((_, month) => {
    const values = heatmap.bloques.map((item) => subjectData[item]?.[level.name]?.[month]).filter((item): item is number => typeof item === "number");
    return values.length ? Math.round((values.reduce((sum, item) => sum + item, 0) / values.length) * 10) / 10 : null;
  })]));
}

// Filtros dinámicos: solo se ofrecen materias y bloques con al menos un porcentaje capturado.
const levelsHaveData = (levels: LevelValues | undefined) => Boolean(levels && Object.values(levels).some((months) => months.some((item) => item !== null)));
export const blocksWithData = (heatmap: HeatmapProgreso, subject: string) =>
  heatmap.bloques.filter((block) => levelsHaveData(heatmap.materias[subject]?.[block]));
export const subjectsWithData = (heatmap: HeatmapProgreso) =>
  HEATMAP_SUBJECTS.filter((subject) => blocksWithData(heatmap, subject).length > 0) as string[];

// Bloques con "Mostrar universo" marcado pero sin universo capturado (no se puede guardar así).
export const missingUniverses = (heatmap: HeatmapProgreso) =>
  HEATMAP_SUBJECTS.flatMap((subject) => (heatmap.mostrarUniverso[subject] ?? []).filter((block) => !(typeof heatmap.universos[subject]?.[block] === "number" && (heatmap.universos[subject][block] ?? 0) > 0)).map((block) => `${subject} · ${block}`));

export const hasHeatmapData = (heatmap: HeatmapProgreso) =>
  Object.values(heatmap.materias).some((blocks) => Object.values(blocks).some((levels) => Object.values(levels).some((months) => months.some((item) => item !== null))));

const normalizeFactor = (value: unknown): RiskFactor | null => {
  if (!isRecord(value)) return null;
  const nombre = typeof value.nombre === "string" ? value.nombre : "";
  return { nombre, porcentaje: toNumber(value.porcentaje), estudiantes: toNumber(value.estudiantes) };
};

export function normalizeRiskFactors(value: unknown): FactoresRiesgo {
  if (!isRecord(value)) return {};
  return Object.fromEntries(Object.entries(value).filter(([block]) => block !== ALL_BLOCKS).map(([block, group]) => {
    const source = isRecord(group) ? group : {};
    const list = (items: unknown) => (Array.isArray(items) ? items.map(normalizeFactor).filter((item): item is RiskFactor => item !== null) : []);
    return [block, { intervenible: list(source.intervenible), noIntervenible: list(source.noIntervenible) }];
  }));
}

// Solo cuentan los factores que tienen nombre; así un bloque vacío no muestra el botón.
export const visibleFactors = (items: RiskFactor[]) => items.filter((item) => item.nombre.trim() !== "");
export const hasRiskFactors = (group: RiskFactorGroup | undefined) =>
  Boolean(group && (visibleFactors(group.intervenible).length > 0 || visibleFactors(group.noIntervenible).length > 0));

function mixHex(from: string, to: string, amount: number) {
  const parse = (hex: string) => [1, 3, 5].map((index) => Number.parseInt(hex.slice(index, index + 2), 16));
  const [a, b] = [parse(from), parse(to)];
  return `#${a.map((channel, index) => Math.round(channel + (b[index] - channel) * amount).toString(16).padStart(2, "0")).join("")}`;
}

// Color de la celda en una escala fija de 0 a 100 %: el mismo valor tiene siempre el mismo
// tono, en cualquier fila o bloque. Valores sobre 100 usan el tono más intenso. La curva
// suave (raíz) separa mejor los valores bajos, que son los más frecuentes.
// `range` = mínimo y máximo de la fila visible. La intensidad se calcula dentro de ese rango para que
// las diferencias entre meses se noten aunque los porcentajes estén cerca (ej. 15% a 24%).
export function cellColor(levelName: string, value: number, range?: { min: number; max: number }) {
  const level = HEATMAP_LEVELS.find((item) => item.name === levelName) ?? HEATMAP_LEVELS[0];
  const amount = range
    ? range.max > range.min ? 0.08 + 0.92 * ((value - range.min) / (range.max - range.min)) : 0.5
    : Math.sqrt(Math.min(Math.max(value, 0), 100) / 100);
  const background = mixHex(level.light, level.dark, amount);
  // Texto oscuro sobre fondos claros y blanco sobre fondos intensos, para que siempre se lea.
  const [r, g, b] = [1, 3, 5].map((index) => Number.parseInt(background.slice(index, index + 2), 16) / 255);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return { background, text: luminance > 0.6 ? mixHex(level.dark, "#1f2937", 0.65) : "#ffffff" };
}
