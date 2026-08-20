"use client";

import { useEffect, useRef } from "react";
import LearningPage from "@/components/page/Aprendizaje/LearningPage";
import EvaluationPage from "@/components/page/Evaluacion/EvaluationPage";
import AuditReportPage from "@/components/page/GestionCalidad/AuditReportPage";
import SchoolNoAccessDashboard from "@/components/page/GestionEscolar/SchoolNoAccessDashboard";
import TutoringAndTrainingPage from "@/components/page/TutoriaFormacion/TutoringAndTrainingPage";
import { SectionFilters } from "@/components/layout/AuditReportHeader";
import { dashboardSections } from "@/lib/dashboardSections";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { useDashboardData } from "@/stores/DashboardDataContext";

const sectionContent = {
  "gestion-calidad": <AuditReportPage />,
  "gestion-escolar": <SchoolNoAccessDashboard />,
  aprendizaje: <LearningPage />,
  evaluacion: <EvaluationPage />,
  "tutoria-formacion": <TutoringAndTrainingPage />,
} as const;

export default function AllDashboardSections() {
  const { setActiveSection } = useAuditFilters();
  const { availableSections, hasData, isLoading, snapshotDate, error } = useDashboardData();
  const pendingSection = useRef<{ id: string; direction: "up" | "down" } | null>(null);
  const sections = hasData ? availableSections : dashboardSections;

  useEffect(() => {
    if (sections.length === 0) return;

    const beginNavigation = (event: Event) => {
      const id = (event as CustomEvent<{ id: string }>).detail?.id;
      const target = id ? document.getElementById(id) : null;
      if (id && target) {
        pendingSection.current = {
          id,
          direction: target.getBoundingClientRect().top >= 190 ? "down" : "up",
        };
      }
    };

    const updateActiveSection = () => {
      const header = document.querySelector<HTMLElement>(".mobile-header");
      const marker = (header?.getBoundingClientRect().height ?? 0) + 4;

      if (pendingSection.current) {
        const pending = pendingSection.current;
        const target = document.getElementById(pending.id);
        const targetTop = target?.getBoundingClientRect().top;
        const arrived = targetTop !== undefined && (
          pending.direction === "down"
            ? targetTop <= marker + 60
            : targetTop >= marker - 60
        );
        if (target && arrived) {
          const arrivedId = pending.id;
          const arrived = sections.find((section) => section.id === arrivedId);
          pendingSection.current = null;
          if (arrived) setActiveSection(arrived.label);
          window.dispatchEvent(new CustomEvent("dashboard:arrived", { detail: { id: arrivedId } }));
        }
        return;
      }

      let current = sections[0];

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= marker) current = section;
      }

      setActiveSection(current.label);
      if (window.location.hash !== `#${current.id}` || window.location.search) {
        window.history.replaceState(null, "", `/#${current.id}`);
      }
    };

    updateActiveSection();
    window.addEventListener("dashboard:navigate", beginNavigation);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("dashboard:navigate", beginNavigation);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sections, setActiveSection]);

  if (!hasData) {
    return <EmptyDashboardState message={isLoading ? "Consultando los datos para la fecha seleccionada..." : error ?? undefined} />;
  }

  if (sections.length === 0) {
    return <EmptyDashboardState message="No existen secciones con datos para la fecha seleccionada." />;
  }

  return <>{sections.map((section) => (
    <section key={`${section.id}-${snapshotDate ?? "loading"}`} id={section.id} aria-label={section.label} className="scroll-mt-[150px]">
      <div className="border-y border-[#d9e1e8] bg-[#eef3f8]">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3 px-4 py-3 text-[#526a80] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#29445b]">{section.id === "gestion-calidad" ? "Gestión Calidad" : section.label}</h2>
            {section.id !== "gestion-calidad" && <p className="mt-0.5 text-[9px] text-[#8296a8]">{section.description}</p>}
          </div>
          {section.id === "aprendizaje" && <SectionFilters section={section.label} />}
        </div>
      </div>
      {sectionContent[section.id]}
    </section>
  ))}</>;
}

function EmptyDashboardState({ message }: { message?: string }) {
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Indicadores", "Avance", "Registros", "Resultados"].map((title) => (
          <article key={title} className="min-h-[110px] rounded-lg border border-[#d7e0e8] bg-white p-4">
            <p className="text-[8px] font-semibold uppercase tracking-[.04em] text-[#71869a]">{title}</p>
            <p className="mt-4 text-2xl font-semibold text-[#8b9cad]">0</p>
            <p className="mt-3 text-[8px] text-[#9aabba]">Sin datos para el periodo</p>
          </article>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-10 text-center">
        <p className="text-[11px] font-semibold text-[#526a80]">Dashboard</p>
        <p className="mt-2 text-[9px] text-[#8b9daf]">{message ?? "No existen registros para la fecha seleccionada."}</p>
      </div>
    </div>
  </main>;
}
