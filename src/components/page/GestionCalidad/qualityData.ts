import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";

export type Finding = {
  title: string;
  process: string;
  description: string;
  impact: number;
};

export const qualityData = dashboardDatabase.gestionCalidad;
export const auditedByGroup = sortDescendingByNumber(qualityData.auditadosPorGrupo, (item) => item.auditados);
export const complianceByGroup = sortDescendingByNumber(qualityData.cumplimientoPorGrupo, (item) => item.value);
export const complianceByProcess = sortDescendingByNumber(qualityData.cumplimientoPorProceso, (item) => item.value);
export const criticalFindings: Finding[] = sortDescendingByNumber(qualityData.hallazgosCriticos, (item) => item.impact);
