"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useAuditFilters } from "@/stores/AuditFiltersContext";

const sectionByView: Record<string, string> = {
  "gestion-calidad": "Gestión de Calidad",
  "gestion-escolar": "Gestión Escolar",
  aprendizaje: "Aprendizaje",
  evaluacion: "Evaluación",
  "tutoria-formacion": "Tutoría y Formación",
};

const descriptionBySection: Record<string, string> = {
  "Gestión de Calidad": "Datos de auditoría de Centros Escolares",
  "Gestión Escolar": "Datos de gestión escolar de Centros Escolares",
  Aprendizaje: "Datos de avance y producción de contenidos",
  Evaluación: "Datos de aplicación de evaluaciones",
  "Tutoría y Formación": "Datos de tutoría y formación",
};

export default function GlobalFooter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeSection } = useAuditFilters();
  const routeSection = pathname.startsWith("/gestion-escolar")
    ? "Gestión Escolar"
    : sectionByView[searchParams.get("view") ?? ""];
  const section = routeSection ?? activeSection;

  return (
    <footer className="mt-auto border-t border-[#d9e1e8] bg-[#f7f9fc]">
      <div className="mx-auto flex min-h-[54px] w-full max-w-[1640px] flex-col items-center justify-center gap-2 px-4 py-3 text-center text-[10px] text-[#8aa0c5] sm:flex-row sm:justify-between sm:px-6 sm:text-left">
        <span>{descriptionBySection[section] ?? descriptionBySection["Gestión de Calidad"]}</span>
        <span>Uso institucional</span>
      </div>
    </footer>
  );
}
