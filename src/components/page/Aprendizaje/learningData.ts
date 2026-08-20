import { dashboardDatabase } from "@/data/dashboardDatabase";

export type LearningStatus = {
  trimestre?: number;
  estado?: string;
  trimestrePublicado?: number;
  trimestreEnProceso?: number;
  hastaClase: number;
  descripcion: string;
};
export type LearningLine = {
  id: string;
  name: string;
  accent: "blue" | "purple" | "green";
  estatus: LearningStatus;
  pendiente: { title: string; description: string };
  barrera: { title: string; description: string; tiempoPorClase?: { minHoras:number;maxHoras:number;descripcion:string } };
};

export const getLearningLines = () =>
  dashboardDatabase.aprendizaje.estadoLxp as LearningLine[];
export function belongsToTrimester(line: LearningLine, trimester: number) {
  return line.estatus.trimestre === trimester || line.estatus.trimestrePublicado === trimester || line.estatus.trimestreEnProceso === trimester;
}
