"use client";
import { useEffect } from "react";
import EvaluationComparisonByBlockLevels from "./EvaluationComparisonByBlockLevels";
import EvaluationProgressMonthlyBars from "./EvaluationProgressMonthlyBars";
import { getEvaluacion } from "./evaluationViewData";
type EvaluationFilter = "cml" | "progreso";
const numberValue = (value: unknown) => {
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
};
function hasCmlResults() {
    const distributions = getEvaluacion().distribucionPorBloqueMateriaNiveles ?? {};
    return Object.values(distributions).filter(Array.isArray).some((rows) => rows.some((row) => numberValue(row.universo) > 0 || [1, 2, 3, 4, 5].some((level) => numberValue(row[`nivel${level}data` as keyof typeof row]) > 0 || numberValue(row[`nivel${level}percent` as keyof typeof row]) > 0)));
}
function hasProgressResults() {
    const source = (getEvaluacion() as unknown as Record<string, unknown>).resultadosPorMes;
    if (typeof source !== "object" || source === null || Array.isArray(source)) return false;
    return Object.values(source).some((rows) => Array.isArray(rows) && rows.some((row) => {
        if (typeof row !== "object" || row === null || Array.isArray(row)) return false;
        const record = row as Record<string, unknown>;
        return numberValue(record.universo) > 0 || numberValue(record.promedioMatematica) > 0 || numberValue(record.promedioLengua) > 0 || [1, 2, 3, 4, 5].some((level) => numberValue(record[`nivel${level}data`]) > 0 || numberValue(record[`nivel${level}percent`]) > 0);
    }));
}
export default function EvaluationProgressFiltered({ activeFilter, onChange }: {
    activeFilter: EvaluationFilter;
    onChange: (value: EvaluationFilter) => void;
}) {
    const availableFilters: EvaluationFilter[] = [hasCmlResults() ? "cml" : null, hasProgressResults() ? "progreso" : null].filter((value): value is EvaluationFilter => value !== null);
    const visibleFilter = availableFilters.includes(activeFilter) ? activeFilter : availableFilters[0] ?? "cml";
    useEffect(() => {
        if (visibleFilter !== activeFilter) onChange(visibleFilter);
    }, [activeFilter, onChange, visibleFilter]);
    const filterTitle = visibleFilter === "cml" ? "Conociendo mis logros" : "PROGRESO";
    return <section className="mt-5">
    <div className="rounded-xl border border-[#dce4ec] bg-white p-3 shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[18px] font-semibold uppercase text-[#334b60]">{filterTitle}</p>
        </div>
        {availableFilters.length > 0 && <div className="flex rounded-lg border border-[#d8e0e8] bg-[#f7f9fc] p-1">
          {availableFilters.includes("cml") && <FilterButton active={visibleFilter === "cml"} onClick={() => onChange("cml")}>CML</FilterButton>}
          {availableFilters.includes("progreso") && <FilterButton active={visibleFilter === "progreso"} onClick={() => onChange("progreso")}>Progreso</FilterButton>}
        </div>}
      </div>
    </div>
    <div className="mt-4">
      {availableFilters.length === 0 && <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center"><p className="text-[12px] font-semibold text-[#526a80]">Sin resultados</p><p className="mt-2 text-[10px] text-[#8b9daf]">No hay resultados disponibles para este periodo.</p></article>}
      {availableFilters.length > 0 && (visibleFilter === "cml" ? <EvaluationComparisonByBlockLevels /> : <EvaluationProgressMonthlyBars />)}
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
