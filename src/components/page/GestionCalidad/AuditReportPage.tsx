"use client";

import { useDashboardData } from "@/stores/DashboardDataContext";
import { SectionHeader } from "./DashboardUI";
import QualityCharts from "./QualityCharts";
import QualityKpis from "./QualityKpis";

export default function AuditReportPage() {
  useDashboardData();
  return <main className="flex-1 bg-[#f5f8fc] text-[#10263b]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5"><SectionHeader title="ESTADO DE LAS AUDITORÍAS"/><QualityKpis/><QualityCharts/></div></main>;
}
