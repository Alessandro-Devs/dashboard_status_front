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
const defaultCoverageByGroup: CoverageGroup[] = [
  { grupo: "G1A", ronda: 3, auditados: 47, total: 71, porcentaje: 66.2 },
  { grupo: "G1B", ronda: 1, auditados: 67, total: 113, porcentaje: 59.3 },
  { grupo: "G2", ronda: 5, auditados: 36, total: 196, porcentaje: 18.4 },
  { grupo: "G3", ronda: 1, auditados: 114, total: 199, porcentaje: 57 },
  { grupo: "G4", ronda: 1, auditados: 171, total: 201, porcentaje: 85 },
  { grupo: "G5", ronda: 1, auditados: 174, total: 200, porcentaje: 87 },
];
type Compliance = { name: string; value: number };

export const qualityData = dashboardDatabase.gestionCalidad;

// La API sincroniza dashboardDatabase después de cargar este módulo. Estas
// colecciones deben calcularse bajo demanda para no conservar copias vacías.
export const getAuditedByGroup = () =>
  sortDescendingByNumber(qualityData.auditadosPorGrupo as AuditedGroup[], (item) => item.auditados);
export const getCoverageByGroup = () => Array.isArray(qualityData.coberturaPorGrupo) && qualityData.coberturaPorGrupo.length > 0
  ? qualityData.coberturaPorGrupo as CoverageGroup[]
  : defaultCoverageByGroup;
export const getComplianceByGroup = () =>
  sortDescendingByNumber(qualityData.cumplimientoPorGrupo as Compliance[], (item) => item.value);
export const getComplianceByProcess = () =>
  sortDescendingByNumber(qualityData.cumplimientoPorProceso as Compliance[], (item) => item.value);
export const getCriticalFindings = (): Finding[] =>
  qualityData.hallazgosCriticos as Finding[];
