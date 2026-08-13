"use client";

import { AlertTriangle } from "lucide-react";
import { CardTitle, DashboardCard, SectionHeader } from "./DashboardUI";
import FindingsTable from "./FindingsTable";
import { criticalFindings } from "./qualityData";
import { useAuditFilters } from "@/stores/AuditFiltersContext";

export default function FindingsDiagnosis() {
  const { components } = useAuditFilters();
  const visible = components.length
    ? criticalFindings.filter((item) => components.includes(item.process))
    : criticalFindings;

  return <>
    <div className="mt-7"><SectionHeader title="DIAGNÓSTICO DE HALLAZGOS" subtitle="Hallazgos críticos identificados en los centros auditados" /></div>
    <div className="mt-5 grid gap-4 md:grid-cols-3">{criticalFindings.map((item) => <DashboardCard key={item.title}><div className="flex items-start justify-between gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#fff0f0]"><AlertTriangle className="h-4 w-4 text-[#ef3333]"/></span><strong className="text-xl text-[#ef3333]">{item.impact}%</strong></div><h3 className="mt-4 text-[10px] font-semibold text-[#263e54]">{item.title}</h3><p className="mt-1 text-[8px] font-medium text-[#1971c9]">{item.process}</p><p className="mt-3 text-[7px] leading-[1.55] text-[#8294a7]">{item.description}</p></DashboardCard>)}</div>
    <DashboardCard className="mt-4 overflow-hidden p-0"><div className="px-4 pb-3 pt-4"><CardTitle title="Detalle de hallazgos críticos" subtitle="Información registrada para la fecha de corte" rightText={`${visible.length} hallazgos`} /></div><FindingsTable data={visible}/></DashboardCard>
  </>;
}
