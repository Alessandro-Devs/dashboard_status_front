export type TestType = "cml" | "progreso";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { dashboardDatabase } from "@/data/dashboardDatabase";
export const blockData = dashboardDatabase.evaluacion.bloquesCentros as BlockItem[];
export const enrollmentData = dashboardDatabase.evaluacion.bloquesMatricula as BlockItem[];
export const universeComposition = dashboardDatabase.evaluacion.composicionUniverso;
export const trajectorySummary = dashboardDatabase.evaluacion.trayectoria;
