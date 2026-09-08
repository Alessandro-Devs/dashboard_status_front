"use client";
import { SectionHeader } from "./DashboardUI";
import FindingsDiagnosis from "./FindingsDiagnosis";
import QualityCharts from "./QualityCharts";
import QualityKpis from "./QualityKpis";
import { getCriticalFindings } from "./qualityData";
import { useDashboardData } from "@/stores/DashboardDataContext";
export default function AuditReportPage() {
    useDashboardData();
    const hasFindings = getCriticalFindings().length > 0;
    return <main className="flex-1 bg-[#f5f8fc] text-[#10263b]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5"><SectionHeader title="ESTADO DE LAS AUDITORÍAS"/><QualityKpis /><QualityCharts />{hasFindings && <FindingsDiagnosis />}</div></main>;
}
