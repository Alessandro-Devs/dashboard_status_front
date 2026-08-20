export type TestType = "cml" | "progreso";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { parsePercentageValue, sortDescendingByNumber } from "@/lib/sortByPercentage";

export const blockData = sortDescendingByNumber(dashboardDatabase.evaluacion.bloquesCentros as BlockItem[], (item) => item.percentage);
export const enrollmentData = sortDescendingByNumber(dashboardDatabase.evaluacion.bloquesMatricula as BlockItem[], (item) => item.percentage);
export const universeComposition = {
  lengua: {
    total: sortDescendingByNumber(dashboardDatabase.evaluacion.composicionUniverso.lengua.total, (item) => item.percentage),
    grupos: Object.fromEntries(
      Object.entries(dashboardDatabase.evaluacion.composicionUniverso.lengua.grupos).map(([key, value]) => [
        key,
        sortDescendingByNumber(value, (item) => item.percentage),
      ]),
    ),
  },
  matematica: {
    total: sortDescendingByNumber(dashboardDatabase.evaluacion.composicionUniverso.matematica.total, (item) => item.percentage),
    grupos: Object.fromEntries(
      Object.entries(dashboardDatabase.evaluacion.composicionUniverso.matematica.grupos).map(([key, value]) => [
        key,
        sortDescendingByNumber(value, (item) => item.percentage),
      ]),
    ),
  },
};
export const trajectorySummary = sortDescendingByNumber(dashboardDatabase.evaluacion.trayectoria, (item) => parsePercentageValue(item.percentage));
