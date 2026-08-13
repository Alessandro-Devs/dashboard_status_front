import { dashboardDatabase } from "@/data/dashboardDatabase";

export const projectSchoolsTable = dashboardDatabase.gestionEscolar.centrosProyecto as [string, string, string, number][];
export const projectSchoolsChart = projectSchoolsTable.map(([block, phase, status, value]) => ({
  name: `${block} - ${String(phase).replace("Fase ", "F")} ${status}`,
  value,
}));
