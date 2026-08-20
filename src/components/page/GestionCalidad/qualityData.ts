import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";

export type Finding = {
  title: string;
  process: string;
  description: string;
  impact: number;
};

type AuditedGroup = { name: string; auditados: number; total: number };
type Compliance = { name: string; value: number };

export const qualityData = dashboardDatabase.gestionCalidad;

// La API sincroniza dashboardDatabase después de cargar este módulo. Estas
// colecciones deben calcularse bajo demanda para no conservar copias vacías.
export const getAuditedByGroup = () =>
  sortDescendingByNumber(qualityData.auditadosPorGrupo as AuditedGroup[], (item) => item.auditados);
export const getComplianceByGroup = () =>
  sortDescendingByNumber(qualityData.cumplimientoPorGrupo as Compliance[], (item) => item.value);
export const getComplianceByProcess = () =>
  sortDescendingByNumber(qualityData.cumplimientoPorProceso as Compliance[], (item) => item.value);
export const getCriticalFindings = (): Finding[] =>
  qualityData.hallazgosCriticos as Finding[];
