import { AlertTriangle, BriefcaseBusiness, ClipboardCheck, Database } from "lucide-react";
import { CircularProgress, KpiCard } from "./DashboardUI";

export default function QualityKpis() {
  return <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#1976d2]" />} iconBg="bg-[#e8f3ff]" title="CE auditados"><div className="flex items-center justify-between"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#1670d2]">97</span><span className="text-sm font-semibold text-[#9aacc1]">/ 900</span></div><p className="mt-3 text-[9px] text-[#8a9bb0]">Centros auditados del universo</p></div><CircularProgress value={11} /></div></KpiCard>
    <KpiCard icon={<ClipboardCheck className="h-4 w-4 text-[#168a4c]" />} iconBg="bg-[#e7f8ee]" title="Cumplimiento promedio de CE auditados"><div className="mt-1 text-[26px] font-semibold leading-none text-[#168a38]">81%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Promedio de cumplimiento</p></KpiCard>
    <KpiCard icon={<AlertTriangle className="h-4 w-4 text-[#ff5b62]" />} iconBg="bg-[#fff0f0]" title="Hallazgos"><div className="mt-1 text-[26px] font-semibold leading-none text-[#f12424]">9</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Hallazgos identificados</p></KpiCard>
    <KpiCard icon={<Database className="h-4 w-4 text-[#ef9200]" />} iconBg="bg-[#fff4e5]" title="Componentes con hallazgos"><div className="mt-1 flex items-center gap-4 text-[26px] font-semibold leading-none text-[#ef8500]"><span>3</span><span className="font-light">/</span><span>7</span></div><p className="mt-3 text-[9px] text-[#8a9bb0]">Componentes afectados</p></KpiCard>
  </div>;
}
