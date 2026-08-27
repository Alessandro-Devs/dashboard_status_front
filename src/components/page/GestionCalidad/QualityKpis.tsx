"use client";
import { AlertTriangle, BriefcaseBusiness, ClipboardCheck } from "lucide-react";
import { KpiCard } from "./DashboardUI";
import { qualityData } from "./qualityData";
export default function QualityKpis() {
    const { kpis } = qualityData;
    return <div className="mx-auto mt-5 grid w-full max-w-[900px] grid-cols-3 gap-3">
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#1976d2]"/>} iconBg="bg-[#e8f3ff]" title="Cobertura semanal"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#1670d2]">{kpis.auditados} de {kpis.universo}</span></div><p className="mt-3 text-[8px] text-[#8a9bb0]">Centros auditados del universo</p></div></KpiCard>
    <KpiCard icon={<ClipboardCheck className="h-4 w-4 text-[#168a4c]"/>} iconBg="bg-[#e7f8ee]" title="Cumplimiento"><div className="mt-1 text-[26px] font-semibold leading-none text-[#168a38]">{kpis.cumplimiento}%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Promedio de CE auditados</p></KpiCard>
    <KpiCard icon={<AlertTriangle className="h-4 w-4 text-[#ff5b62]"/>} iconBg="bg-[#fff0f0]" title="Hallazgos"><div className="mt-1 text-[26px] font-semibold leading-none text-[#f12424]">{kpis.hallazgos}</div><div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-[#8a9bb0]"><span><strong className="text-[#e33a3a]">{kpis.hallazgosMayor}</strong> Mayor</span><span><strong className="text-[#e78316]">{kpis.hallazgosMenor}</strong> Menor</span><span><strong className="text-[#1971d1]">{kpis.observaciones}</strong> Observaciones</span></div></KpiCard>
  </div>;
}
