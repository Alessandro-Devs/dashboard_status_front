"use client";
<<<<<<< Updated upstream
import { AlertTriangle, BriefcaseBusiness, ClipboardCheck, Layers3 } from "lucide-react";
import { CircularProgress, KpiCard } from "./DashboardUI";
import { qualityData } from "./qualityData";
export default function QualityKpis() {
    const { kpis } = qualityData;
    return <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#1976d2]"/>} iconBg="bg-[#e8f3ff]" title="Grupos"><div className="flex items-center justify-between"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#1670d2]">{kpis.grupos}</span></div><p className="mt-3 text-[9px] font-semibold text-[#60778d]">{kpis.auditados} de {kpis.universo}</p><p className="mt-1 text-[8px] text-[#8a9bb0]">Centros auditados del universo</p></div><CircularProgress value={kpis.cobertura}/></div></KpiCard>
=======
import { AlertTriangle, BriefcaseBusiness, ClipboardCheck } from "lucide-react";
import { KpiCard } from "./DashboardUI";
import { getCoverageByGroup, qualityData } from "./qualityData";


export default function QualityKpis() {
  const { kpis } = qualityData;
  const coverageData = getCoverageByGroup();
  const coberturaAcumulada = coverageData.reduce((sum, item) => sum + Number(item.auditados || 0), 0);
  const universoAcumulado = coverageData.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const porcentajeSemanal = Number(kpis.universo) > 0 ? Math.round((Number(kpis.auditados) / Number(kpis.universo)) * 10000) / 100 : 0;
  const porcentajeAcumulado = universoAcumulado > 0 ? Math.round((coberturaAcumulada / universoAcumulado) * 10000) / 100 : 0;
  return <div className="mt-5 grid w-full grid-cols-1 gap-3 md:grid-cols-4">
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#1976d2]"/>} iconBg="bg-[#e8f3ff]" title="Cobertura semanal"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#1670d2]">{Number(kpis.auditados).toLocaleString("es-SV")}</span><span className="text-[15px] font-medium leading-none text-[#6f879d]">de {Number(kpis.universo).toLocaleString("es-SV")}</span></div><p className="mt-2 text-[15px] font-semibold leading-none text-[#1670d2]">{porcentajeSemanal}%</p><p className="mt-2 text-[8px] text-[#8a9bb0]">Centros auditados del universo</p></div></KpiCard>
    <KpiCard icon={<BriefcaseBusiness className="h-4 w-4 text-[#7544f4]"/>} iconBg="bg-[#f2ecff]" title="Cobertura acumulada"><div><div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none text-[#7544f4]">{coberturaAcumulada.toLocaleString("es-SV")}</span><span className="text-[15px] font-medium leading-none text-[#806bb6]">de {universoAcumulado.toLocaleString("es-SV")}</span></div><p className="mt-2 text-[15px] font-semibold leading-none text-[#7544f4]">{porcentajeAcumulado}%</p><p className="mt-2 text-[8px] text-[#8a9bb0]">Suma de auditados y universo de cobertura acumulada</p></div></KpiCard>
>>>>>>> Stashed changes
    <KpiCard icon={<ClipboardCheck className="h-4 w-4 text-[#168a4c]"/>} iconBg="bg-[#e7f8ee]" title="Cumplimiento"><div className="mt-1 text-[26px] font-semibold leading-none text-[#168a38]">{kpis.cumplimiento}%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Promedio de CE auditados</p></KpiCard>
    <KpiCard icon={<AlertTriangle className="h-4 w-4 text-[#ff5b62]"/>} iconBg="bg-[#fff0f0]" title="Hallazgos"><div className="mt-1 text-[26px] font-semibold leading-none text-[#f12424]">{kpis.hallazgos}</div><div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-[#8a9bb0]"><span><strong className="text-[#e33a3a]">{kpis.hallazgosMayor}</strong> Mayor</span><span><strong className="text-[#e78316]">{kpis.hallazgosMenor}</strong> Menor</span><span><strong className="text-[#1971d1]">{kpis.observaciones}</strong> Observaciones</span></div></KpiCard>
    <KpiCard icon={<Layers3 className="h-4 w-4 text-[#ef9200]"/>} iconBg="bg-[#fff4e5]" title="Cobertura"><div className="mt-1 text-[26px] font-semibold leading-none text-[#ef8500]">{kpis.cobertura}%</div><p className="mt-3 text-[9px] text-[#8a9bb0]">Del universo total de {kpis.universo} CE</p></KpiCard>
  </div>;
}
