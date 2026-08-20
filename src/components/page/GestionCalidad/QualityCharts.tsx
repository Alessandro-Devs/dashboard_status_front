"use client";

import { BriefcaseBusiness, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getAuditedByGroup, getComplianceByGroup, getComplianceByProcess } from "./qualityData";
import { CardTitle, DashboardCard } from "./DashboardUI";

function getProcessComplianceColor(value: number) {
  if (value >= 80) return "#16813f";
  if (value >= 51) return "#eab308";
  return "#e33a3a";
}

export default function QualityCharts() {
  const auditedByGroup = getAuditedByGroup();
  const complianceByGroup = getComplianceByGroup();
  const complianceByProcess = getComplianceByProcess();

  return <>
    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <DashboardCard><CardTitle title="Centros escolares auditados por grupo" subtitle="Auditados respecto al universo de cada grupo" icon={<BriefcaseBusiness className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={auditedByGroup} margin={{ top: 22, right: 10, left: -15 }}><CartesianGrid strokeDasharray="2 3" vertical={false} stroke="#e7edf4" /><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={8} /><YAxis tickLine={false} axisLine={false} fontSize={8} /><Tooltip /><Legend wrapperStyle={{ fontSize: 8 }} /><Bar dataKey="auditados" name="Auditados" fill="#1f70c7" radius={[3, 3, 0, 0]}><LabelList dataKey="auditados" position="top" fill="#1f4f78" fontSize={8} /></Bar><Bar dataKey="total" name="Universo" fill="#d8e4ef" radius={[3, 3, 0, 0]}><LabelList dataKey="total" position="top" fill="#61778b" fontSize={8} /></Bar></BarChart></ResponsiveContainer></div></DashboardCard>
      <DashboardCard><CardTitle title="Cumplimiento global por grupo" subtitle="Porcentaje promedio de cumplimiento" icon={<TrendingUp className="h-4 w-4 text-[#8ca1b8]" />} /><div className="mt-4 h-[240px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={complianceByGroup} layout="vertical" margin={{ top: 5, right: 46, left: 0 }}><CartesianGrid strokeDasharray="2 3" horizontal={false} stroke="#e7edf4" /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={8} /><YAxis dataKey="name" type="category" width={42} tickLine={false} axisLine={false} fontSize={8} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="value" fill="#16813f" barSize={18} radius={[0, 4, 4, 0]}><LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} fill="#385268" fontSize={8} /></Bar></BarChart></ResponsiveContainer></div></DashboardCard>
    </div>
    <DashboardCard className="mt-4"><CardTitle title="Cumplimiento promedio por proceso" subtitle="Comparación de los procesos evaluados" /><div className="mt-4 h-[390px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={complianceByProcess} layout="vertical" margin={{ top: 0, right: 52, left: 15 }}><CartesianGrid strokeDasharray="2 3" horizontal={false} stroke="#e7edf4" /><XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} fontSize={8} /><YAxis dataKey="name" type="category" width={205} tickLine={false} axisLine={false} fontSize={9} /><Tooltip formatter={(value) => `${value}%`} /><Bar dataKey="value" barSize={13} radius={[0, 3, 3, 0]}>{complianceByProcess.map((item) => <Cell key={item.name} fill={getProcessComplianceColor(item.value)} />)}<LabelList dataKey="value" position="right" formatter={(value) => `${value}%`} fill="#385268" fontSize={10} /></Bar></BarChart></ResponsiveContainer></div></DashboardCard>
  </>;
}
