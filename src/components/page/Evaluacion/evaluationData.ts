export type TestType = "cml" | "progreso" | "fundamentos";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { getEvaluacion, numeroEvaluacion, type DetalleBloque } from "./evaluationViewData";
const sanitizeBlockItems = (items:Array<{bloque:string;aplicados:unknown;pendientes:unknown;universo:unknown;porcentaje:unknown}> = []):BlockItem[] =>
  items
    .filter((item) => typeof item?.bloque === "string" && item.bloque.trim().length > 0)
    .map((item) => ({
      block: item.bloque,
      applied: numeroEvaluacion(item.aplicados),
      pending: numeroEvaluacion(item.pendientes),
      universe: numeroEvaluacion(item.universo),
      percentage: numeroEvaluacion(item.porcentaje),
    }))
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
