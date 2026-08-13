import { AlertTriangle, BriefcaseBusiness, ClipboardCheck, Layers3 } from "lucide-react";
import { CircularProgress, KpiCard } from "./DashboardUI";
import { qualityData } from "./qualityData";

export default function QualityKpis() {
  const { kpis } = qualityData;
  return <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#1976d2]" />} iconBg="bg-[#e8f3ff]" title="Grupos"><div className="flex items-center justify-between"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#1670d2]">{kpis.grupos}</span></div><p className="mt-3 text-[9px] font-semibold text-[#60778d]">{kpis.auditados} de {kpis.universo}</p><p className="mt-1 text-[8px] text-[#8a9bb0]">Centros auditados del universo</p></div><CircularProgress value={kpis.cobertura} /></div></KpiCard>
    <KpiCard icon={<ClipboardCheck className="h-4 w-4 text-[#168a4c]" />} iconBg="bg-[#e7f8ee]" title="Cumplimiento promedio"><div className="mt-1 text-[26px] font-semibold leading-none text-[#168a38]">{kpis.cumplimiento}%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Promedio de CE auditados</p></KpiCard>
    <KpiCard icon={<AlertTriangle className="h-4 w-4 text-[#ff5b62]" />} iconBg="bg-[#fff0f0]" title="Hallazgos"><div className="mt-1 text-[26px] font-semibold leading-none text-[#f12424]">{kpis.hallazgos}</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Hallazgos identificados</p></KpiCard>
    <KpiCard icon={<Layers3 className="h-4 w-4 text-[#ef9200]" />} iconBg="bg-[#fff4e5]" title="Cobertura"><div className="mt-1 text-[26px] font-semibold leading-none text-[#ef8500]">{kpis.cobertura}%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Cobertura de centros escolares</p></KpiCard>
  </div>;
}
