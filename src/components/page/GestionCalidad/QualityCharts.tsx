"use client";

import { Bar, BarChart, CartesianGrid, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { getAuditedByGroup, getComplianceByGroup, getComplianceByProcess, getCoverageByGroup } from "./qualityData";
import { CardTitle, DashboardCard } from "./DashboardUI";

function getProcessComplianceColor(value: number) {
  if (value >= 80) return "#16813f";
  if (value >= 51) return "#eab308";
  return "#e33a3a";
}

function ComplianceLegend() {
  return <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[8px] text-[#6f8295]"><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#16813f]"/>Excelente</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#eab308]"/>Medio</span><span className="inline-flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#e33a3a]"/>Crítico</span></div>;
}

function ComplianceBars({ items, useStatusColors = true }: { items: Array<{ name: string; value: number }>; useStatusColors?: boolean }) {
  return <div className="w-full">{useStatusColors && <ComplianceLegend />}<div className="mt-5 space-y-4">
    {items.map((item) => <div key={item.name} className="w-full">
      <div className="mb-1.5 flex w-full items-end justify-between gap-3"><span className="min-w-0 text-[9px] font-medium leading-tight text-[#385268]">{item.name}</span><span className="shrink-0 text-[10px] font-semibold text-[#385268]">{item.value}%</span></div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[#edf2f7]"><div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, backgroundColor: useStatusColors ? getProcessComplianceColor(item.value) : "#4f46e5" }} /></div>
    </div>)}
  </div></div>;
}

export default function QualityCharts() {
  const auditedByGroup = getAuditedByGroup();
  const coverageByGroup = getCoverageByGroup();
  const complianceByGroup = getComplianceByGroup();
  const complianceByProcess = getComplianceByProcess();

  return <div className="mx-auto mt-5 grid w-full min-w-0 max-w-[1100px] grid-cols-1 gap-4 lg:grid-cols-2">
    {coverageByGroup.length > 0 && <DashboardCard><CardTitle title="Cobertura acumulada" subtitle="Auditados por grupo y ronda" icon={<BriefcaseBusiness className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[240px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={coverageByGroup} margin={{ top: 22, right: 16, left: -10 }}><CartesianGrid strokeDasharray="2 3" vertical={false} stroke="#e7edf4" /><XAxis dataKey="grupo" tickLine={false} axisLine={false} fontSize={8} /><YAxis tickLine={false} axisLine={false} fontSize={8} /><Tooltip formatter={(value, name) => [value, name === "auditados" || name === "Auditados" ? "Auditados" : "Universo"]} labelFormatter={(label) => { const item = coverageByGroup.find((entry) => entry.grupo === label); return item ? `${label} · Ronda ${item.ronda} · ${item.porcentaje}%` : label; }} /><Legend wrapperStyle={{ fontSize: 8 }} /><Bar dataKey="auditados" name="Auditados" fill="#1f70c7" radius={[3, 3, 0, 0]}><LabelList dataKey="auditados" position="top" fill="#1f4f78" fontSize={8} /></Bar><Bar dataKey="total" name="Universo" fill="#d8e4ef" radius={[3, 3, 0, 0]}><LabelList dataKey="total" position="top" fill="#61778b" fontSize={8} /></Bar></BarChart></ResponsiveContainer></div></DashboardCard>}
    {auditedByGroup.length > 0 && <DashboardCard><CardTitle title="Centros escolares auditados por grupo" subtitle="Auditados respecto al universo de cada grupo" icon={<BriefcaseBusiness className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[240px] w-full min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={auditedByGroup} margin={{ top: 22, right: 10, left: -15 }}><CartesianGrid strokeDasharray="2 3" vertical={false} stroke="#e7edf4" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={8} /><YAxis tickLine={false} axisLine={false} fontSize={8} /><Tooltip /><Legend wrapperStyle={{ fontSize: 8 }} /><Bar dataKey="auditados" name="Auditados" fill="#1f70c7" radius={[3, 3, 0, 0]}><LabelList dataKey="auditados" position="top" fill="#1f4f78" fontSize={8} /></Bar><Bar dataKey="total" name="Universo" fill="#d8e4ef" radius={[3, 3, 0, 0]}><LabelList dataKey="total" position="top" fill="#61778b" fontSize={8} /></Bar></BarChart></ResponsiveContainer></div></DashboardCard>}
    {complianceByGroup.length > 0 && <DashboardCard><CardTitle title="Cumplimiento global por grupo" subtitle="Porcentaje promedio de cumplimiento" icon={<TrendingUp className="h-4 w-4 text-[#8ca1b8]" />} /><ComplianceBars items={complianceByGroup} useStatusColors={false} /></DashboardCard>}
    {complianceByProcess.length > 0 && <DashboardCard><CardTitle title="Cumplimiento promedio por proceso" subtitle="Comparación de los procesos evaluados" icon={<TrendingUp className="h-4 w-4 text-[#8ca1b8]" />} /><ComplianceBars items={complianceByProcess} /></DashboardCard>}
  </div>;
}
