"use client";
import { AlertTriangle } from "lucide-react";
import { DashboardCard, SectionHeader } from "./DashboardUI";
import { getCriticalFindings } from "./qualityData";
export default function FindingsDiagnosis() {
    const criticalFindings = getCriticalFindings();
    return (<>
      <div className="mt-7">
        <SectionHeader title="DIAGNÓSTICO DE HALLAZGOS" subtitle="Hallazgos críticos identificados en los centros auditados"/>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {criticalFindings.map((item) => (<DashboardCard key={item.title}>
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#fff0f0]">
                <AlertTriangle className="h-4 w-4 text-[#ef3333]"/>
              </span>
              <strong className="text-[22px] text-[#ef3333]">{item.impact}%</strong>
            </div>
            <h3 className="mt-4 text-[12px] font-semibold leading-[1.4] text-[#263e54]">{item.title}</h3>
            <p className="mt-1.5 text-[10px] font-medium text-[#1971c9]">{item.process}</p>
            <p className="mt-3 text-[9px] leading-[1.6] text-[#71869a]">{item.description}</p>
          </DashboardCard>))}
      </div>
    </>);
}
