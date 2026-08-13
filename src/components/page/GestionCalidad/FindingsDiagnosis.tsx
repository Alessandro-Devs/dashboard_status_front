"use client";

import { AlertTriangle, Layers3 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { CardTitle, DashboardCard, SectionHeader } from "./DashboardUI";
import FindingsTable from "./FindingsTable";
import { findings, relevanceData } from "./qualityData";
import { useAuditFilters } from "@/stores/AuditFiltersContext";

const components = [["Tutoría y formación", "6"], ["Conectividad", "1"], ["Clases de refuerzo", "0"], ["Gestión escolar", "2"], ["Materiales", "0"], ["Acompañamiento", "0"]];
const legend = [["#e52626", "NCM", "4", "44%"], ["#de7800", "NCM-e", "3", "33%"], ["#1d70c9", "Observación", "2", "22%"]];

export default function FindingsDiagnosis() {
  const { components: selectedComponents } = useAuditFilters();
  const visibleFindings = selectedComponents.length ? findings.filter((item) => selectedComponents.includes(item.component)) : findings;
  return <><div className="mt-7"><SectionHeader title="DIAGNÓSTICO DE HALLAZGOS" subtitle="Relevancia y principales indicadores observados" /></div><div className="mt-5"><DashboardCard><CardTitle title="Hallazgos por componente" subtitle="Número de indicadores con hallazgos identificados" icon={<Layers3 className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{components.map(([title, value]) => <div key={title} className="min-h-[72px] rounded-md border border-[#dce4ec] px-3 py-3"><p className="truncate text-[8px] text-[#7a8da2]">{title}</p><div className="mt-3 flex items-end justify-between"><span className={`text-[22px] leading-none ${value !== "0" ? "font-medium text-[#f0252c]" : "text-[#546b7f]"}`}>{value}</span><span className="text-[6px] text-[#99aabd]">hallazgos</span></div></div>)}</div></DashboardCard></div>
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[.8fr_1.2fr]"><DashboardCard><CardTitle title="Hallazgos por nivel de relevancia" subtitle="Distribución según criticidad del hallazgo" /><div className="mt-5 flex items-center gap-4"><div className="h-40 w-[165px] shrink-0"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={relevanceData} cx="50%" cy="50%" innerRadius={47} outerRadius={68} dataKey="value" strokeWidth={0}>{legend.map(([color]) => <Cell key={color} fill={color} />)}</Pie></PieChart></ResponsiveContainer></div><div className="flex flex-1 flex-col gap-5">{legend.map(([color, label, value, percentage]) => <div key={label} className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} /><span className="text-[9px] text-[#51667b]">{label}</span></div><div><span className="text-sm font-medium text-[#244057]">{value}</span><span className="ml-1 text-[8px] text-[#9aabbd]">({percentage})</span></div></div>)}</div></div><div className="mt-4 flex items-center gap-2 rounded-md bg-[#fee4e4] px-3 py-2 text-[9px] font-semibold text-[#e52929]"><AlertTriangle className="h-3.5 w-3.5" />4 hallazgos clasificados como NCM</div></DashboardCard>
      <DashboardCard className="overflow-hidden p-0"><div className="px-4 pb-2 pt-4"><CardTitle title="Principales hallazgos" subtitle="Hallazgos identificados en los centros auditados" rightText={`${visibleFindings.length} indicadores`} /></div><FindingsTable data={visibleFindings} /></DashboardCard></div></>;
}
