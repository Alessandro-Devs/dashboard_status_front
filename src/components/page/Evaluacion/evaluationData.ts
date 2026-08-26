export type TestType = "cml" | "progreso" | "fundamentos";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { getEvaluacion, type DetalleBloque } from "./evaluationViewData";
const sanitizeBlockItems = (items:Array<{bloque:string;aplicados:number;pendientes:number;universo:number;porcentaje:number}> = []):BlockItem[] =>
  items
    .filter((item) => typeof item?.bloque === "string" && item.bloque.trim().length > 0)
    .map((item) => ({
      block: item.bloque,
      applied: Number.isFinite(item.aplicados) ? item.aplicados : 0,
      pending: Number.isFinite(item.pendientes) ? item.pendientes : 0,
      universe: Number.isFinite(item.universo) ? item.universo : 0,
      percentage: Number.isFinite(item.porcentaje) ? item.porcentaje : 0,
    }));

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
  const detalle = resolveDetallePorPrueba(testType);
  return Boolean((detalle?.centrosEscolares?.length ?? 0) || (detalle?.matricula?.length ?? 0));
};

export const getBlockData = (testType: TestType):BlockItem[] => sanitizeBlockItems(resolveDetallePorPrueba(testType)?.centrosEscolares);
export const getEnrollmentData = (testType: TestType):BlockItem[] => sanitizeBlockItems(resolveDetallePorPrueba(testType)?.matricula);
