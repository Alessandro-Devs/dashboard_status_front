"use client";

import { useState } from "react";
import EvaluationComparisonByBlockLevels from "./EvaluationComparisonByBlockLevels";
import EvaluationSankeyView from "./EvaluationSankeyView";

type EvaluationFilter = "cml" | "progreso";

export default function EvaluationProgressFiltered() {
  const [activeFilter, setActiveFilter] = useState<EvaluationFilter>("cml");

  return <section className="mt-5">
    <div className="rounded-xl border border-[#dce4ec] bg-white p-3 shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#60778c]">Filtro de evaluacion</p>
          <p className="mt-1 text-[10px] text-[#8a9daf]">Selecciona la vista que quieres revisar.</p>
        </div>
        <div className="flex rounded-lg border border-[#d8e0e8] bg-[#f7f9fc] p-1">
          <FilterButton active={activeFilter === "cml"} onClick={() => setActiveFilter("cml")}>CML</FilterButton>
          <FilterButton active={activeFilter === "progreso"} onClick={() => setActiveFilter("progreso")}>Progreso</FilterButton>
        </div>
      </div>
    </div>
    <div className="mt-4">
      {activeFilter === "cml" ? <EvaluationComparisonByBlockLevels /> : <EvaluationSankeyView />}
    </div>
  </section>;
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" onClick={onClick} className={`h-8 rounded-md px-4 text-[10px] font-semibold transition ${active ? "bg-[#176fc8] text-white shadow-sm" : "text-[#60778c]"}`}>{children}</button>;
}
