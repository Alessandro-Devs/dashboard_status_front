"use client";

import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { CardTitle, DashboardCard } from "./DashboardUI";
import { auditedByBlock, complianceByBlock } from "./qualityData";

export default function QualityCharts() {
  const { blocks } = useAuditFilters();
  const auditedData = blocks.length ? auditedByBlock.filter((item) => blocks.includes(item.name.toLowerCase())) : auditedByBlock;
  const complianceData = blocks.length ? complianceByBlock.filter((item) => blocks.includes(item.name.toLowerCase())) : complianceByBlock;

  return <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
    <DashboardCard><CardTitle title="Centros escolares auditados por bloque" subtitle="Distribución de los centros auditados dentro del universo" icon={<BriefcaseBusiness className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={auditedData} margin={{ top: 15, right: 20, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="2 3" vertical={false} stroke="#e7edf4" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={10} /><YAxis domain={[0, 28]} ticks={[0, 7, 14, 21, 28]} tickLine={false} axisLine={false} fontSize={9} /><Tooltip /><Bar dataKey="value" fill="#1f70c7" radius={[3, 3, 0, 0]} barSize={32} label={{ position: "top", fill: "#13293d", fontSize: 10, fontWeight: 700 }} /></BarChart></ResponsiveContainer></div></DashboardCard>
    <DashboardCard><CardTitle title="Cumplimiento promedio por bloque" subtitle="Nivel de cumplimiento observado en las auditorías" icon={<TrendingUp className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[220px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={complianceData} layout="vertical" margin={{ top: 5, right: 30, left: -18, bottom: 0 }}><CartesianGrid strokeDasharray="2 3" horizontal={false} stroke="#e7edf4" /><XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={9} /><YAxis dataKey="name" type="category" tickLine={false} axisLine={false} fontSize={10} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="value" fill="#16813f" barSize={20} radius={[0, 4, 4, 0]} /></BarChart></ResponsiveContainer></div></DashboardCard>
  </div>;
}
