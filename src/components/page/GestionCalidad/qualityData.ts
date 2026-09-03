import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";

export type Finding = {
  title: string;
  process: string;
  description: string;
  impact: number;
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
export const getCriticalFindings = (): Finding[] =>
  qualityData.hallazgosCriticos as Finding[];
