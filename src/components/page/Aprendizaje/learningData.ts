export type LineProgress = { id: string; name: string; accent: "blue" | "purple" | "green"; authoring: number; authoringRange: string; production: number; productionRange: string; publication: number; publicationRange: string };
import { dashboardDatabase } from "@/data/dashboardDatabase";
export const lineProgress = dashboardDatabase.aprendizaje.lineas as LineProgress[];
