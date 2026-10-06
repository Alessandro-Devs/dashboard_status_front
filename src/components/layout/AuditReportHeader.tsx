"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { dashboardSections, getDefaultDashboardSectionLabel } from "@/lib/dashboardSections";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { useDashboardData } from "@/stores/DashboardDataContext";
import PeriodFilter from "./PeriodFilter";
import LoadingDataModal from "@/components/ui/LoadingDataModal";
import { withDateQuery } from "@/lib/dateQuery";
import { hasActiveSession, subscribeToSession } from "@/lib/session";
import { LayoutDashboard } from "lucide-react";

const viewBySection: Record<string, string> = {
  "Gestión de Calidad": "gestion-calidad",
  "Gestión Escolar": "gestion-escolar",
  Aprendizaje: "aprendizaje",
  Evaluación: "evaluacion",
  "Tutoría y Formación": "tutoria-formacion",
};

const subscribeToHydration = () => () => undefined;

export default function AuditReportHeader() {
  const state = useAuditFilters();
  const { availableSections, isLoading, resolvedDate } = useDashboardData();
  const [, setNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const visibleSections = hydrated ? availableSections : dashboardSections;
  const navItems = visibleSections.map((section) => section.label);
  const fallbackSection = navItems[0] ?? getDefaultDashboardSectionLabel();
  const rawSection = !hydrated
    ? fallbackSection
    : pathname.startsWith("/gestion-escolar")
      ? "Gestión Escolar"
      : state.activeSection;
  const section = (navItems.includes(rawSection as (typeof navItems)[number]) ? rawSection : fallbackSection) as (typeof navItems)[number];
  const school = section === "Gestión Escolar";
  const learning = section === "Aprendizaje";
  const evaluation = section === "Evaluación";
  const tutoring = section === "Tutoría y Formación";
  const title = tutoring
    ? "Tutoría y Formación"
    : evaluation
      ? "Evaluación"
      : learning
        ? "Aprendizaje"
        : school
          ? "Gestión Escolar"
          : "Gestión de Calidad";

  useEffect(() => {
    const finishNavigation = () => setNavigating(false);
    window.addEventListener("dashboard:arrived", finishNavigation);
    return () => window.removeEventListener("dashboard:arrived", finishNavigation);
  }, []);

  const navigate = (item: string) => {
    const view = viewBySection[item];
    if (!view) return;

    setNavigating(true);
    state.setActiveSection(item);

    if (pathname !== "/") {
      router.push(withDateQuery(`/#${view}`));
      return;
    }

    window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: view } }));
    window.history.replaceState(window.history.state, "", withDateQuery(`/#${view}`));

    requestAnimationFrame(() => {
      const target = document.getElementById(view);
      const header = document.querySelector<HTMLElement>(".mobile-header");
      if (!target) return;

      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const targetTop = window.scrollY + target.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(targetTop - headerHeight, 0), behavior: "smooth" });
    });
  };

  // Con sesión activa del panel se muestra el acceso directo a Administración.
  const loggedIn = useSyncExternalStore(subscribeToSession, hasActiveSession, () => false);

  const sectionNumber = String(Math.max(navItems.indexOf(section), 0) + 1).padStart(2, "0");

  return (
    <>
      <header className="w-full bg-[#0f273c] text-white">
        <nav
          aria-label="Navegación principal"
          className="audit-main-nav flex min-h-[34px] items-center gap-3 overflow-x-auto border-b border-[#24445d] bg-[#071a29] px-4"
        >
          <div className="flex h-[34px] shrink-0 items-center gap-1">
            {navItems.map((item) => {
              const active = section === item;

              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => navigate(item)}
                  className={`relative flex h-full cursor-pointer items-center whitespace-nowrap px-3 text-[11px] font-medium sm:px-5 ${
                    active ? "bg-[#102b40] text-white" : "text-[#9ab0c2] hover:text-white"
                  }`}
                >
                  {item}
                  {active ? (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#59b8f8]" />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {loggedIn ? (
              <button
                type="button"
                onClick={() => router.push("/administracion")}
                className="flex h-[24px] cursor-pointer items-center gap-1.5 rounded-md border border-[#2f5470] bg-[#102b40] px-2.5 text-[10px] font-semibold text-white transition hover:border-[#59b8f8] hover:bg-[#15354e]"
              >
                <LayoutDashboard className="h-3 w-3 text-[#75c4fa]" />
                Ir al panel
              </button>
            ) : null}
            <p className="hidden text-[9px] font-semibold uppercase lg:block">
              Modernización Educativa
            </p>
          </div>
        </nav>

        <div className="mx-auto flex min-h-[36px] max-w-[1080px] items-center gap-3 px-4 py-1 sm:px-6">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#49647a] bg-[#17364d] text-[8px] font-bold text-[#75c4fa]">
            {sectionNumber}
          </span>
          <h1 className="truncate text-[11px] font-bold uppercase tracking-[.08em]">{title}</h1>
          <PeriodFilter date={state.endDate} onApply={(date: string) => state.setPeriod(date, date)} />
        </div>
      </header>

      {/* Carga inicial (sin fecha resuelta aún) y cambios de fecha usan el mismo modal. */}
      {isLoading ? <LoadingDataModal key={state.endDate} date={resolvedDate !== null ? state.endDate : undefined} /> : null}
    </>
  );
}
