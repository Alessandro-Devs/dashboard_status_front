"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import FilterSelect from "./FilterSelect";
import LearningFilters from "./LearningFilters";
import PeriodFilter from "./PeriodFilter";
import TutoringFilters from "./TutoringFilters";

const navItems = ["Gestión de Calidad", "Gestión Escolar", "Aprendizaje", "Evaluación", "Tutoría y Formación"];
const viewBySection: Record<string,string> = { "Gestión de Calidad":"gestion-calidad", "Gestión Escolar":"gestion-escolar", Aprendizaje:"aprendizaje", Evaluación:"evaluacion", "Tutoría y Formación":"tutoria-formacion" };
const blocks = ["B1","B2","B3","B4","B5"].map((label) => ({id:label.toLowerCase(),label}));
const components = ["Conectividad","Infraestructura","Gestión escolar","Tutoría y formación","Calidad","Aprendizaje","Evaluación"].map((label) => ({id:label,label}));

export default function AuditReportHeader() {
  const state = useAuditFilters();
  const [navigating, setNavigating] = useState(false);
  const pathname = usePathname();
  const section = pathname.startsWith("/gestion-escolar") ? "Gestión Escolar" : state.activeSection;
  const school = section === "Gestión Escolar";
  const learning = section === "Aprendizaje";
  const evaluation = section === "Evaluación";
  const tutoring = section === "Tutoría y Formación";
  const title = tutoring ? "Tutoría y Formación" : evaluation ? "Avance en aplicación de pruebas" : learning ? "Avance de contenidos" : school ? "Gestión Escolar" : "Reporte de auditorías de Centros Escolares";
  const subtitle = tutoring ? "Seguimiento de accesos, modelamientos y tutoría virtual" : evaluation ? "Seguimiento de aplicación de CML y Prueba Progreso" : learning ? "Seguimiento de creación, producción y publicación de clases" : school ? "Seguimiento de gestión escolar" : "Todos los bloques";
  useEffect(() => {
    const finishNavigation = () => setNavigating(false);
    window.addEventListener("dashboard:arrived", finishNavigation);
    return () => window.removeEventListener("dashboard:arrived", finishNavigation);
  }, []);

  const navigate = (item:string) => {
    const view = viewBySection[item];
    setNavigating(true);
    window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: view } }));
    window.history.replaceState(null, "", `#${view}`);
    document.getElementById(view)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return <header className="w-full bg-[#0f273c] text-white">
    <nav aria-label="Navegación principal" className="audit-main-nav flex min-h-[34px] items-center gap-3 overflow-x-auto border-b border-[#24445d] bg-[#071a29] px-4">
      <div className="flex h-[34px] shrink-0 items-center gap-1">{navItems.map((item) => { const active=section===item; return <button key={item} type="button" aria-pressed={active} onClick={()=>navigate(item)} className={`relative flex h-full items-center whitespace-nowrap px-3 text-[11px] font-medium sm:px-5 ${active?"bg-[#102b40] text-white":"text-[#9ab0c2] hover:text-white"}`}>{item}{active&&<span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#59b8f8]"/>}</button>; })}</div>
      <p className="ml-auto hidden shrink-0 text-[9px] font-semibold uppercase lg:block">Modernización Educativa</p>
    </nav>
    <div aria-hidden={navigating} className={`audit-filter-bar mx-auto max-w-[1080px] flex-col gap-5 px-4 sm:px-6 lg:min-h-[92px] lg:flex-row lg:items-center lg:justify-between lg:gap-8 ${navigating ? "hidden" : "flex py-5 lg:py-3"}`}>
      <div><h1 className="font-serif text-xl font-bold sm:text-[25px]">{title}</h1><p className="mt-1 text-[11px] text-[#b8cada]">{subtitle}</p></div>
      <div className="audit-header-filters">{learning ? <LearningFilters/> : evaluation ? <PeriodFilter startDate={state.startDate} endDate={state.endDate} onApply={state.setPeriod}/> : tutoring ? <TutoringFilters/> : <div className="flex flex-wrap items-end gap-3">
        {school&&<PlatformFilters/>}<FilterSelect label="Bloque" selected={state.blocks} options={blocks} onChange={state.setBlocks} className="w-[92px]"/>{!school&&<FilterSelect label="Componente" selected={state.components} options={components} onChange={state.setComponents} className="w-[110px]"/>}<PeriodFilter startDate={state.startDate} endDate={state.endDate} onApply={state.setPeriod}/>
      </div>}</div>
    </div>
  </header>;
}

function PlatformFilters() {
  const { platforms, togglePlatform } = useAuditFilters();
  return <fieldset>
    <legend className="mb-1 block text-[8px] font-semibold uppercase text-[#b8cada]">Plataforma</legend>
    <div className="flex h-[29px] w-[180px] gap-1 rounded-md border border-[#40596e] bg-[#0b2235] p-0.5">
      {(["KIRA","IHFB"] as const).map((platform) => {
        const active = platforms.includes(platform);
        const onlySelected = active && platforms.length === 1;
        const color = platform === "KIRA"
          ? active ? "border-[#55a7f3] bg-[#1d5686] text-white shadow-[0_2px_8px_rgba(25,113,209,.28)]" : "border-transparent text-[#8fb5d6] hover:bg-[#16364f]"
          : active ? "border-[#a68af8] bg-[#59409a] text-white shadow-[0_2px_8px_rgba(117,68,244,.25)]" : "border-transparent text-[#b2a2df] hover:bg-[#21344d]";
        return <button
          key={platform}
          type="button"
          aria-pressed={active}
          aria-label={`${platform}: ${active ? "seleccionada" : "no seleccionada"}`}
          title={onlySelected ? "Debe permanecer al menos una plataforma seleccionada" : undefined}
          onClick={() => togglePlatform(platform)}
          className={`flex h-full min-w-0 flex-1 items-center justify-center gap-1.5 rounded border px-2 text-[9px] font-semibold transition-all duration-200 ${color}`}
        >
          <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${active ? "border-white/60 bg-white/15" : "border-[#647d92]"}`}>
            {active && <Check className="h-2.5 w-2.5" strokeWidth={3}/>} 
          </span>
          {platform}
        </button>;
      })}
    </div>
  </fieldset>;
}
