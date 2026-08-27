"use client";
import EvaluationComparisonByBlockLevels from "./EvaluationComparisonByBlockLevels";
import EvaluationProgressMonthlyBars from "./EvaluationProgressMonthlyBars";
type EvaluationFilter = "cml" | "progreso";
export default function EvaluationProgressFiltered({ activeFilter, onChange }: {
    activeFilter: EvaluationFilter;
    onChange: (value: EvaluationFilter) => void;
}) {
    const filterTitle = activeFilter === "cml" ? "Conociendo mis logros" : "PROGRESO";
    return <section className="mt-5">
    <div className="rounded-xl border border-[#dce4ec] bg-white p-3 shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[18px] font-semibold uppercase text-[#334b60]">{filterTitle}</p>
        </div>
        <div className="flex rounded-lg border border-[#d8e0e8] bg-[#f7f9fc] p-1">
          <FilterButton active={activeFilter === "cml"} onClick={() => onChange("cml")}>CML</FilterButton>
          <FilterButton active={activeFilter === "progreso"} onClick={() => onChange("progreso")}>Progreso</FilterButton>
        </div>
      </div>
    </div>
    <div className="mt-4">
      {activeFilter === "cml" ? <EvaluationComparisonByBlockLevels /> : <EvaluationProgressMonthlyBars />}
    </div>
  </section>;
}
function FilterButton({ active, onClick, children }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
}) {
    return <button type="button" onClick={onClick} className={`h-8 rounded-md px-4 text-[10px] font-semibold transition ${active ? "bg-[#176fc8] text-white shadow-sm" : "text-[#60778c]"}`}>{children}</button>;
}
export type { EvaluationFilter };
