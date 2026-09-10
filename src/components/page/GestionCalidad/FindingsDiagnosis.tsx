"use client";

import { useState } from "react";
import { getCriticalFindings, type Finding } from "./qualityData";

type Severity = "mayor" | "menor" | "obs";
type Priority = Finding & {
  rank: number;
  severity: Severity;
  severityLabel: string;
  impact: string;
};

const toPriority = (finding: Finding, index: number): Priority => {
  const rawSeverity = String(finding.severity ?? "").toLowerCase();
  const severity: Severity = rawSeverity.includes("mayor") ? "mayor" : rawSeverity.includes("menor") ? "menor" : "obs";
  const severityLabel = severity === "mayor" ? "Mayor" : severity === "menor" ? "Menor" : "Observación";
  const impactValue = finding.impact === undefined || finding.impact === null || finding.impact === "" ? "" : String(finding.impact);
  const impact = impactValue && impactValue.endsWith("%") ? impactValue : impactValue ? `${impactValue}%` : "";

  return { ...finding, rank: index + 1, severity, severityLabel, impact };
};

const severityStyles: Record<Severity, { badge: string; rank: string; impact: string }> = {
  mayor: { badge: "bg-[#fff0f0] text-[#d83b3b]", rank: "bg-[#ef3333] text-white", impact: "text-[#ef3333]" },
  menor: { badge: "bg-[#fff8e8] text-[#b87900]", rank: "bg-[#f0a51a] text-white", impact: "text-[#f0a51a]" },
  obs: { badge: "bg-[#f1f3f5] text-[#6b7280]", rank: "bg-[#9ca3af] text-white", impact: "text-[#6b7280]" },
};

const FINDINGS_PER_PAGE = 5;

export default function FindingsDiagnosis() {
  const priorities = getCriticalFindings().map(toPriority);
  const [filter, setFilter] = useState<"hallazgos" | Severity>("hallazgos");
  const [page, setPage] = useState(1);

  if (!priorities.length) return null;

  const visiblePriorities = filter === "hallazgos" ? priorities : priorities.filter((priority) => priority.severity === filter);
  const totalPages = Math.max(1, Math.ceil(visiblePriorities.length / FINDINGS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginatedPriorities = visiblePriorities.slice((currentPage - 1) * FINDINGS_PER_PAGE, currentPage * FINDINGS_PER_PAGE);

  return (
    <>
      <div className="mt-7">
        <h2 className="text-sm font-semibold uppercase tracking-[.04em] text-[#20394e]">HALLAZGOS PARA LA MEJORA EN LA IMPLEMENTACIÓN</h2>
      </div>
      <section id="quality-findings" className="hero mt-4 scroll-mt-5 rounded-xl border border-[#d6dfe8] bg-white p-4 shadow-[0_1px_2px_rgba(15,35,55,.02)] sm:p-5">
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-[#71869a]">
        <label htmlFor="finding-filter">Filtrar por hallazgo</label>
        <select id="finding-filter" value={filter} onChange={(event) => { setFilter(event.target.value as "hallazgos" | Severity); setPage(1); }} className="rounded-md border border-[#dce5ed] bg-white px-2 py-1 text-[9px] font-medium text-[#536d82] outline-none focus:border-[#7aaed1]">
          <option value="hallazgos">Todos</option>
          <option value="mayor">Mayor</option>
          <option value="menor">Menor</option>
          <option value="obs">Observación</option>
        </select>
      </div>
      <div className="mt-4 divide-y divide-[#dce5ed]">
        {paginatedPriorities.map((priority) => {
          const styles = severityStyles[priority.severity];
          return (
            <article key={priority.rank} className="action grid items-center gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[28px_68px_minmax(140px,1.1fr)_minmax(240px,2.3fr)_74px] sm:items-center sm:gap-4">
              <div className={`rank mx-auto flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${styles.rank}`}>{priority.rank}</div>
              <div className={`type mx-auto inline-flex w-fit items-center justify-center rounded-full px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-[.03em] ${styles.badge}`}>{priority.severityLabel}</div>
              <div className="who pl-0 text-left sm:pl-5">
                <div className="name text-[10px] font-bold text-[#29445a]">{priority.leader}</div>
                <div className="comp mt-1 text-[9px] leading-[1.45] text-[#71869a]">{priority.component}</div>
              </div>
              <div className="what min-w-0">
                <div className="finding text-[10px] font-bold leading-[1.4] text-[#263e54]">{priority.finding}</div>
                <div className="todo mt-1 text-[9px] leading-[1.5] text-[#4f6a82]">{priority.action}</div>
                <div className="leader mt-2 rounded-md bg-[#eaf1fc]/50 px-2 py-1.5 text-[9px] font-[100] leading-[1.5] text-black"><b className="font-semibold text-blue-900">Acción del líder:</b> {priority.leaderAction}</div>
              </div>
              <div className="impact text-left sm:text-right">
                <div className={`pct text-base font-bold leading-none ${styles.impact}`}>{priority.impact}</div>
                <div className="n mt-1 text-[9px] text-[#8da0b4]">{priority.count}</div>
              </div>
            </article>
          );
        })}
      </div>
      {totalPages > 1 && <div className="mt-4 flex items-center justify-between border-t border-[#dce5ed] pt-3 text-[9px] font-semibold text-[#71869a]">
        <span>Página {currentPage} de {totalPages}</span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => setPage((pageNumber) => Math.max(1, pageNumber - 1))} disabled={currentPage === 1} className="rounded-md border border-[#dce5ed] bg-white px-2 py-1 text-[#536d82] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página anterior">Anterior</button>
          <button type="button" onClick={() => setPage((pageNumber) => Math.min(totalPages, pageNumber + 1))} disabled={currentPage === totalPages} className="rounded-md border border-[#dce5ed] bg-white px-2 py-1 text-[#536d82] disabled:cursor-not-allowed disabled:opacity-40" aria-label="Página siguiente">Siguiente</button>
        </div>
      </div>}
      </section>
    </>
  );
}
