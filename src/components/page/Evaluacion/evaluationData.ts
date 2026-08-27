export type TestType = "cml" | "progreso" | "fundamentos";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { getEvaluacion, type DetalleBloque } from "./evaluationViewData";
type RawBlockItem = {
  bloque?: unknown;
  aplicados?: unknown;
  pendientes?: unknown;
  universo?: unknown;
  porcentaje?: unknown;
};

function parseNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value.replace(/[,\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

const sanitizeBlockItems = (items: unknown): BlockItem[] =>
  (Array.isArray(items) ? items as RawBlockItem[] : [])
    .filter((item) => typeof item?.bloque === "string" && item.bloque.trim().length > 0)
    .map((item) => {
      const applied = parseNumber(item.aplicados) ?? 0;
      const universe = parseNumber(item.universo) ?? 0;
      const pending = parseNumber(item.pendientes) ?? Math.max(universe - applied, 0);
      const percentage = parseNumber(item.porcentaje) ?? (universe > 0 ? (applied / universe) * 100 : 0);

      return {
        block: String(item.bloque).trim(),
        applied,
        pending,
        universe,
        percentage,
      };
    })
    .filter((item) => item.applied > 0 || item.pending > 0 || item.universe > 0 || item.percentage > 0);

function isDetalleBloque(value: unknown): value is DetalleBloque {
  return typeof value === "object" && value !== null && "centrosEscolares" in value && "matricula" in value;
}

function resolveDetallePorPrueba(testType: TestType): DetalleBloque | undefined {
  const detalle = getEvaluacion().detallePorBloque;
  if (!detalle) return undefined;
  if (isDetalleBloque(detalle)) return detalle;
  const porPrueba = detalle[testType];
  return porPrueba && isDetalleBloque(porPrueba) ? porPrueba : undefined;
}

export const hasBlockDetail = (testType: TestType): boolean => {
  return Boolean(getBlockData(testType).length || getEnrollmentData(testType).length);
};

export const getBlockData = (testType: TestType):BlockItem[] => sanitizeBlockItems(resolveDetallePorPrueba(testType)?.centrosEscolares);
export const getEnrollmentData = (testType: TestType):BlockItem[] => sanitizeBlockItems(resolveDetallePorPrueba(testType)?.matricula);
