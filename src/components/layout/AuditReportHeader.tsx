"use client";

import { usePathname, useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import FilterSelect from "./FilterSelect";
import LearningFilters from "./LearningFilters";
import PeriodFilter from "./PeriodFilter";
import TutoringFilters from "./TutoringFilters";

const navItems = ["Gestión de Calidad", "Gestión Escolar", "Aprendizaje", "Evaluación", "Tutoría y Formación"];
const viewBySection: Record<string,string> = { "Gestión de Calidad":"gestion-calidad", "Gestión Escolar":"gestion-escolar", Aprendizaje:"aprendizaje", Evaluación:"evaluacion", "Tutoría y Formación":"tutoria-formacion" };
const blocks = ["B1","B2","B3","B4","B5"].map((label) => ({id:label.toLowerCase(),label}));
const components = ["Conectividad","Infraestructura","Gestión escolar","Tutoría y formación","Calidad","Aprendizaje","Evaluación"].map((label) => ({id:label,label}));
const subscribeToHydration = () => () => undefined;

export default function AuditReportHeader() {
  const state = useAuditFilters();
  const [, setNavigating] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
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
  useEffect(() => {
    const finishNavigation = () => setNavigating(false);
    window.addEventListener("dashboard:arrived", finishNavigation);
    return () => window.removeEventListener("dashboard:arrived", finishNavigation);
  }, []);

  const navigate = (item:string) => {
    const view = viewBySection[item];
    setNavigating(true);
    state.setActiveSection(item);

    // Las vistas de detalle no contienen las secciones del landing. Al navegar
    // desde una de ellas, primero volvemos al landing en la sección solicitada.
    if (pathname !== "/") {
      router.push(`/#${view}`);
      return;
    }

    window.dispatchEvent(new CustomEvent("dashboard:navigate", { detail: { id: view } }));
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

  const sectionNumber = String(navItems.indexOf(section) + 1).padStart(2, "0");
  return <header className="w-full bg-[#0f273c] text-white">
    <nav aria-label="Navegación principal" className="audit-main-nav flex min-h-[34px] items-center gap-3 overflow-x-auto border-b border-[#24445d] bg-[#071a29] px-4">
      <div className="flex h-[34px] shrink-0 items-center gap-1">{navItems.map((item) => { const active=section===item; return <button key={item} type="button" aria-pressed={active} onClick={()=>navigate(item)} className={`relative flex h-full items-center whitespace-nowrap px-3 text-[11px] font-medium sm:px-5 ${active?"bg-[#102b40] text-white":"text-[#9ab0c2] hover:text-white"}`}>{item}{active&&<span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#59b8f8]"/>}</button>; })}</div>
      <p className="ml-auto hidden shrink-0 text-[9px] font-semibold uppercase lg:block">Modernización Educativa</p>
    </nav>
    <div className="mx-auto flex min-h-[36px] max-w-[1080px] items-center gap-3 px-4 py-1 sm:px-6">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#49647a] bg-[#17364d] text-[8px] font-bold text-[#75c4fa]">{sectionNumber}</span>
      <h1 className="truncate text-[11px] font-bold uppercase tracking-[.08em]">{title}</h1>
    </div>
  </header>;
}

export function SectionFilters({ section }: { section:string }) {
  const state = useAuditFilters();
  const school=section==="Gestión Escolar"; const learning=section==="Aprendizaje"; const evaluation=section==="Evaluación"; const tutoring=section==="Tutoría y Formación";
  return <div className="audit-filter-bar audit-header-filters">{learning ? <LearningFilters/> : evaluation ? <div className="flex flex-wrap items-end gap-3"><FilterSelect label="Bloque" selected={state.blocks} options={blocks} onChange={state.setBlocks} className="w-[92px]"/><PeriodFilter startDate={state.startDate} endDate={state.endDate} onApply={state.setPeriod}/></div> : tutoring ? <TutoringFilters/> : <div className="flex flex-wrap items-end gap-3">{school&&<PlatformFilters/>}<FilterSelect label="Bloque" selected={state.blocks} options={blocks} onChange={state.setBlocks} className="w-[92px]"/>{!school&&<FilterSelect label="Componente" selected={state.components} options={components} onChange={state.setComponents} className="w-[110px]"/>}<PeriodFilter startDate={state.startDate} endDate={state.endDate} onApply={state.setPeriod}/></div>}</div>;
}

function PlatformFilters() {
  const { platforms, togglePlatform } = useAuditFilters();
  return <fieldset><legend className="mb-1 block text-[8px] font-semibold uppercase text-[#61788c]">Plataforma</legend><div className="flex h-[29px] w-[180px] gap-1 rounded-md border border-[#c7d3de] bg-white p-0.5">{(["KIRA","IHFB"] as const).map((platform) => { const active=platforms.includes(platform); return <button key={platform} type="button" aria-pressed={active} onClick={()=>togglePlatform(platform)} className={`flex min-w-0 flex-1 items-center justify-center gap-1 rounded border px-2 text-[9px] font-semibold ${active?(platform==="KIRA"?"border-[#55a7f3] bg-[#eaf4ff] text-[#176fc8]":"border-[#a68af8] bg-[#f1edff] text-[#7142d8]"):"border-transparent text-[#8295a7]"}`}><span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${active?"border-current":"border-[#9eafbd]"}`}>{active&&<Check className="h-2.5 w-2.5" strokeWidth={3}/>}</span>{platform}</button>; })}</div></fieldset>;
}
