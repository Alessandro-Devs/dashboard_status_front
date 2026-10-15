"use client";

import { dashboardDatabase } from "@/data/dashboardDatabase";
import { readEditorial } from "@/lib/learningEditorial";

export type DashboardSection = {
  id: "gestion-calidad" | "gestion-escolar" | "aprendizaje" | "evaluacion" | "tutoria-formacion";
  label: "Gestión de Calidad" | "Gestión Escolar" | "Aprendizaje" | "Evaluación" | "Tutoría y Formación";
  description: string;
};

export const dashboardSections: DashboardSection[] = [
  { id: "gestion-calidad", label: "Gestión de Calidad", description: "Auditorías, cumplimiento y hallazgos" },
  { id: "gestion-escolar", label: "Gestión Escolar", description: "" },
  { id: "aprendizaje", label: "Aprendizaje", description: "" },
  { id: "evaluacion", label: "Evaluación", description: "" },
  { id: "tutoria-formacion", label: "Tutoría y Formación", description: "Accesos, modelamientos y tutoría virtual" },
];

const sectionReaders = {
  "gestion-calidad": () => dashboardDatabase.gestionCalidad,
  "gestion-escolar": () => dashboardDatabase.gestionEscolar,
  aprendizaje: () => dashboardDatabase.aprendizaje,
  evaluacion: () => dashboardDatabase.evaluacion,
  "tutoria-formacion": () => dashboardDatabase.tutoriaFormacion,
} satisfies Record<DashboardSection["id"], () => unknown>;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasMeaningfulData(value: unknown, visited = new WeakSet<object>()): boolean {
  if (value == null) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && trimmed !== "0";
  }
  if (typeof value === "number") return Number.isFinite(value) && value !== 0;
  if (typeof value === "boolean") return value === true;
  if (Array.isArray(value)) return value.some((item) => hasMeaningfulData(item, visited));
  if (!isObject(value)) return false;
  if (visited.has(value)) return false;
  visited.add(value);
  return Object.values(value).some((item) => hasMeaningfulData(item, visited));
}

// Aprendizaje muestra el flujo editorial (aprendizaje.editorial); la sección aparece cuando tiene datos.
function hasLearningData(value: unknown) {
  return isObject(value) && readEditorial(value.editorial) !== null;
}

const sectionAvailability = {
  "gestion-calidad": () => hasMeaningfulData(sectionReaders["gestion-calidad"]()),
  "gestion-escolar": () => hasMeaningfulData(sectionReaders["gestion-escolar"]()),
  aprendizaje: () => hasLearningData(sectionReaders.aprendizaje()),
  evaluacion: () => hasMeaningfulData(sectionReaders.evaluacion()),
  "tutoria-formacion": () => hasMeaningfulData(sectionReaders["tutoria-formacion"]()),
} satisfies Record<DashboardSection["id"], () => boolean>;

export function getAvailableDashboardSections() {
  return dashboardSections.filter((section) => sectionAvailability[section.id]());
}

export function getDefaultDashboardSectionLabel() {
  return getAvailableDashboardSections()[0]?.label ?? dashboardSections[0].label;
}
