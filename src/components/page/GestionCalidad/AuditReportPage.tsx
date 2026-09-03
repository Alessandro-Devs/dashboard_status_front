"use client";
import { SectionHeader } from "./DashboardUI";
import FindingsDiagnosis from "./FindingsDiagnosis";
import QualityCharts from "./QualityCharts";
import QualityKpis from "./QualityKpis";
export default function AuditReportPage() {
    return <main className="flex-1 bg-[#f5f8fc] text-[#10263b]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5"><SectionHeader title="ESTADO DE LAS AUDITORÍAS"/><QualityKpis /><QualityCharts /><FindingsDiagnosis /></div></main>;
}
