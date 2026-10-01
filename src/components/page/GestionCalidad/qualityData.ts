import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";

export type Finding = {
  severity?: string;
  leader?: string;
  component?: string;
  finding?: string;
  action?: string;
  leaderAction?: string;
  impact?: string | number;
  count?: string | number;
  title?: string;
  process?: string;
  description?: string;
};

type AuditedGroup = { name: string; auditados: number; total: number };
type CoverageGroup = { grupo: string; ronda: number; auditados: number; total: number; porcentaje: number };
type Compliance = { name: string; value: number };

export const qualityData = dashboardDatabase.gestionCalidad;

// Una fecha sin datos de calidad deja la sección vacía ({}), así que todo se lee con valores por defecto.
const list = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);
export type QualityKpiValues = { auditados: number; universo: number; cobertura: number; cumplimiento: number; hallazgos: number; hallazgosMayor: number; hallazgosMenor: number; observaciones: number; grupos: number };
const EMPTY_KPIS: QualityKpiValues = { auditados: 0, universo: 0, cobertura: 0, cumplimiento: 0, hallazgos: 0, hallazgosMayor: 0, hallazgosMenor: 0, observaciones: 0, grupos: 0 };
export const getQualityKpis = (): QualityKpiValues => {
  const value = (qualityData as { kpis?: unknown }).kpis;
  return value && typeof value === "object" && !Array.isArray(value) ? { ...EMPTY_KPIS, ...(value as Partial<QualityKpiValues>) } : { ...EMPTY_KPIS };
};

// HTML personalizado que se captura en Administración > Gestión de Calidad > "Detalles de hallazgos".
export const getCustomHtml = (): string => {
  const value = (qualityData as typeof qualityData & { codigoHtml?: unknown }).codigoHtml;
  return typeof value === "string" ? value.trim() : "";
};

export const hasRenderableCustomHtml = (): boolean => {
  const visibleText = getCustomHtml().replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
  return visibleText.length > 0;
};

// La API sincroniza dashboardDatabase después de cargar este módulo. Estas
// colecciones deben calcularse bajo demanda para no conservar copias vacías.
export const getAuditedByGroup = () =>
  sortDescendingByNumber(
    list<AuditedGroup>(qualityData.auditadosPorGrupo).filter((item) => item && Number(item.auditados) > 0 && Number(item.total) > 0),
    (item) => item.auditados,
  );
export const getCoverageByGroup = () => Array.isArray(qualityData.coberturaPorGrupo)
  ? (qualityData.coberturaPorGrupo as CoverageGroup[]).filter((item) => item && Number(item.auditados) > 0 && Number(item.total) > 0 && Number(item.porcentaje) > 0)
  : [];
export const getComplianceByGroup = () =>
  sortDescendingByNumber(
    list<Compliance>(qualityData.cumplimientoPorGrupo).filter((item) => item && Number(item.value) > 0),
    (item) => item.value,
  );
export const getComplianceByProcess = () =>
  sortDescendingByNumber(
    list<Compliance>(qualityData.cumplimientoPorProceso).filter((item) => item && Number(item.value) > 0),
    (item) => item.value,
  );
export const getCriticalFindings = (): Finding[] => {
  const rawFindings = qualityData.hallazgosCriticos as unknown;
  return Array.isArray(rawFindings)
    ? rawFindings.filter((item): item is Finding => Boolean(item && typeof item === "object" && !Array.isArray(item) && typeof item.severity === "string" && item.severity.trim() !== "" && Object.values(item).some((value) => value !== null && value !== undefined && String(value).trim() !== "")))
    : [];
};
