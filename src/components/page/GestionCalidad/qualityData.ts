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

// La API sincroniza dashboardDatabase después de cargar este módulo. Estas
// colecciones deben calcularse bajo demanda para no conservar copias vacías.
export const getAuditedByGroup = () =>
  sortDescendingByNumber(
    (qualityData.auditadosPorGrupo as AuditedGroup[]).filter((item) => item && Number(item.auditados) > 0 && Number(item.total) > 0),
    (item) => item.auditados,
  );
export const getCoverageByGroup = () => Array.isArray(qualityData.coberturaPorGrupo)
  ? (qualityData.coberturaPorGrupo as CoverageGroup[]).filter((item) => item && Number(item.auditados) > 0 && Number(item.total) > 0 && Number(item.porcentaje) > 0)
  : [];
export const getComplianceByGroup = () =>
  sortDescendingByNumber(
    (qualityData.cumplimientoPorGrupo as Compliance[]).filter((item) => item && Number(item.value) > 0),
    (item) => item.value,
  );
export const getComplianceByProcess = () =>
  sortDescendingByNumber(
    (qualityData.cumplimientoPorProceso as Compliance[]).filter((item) => item && Number(item.value) > 0),
    (item) => item.value,
  );
export const getCriticalFindings = (): Finding[] => {
  const rawFindings = qualityData.hallazgosCriticos as unknown;
  return Array.isArray(rawFindings)
    ? rawFindings.filter((item): item is Finding => Boolean(item && typeof item === "object" && !Array.isArray(item) && typeof item.severity === "string" && item.severity.trim() !== "" && Object.values(item).some((value) => value !== null && value !== undefined && String(value).trim() !== "")))
    : [];
};
