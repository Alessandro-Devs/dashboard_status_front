"use client";

import { BookOpen, Layers3 } from "lucide-react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import LearningSummary from "./LearningSummary";
import LineProgressCard from "./LineProgressCard";
import { lineProgress } from "./learningData";

export default function LearningPage() {
  const { trimesters, learningLines } = useAuditFilters();
  const lines=learningLines.length===0?lineProgress:lineProgress.filter((item)=>learningLines.includes(item.id));
  const trimesterText=trimesters.length===0?"Todos los trimestres":trimesters.length===1?`Trimestre ${trimesters[0].slice(1)}`:`${trimesters.length} trimestres`;
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-6"><section><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold tracking-[.04em] text-[#253d53]">ESTADO DEL CONTENIDO</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">Avance de las etapas de desarrollo de clases</p></div><span className="mt-2 text-[8px] text-[#8fa1b5]">{trimesterText}</span></div><LearningSummary lines={lines} /></section><section className="mt-7"><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold tracking-[.04em] text-[#253d53]">DESARROLLO POR LÍNEA / APLICATIVO</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">Porcentaje de avance y rango de clases desarrolladas</p></div><Layers3 className="h-4 w-4 text-[#8fa3b8]" /></div><div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">{lines.map((item)=><LineProgressCard key={item.id} item={item} />)}</div><div className="mt-5 flex items-start gap-3 rounded-lg border border-[#d8e0e8] bg-white px-4 py-3"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf3ff]"><BookOpen className="h-4 w-4 text-[#1971d1]" /></span><div><p className="text-[8px] font-semibold text-[#40596f]">Avance de desarrollo</p><p className="mt-1 text-[7px] leading-4 text-[#8fa1b5]">Los porcentajes representan el avance de cada etapa sobre las clases correspondientes al trimestre seleccionado. El rango muestra el tramo de contenido desarrollado.</p></div></div></section></div></main>;
}
