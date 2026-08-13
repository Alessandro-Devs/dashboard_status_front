"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import LearningFilters from "./LearningFilters";

const navItems = ["Gestión de Calidad", "Gestión Escolar", "Aprendizaje", "Evaluación", "Tutoría y Formación"];
const viewBySection: Record<string,string> = { "Gestión de Calidad":"gestion-calidad", "Gestión Escolar":"gestion-escolar", Aprendizaje:"aprendizaje", Evaluación:"evaluacion", "Tutoría y Formación":"tutoria-formacion" };
const subscribeToHydration = () => () => undefined;

export default function AuditReportHeader() {
  const state = useAuditFilters();
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  const hydrated = useSyncExternalStore(subscribeToHydration, () => true, () => false);
  const section = !hydrated
    ? "Gestión de Calidad"
    : pathname.startsWith("/gestion-escolar")
      ? "Gestión Escolar"
      : state.activeSection;
  const school = section === "Gestión Escolar";
  const learning = section === "Aprendizaje";
  const evaluation = section === "Evaluación";
  const tutoring = section === "Tutoría y Formación";
  const title = tutoring ? "Tutoría y Formación" : evaluation ? "Evaluación" : learning ? "Aprendizaje" : school ? "Gestión Escolar" : "Gestión de Calidad";
  const subtitle = tutoring ? "Seguimiento de accesos, modelamientos y tutoría virtual" : evaluation ? "Seguimiento de aplicación de CML" : learning ? "Seguimiento de creación, producción y publicación de clases" : school ? "Seguimiento de gestión escolar" : "Todos los bloques";
  useEffect(() => {
    const finishNavigation = () => setNavigating(false);
    window.addEventListener("dashboard:arrived", finishNavigation);
    return () => window.removeEventListener("dashboard:arrived", finishNavigation);
  }, []);

  const navigate = (item:string) => {
    const view = viewBySection[item];
    setNavigating(true);
    window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: view } }));
    state.setActiveSection(item);
    window.history.replaceState(null, "", `/#${view}`);
    requestAnimationFrame(() => {
      const target = document.getElementById(view);
      const header = document.querySelector<HTMLElement>(".mobile-header");
      if (!target) return;
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const targetTop = window.scrollY + target.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(targetTop - headerHeight, 0), behavior: "smooth" });
    });
  };

  return <header className="w-full bg-[#0f273c] text-white">
    <nav aria-label="Navegación principal" className="audit-main-nav flex min-h-[34px] items-center gap-3 overflow-x-auto border-b border-[#24445d] bg-[#071a29] px-4">
      <div className="flex h-[34px] shrink-0 items-center gap-1">{navItems.map((item) => { const active=section===item; return <button key={item} type="button" aria-pressed={active} onClick={()=>navigate(item)} className={`relative flex h-full items-center whitespace-nowrap px-3 text-[11px] font-medium sm:px-5 ${active?"bg-[#102b40] text-white":"text-[#9ab0c2] hover:text-white"}`}>{item}{active&&<span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#59b8f8]"/>}</button>; })}</div>
      <p className="ml-auto hidden shrink-0 text-[9px] font-semibold uppercase lg:block">Modernización Educativa</p>
    </nav>
    <div aria-hidden={navigating} className={`audit-filter-bar mx-auto flex max-w-[1080px] flex-col gap-5 px-4 py-5 sm:px-6 lg:min-h-[92px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:py-3 ${navigating ? "invisible pointer-events-none" : "visible"}`}>
      <div><h1 className="font-serif text-xl font-bold sm:text-[25px]">{title}</h1><p className="mt-1 text-[11px] text-[#b8cada]">{subtitle}</p></div>
      {learning && <div className="audit-header-filters"><LearningFilters/></div>}
    </div>
  </header>;
}
