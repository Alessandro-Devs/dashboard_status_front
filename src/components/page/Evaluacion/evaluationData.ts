export type TestType = "cml" | "progreso";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
import { getEvaluacion } from "./evaluationViewData";
export const getBlockData=():BlockItem[]=>(getEvaluacion().detallePorBloque?.centrosEscolares??[]).map(i=>({block:i.bloque,applied:i.aplicados,pending:i.pendientes,universe:i.universo,percentage:i.porcentaje}));
export const getEnrollmentData=():BlockItem[]=>(getEvaluacion().detallePorBloque?.matricula??[]).map(i=>({block:i.bloque,applied:i.aplicados,pending:i.pendientes,universe:i.universo,percentage:i.porcentaje}));
