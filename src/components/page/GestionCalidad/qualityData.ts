export type Finding = { title: string; description: string; component: string; magnitude: string; percentage: string; level: string };

export const auditedByBlock = [
  { name: "B1", value: 25 }, { name: "B2", value: 20 }, { name: "B3", value: 22 },
  { name: "B4", value: 18 }, { name: "B5", value: 12 },
];
export const complianceByBlock = [
  { name: "B1", value: 84 }, { name: "B2", value: 81 }, { name: "B3", value: 82 },
  { name: "B4", value: 79 }, { name: "B5", value: 77 },
];
export const relevanceData = [{ name: "NCM", value: 4 }, { name: "NCM-e", value: 3 }, { name: "Observación", value: 2 }];
export const findings: Finding[] = [
  { title: "Uso de tutores IA en clases de refuerzo", description: "No se evidencia promoción del uso de tutores IA durante las clases de refuerzo.", component: "Tutoría y formación", magnitude: "55 clases", percentage: "84.9%", level: "NCM" },
  { title: "Clases de refuerzo desfasadas", description: "La programación observada presenta desfases respecto al calendario establecido.", component: "Tutoría y formación", magnitude: "31 clases", percentage: "72.4%", level: "NCM" },
  { title: "Conectividad disponible para estudiantes", description: "Se identifican centros con limitaciones de conectividad durante las actividades.", component: "Conectividad", magnitude: "10 Centros Escolares", percentage: "61.5%", level: "NCM" },
  { title: "Registro de asistencia incompleto", description: "Los registros de asistencia presentan información incompleta.", component: "Gestión escolar", magnitude: "19 Centros Escolares", percentage: "48.7%", level: "NCM" },
];
