import { dashboardDatabase } from "@/data/dashboardDatabase";

export type Finding = {
  title: string;
  process: string;
  description: string;
  impact: number;
};

export const qualityData = dashboardDatabase.gestionCalidad;
export const auditedByGroup = qualityData.auditadosPorGrupo;
export const complianceByGroup = qualityData.cumplimientoPorGrupo;
export const complianceByProcess = qualityData.cumplimientoPorProceso;
export const criticalFindings: Finding[] = qualityData.hallazgosCriticos;
