"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import EvaluationProgress from "./EvaluationProgress";
import TestCard from "./TestCard";
import { dashboardDatabase } from "@/data/dashboardDatabase";

export default function EvaluationPage() {
  const [progress, setProgress] = useState(false);
  const { startDate, endDate } = useAuditFilters();
  const cml = dashboardDatabase.evaluacion.pruebas.cml;

  if (progress) return <EvaluationProgress onBack={() => setProgress(false)} />;

  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto max-w-[1020px] px-4 pb-16 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-sm font-semibold tracking-[.04em]">SEGUIMIENTO DE APLICACIÓN</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">{startDate} → {endDate}</p></div>
        <button onClick={() => setProgress(true)} className="flex h-[30px] items-center gap-2 rounded-md border border-[#b8d2ee] bg-white px-3 text-[8px] text-[#176fc8]">Avance · Resultados · Progreso<ChevronRight className="h-3 w-3" /></button>
      </div>
      <div className="mt-5 space-y-4">
        <TestCard {...cml} accent="blue" />
      </div>
    </div>
  </main>;
}
