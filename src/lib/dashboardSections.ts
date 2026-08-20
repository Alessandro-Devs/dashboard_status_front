"use client";

import { dashboardDatabase } from "@/data/dashboardDatabase";

export type DashboardSection = {
  id: "gestion-calidad" | "gestion-escolar" | "aprendizaje" | "evaluacion" | "tutoria-formacion";
  label: "Gestión de Calidad" | "Gestión Escolar" | "Aprendizaje" | "Evaluación" | "Tutoría y Formación";
  description: string;
};

export const dashboardSections: DashboardSection[] = [
  { id: "gestion-calidad", label: "Gestión de Calidad", description: "Auditorías, cumplimiento y hallazgos" },
  { id: "gestion-escolar", label: "Gestión Escolar", description: "Seguimiento de no accesos" },
  { id: "aprendizaje", label: "Aprendizaje", description: "Avance y producción de contenidos" },
  { id: "evaluacion", label: "Evaluación", description: "Aplicación y resultados de pruebas" },
  { id: "tutoria-formacion", label: "Tutoría y Formación", description: "Accesos, modelamientos y tutoría virtual" },
];

const sectionReaders = {
  "gestion-calidad": () => dashboardDatabase.gestionCalidad,
  "gestion-escolar": () => dashboardDatabase.gestionEscolar,
  aprendizaje: () => dashboardDatabase.aprendizaje,
  evaluacion: () => dashboardDatabase.evaluacion,
  "tutoria-formacion": () => dashboardDatabase.tutoriaFormacion,
} satisfies Record<DashboardSection["id"], () => unknown>;

function hasMeaningfulData(value: unknown, visited = new WeakSet<object>()): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulData(item, visited));
  if (typeof value !== "object") return false;
  if (visited.has(value)) return false;
  visited.add(value);
  return Object.values(value).some((item) => hasMeaningfulData(item, visited));
}

export function getAvailableDashboardSections() {
  return dashboardSections.filter((section) => hasMeaningfulData(sectionReaders[section.id]()));
}

export function getDefaultDashboardSectionLabel() {
  return getAvailableDashboardSections()[0]?.label ?? dashboardSections[0].label;
}
