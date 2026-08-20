"use client";

import { Layers3 } from "lucide-react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import LearningSummary from "./LearningSummary";
import LineProgressCard from "./LineProgressCard";
import { belongsToTrimester, getLearningLines } from "./learningData";

export default function LearningPage() {
  const {trimesters,learningLines:selectedLines}=useAuditFilters();
  const trimesterNumbers=trimesters.map(value=>Number(value.slice(1)));
  const lines=getLearningLines().filter(item=>(selectedLines.length===0||selectedLines.includes(item.id))&&(trimesterNumbers.length===0||trimesterNumbers.some(trimester=>belongsToTrimester(item,trimester))));
  const trimesterText=trimesters.length===0?"Todos los trimestres":trimesters.length===1?`Trimestre ${trimesters[0].slice(1)}`:`${trimesters.length} trimestres`;
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-6"><section><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold tracking-[.04em] text-[#253d53]">ESTADO DEL CONTENIDO LXP</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">Estado actual, pendientes y barreras por aplicativo</p></div><span className="mt-2 text-[8px] text-[#8fa1b5]">{trimesterText}</span></div><LearningSummary lines={lines}/></section><section className="mt-7"><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold tracking-[.04em] text-[#253d53]">DESARROLLO POR LÍNEA / APLICATIVO</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">Situación del contenido para el trimestre seleccionado</p></div><Layers3 className="h-4 w-4 text-[#8fa3b8]"/></div>{lines.length?<div className="mt-5 grid gap-4 lg:grid-cols-3">{lines.map(item=><LineProgressCard key={item.id} item={item}/>)}</div>:<div className="mt-5 rounded-lg border border-dashed bg-white px-5 py-12 text-center"><p className="text-[10px] font-semibold text-[#526a80]">Sin información para los filtros seleccionados</p><p className="mt-2 text-[8px] text-[#91a3b5]">Selecciona otro trimestre o aplicativo.</p></div>}</section></div></main>;
}
