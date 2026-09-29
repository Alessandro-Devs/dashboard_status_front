"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";

export type MonthRange = { start: number; end: number };

const shortMonths = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function MonthRangeFilter({ months, value, onChange }: {
  months: readonly string[];
  value: MonthRange;
  onChange: (value: MonthRange) => void;
}) {
  const { start, end } = value;
  const total = months.length;
  const labels = months.map((month, index) => shortMonths[index] ?? month.slice(0, 3));

  // Primer clic = inicio, segundo clic = fin. El siguiente clic empieza un rango nuevo.
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const selectMonth = (index: number) => {
    if (!awaitingEnd) {
      onChange({ start: index, end: index });
      setAwaitingEnd(true);
      return;
    }
    onChange(index < start ? { start: index, end: start } : { start, end: index });
    setAwaitingEnd(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = Math.min(total - 1, Math.max(0, index + step));
    (event.currentTarget.parentElement?.children[next] as HTMLButtonElement | undefined)?.focus();
  };

  const edge = 100 / (total * 2);
  const fillLeft = ((start + 0.5) / total) * 100;
  const fillWidth = ((end - start) / total) * 100;

  return (
    <div className="mx-auto mb-4 w-full max-w-[700px] rounded-xl border border-[#dce4ec] bg-white px-3 pb-2 pt-3 shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]">
            <CalendarDays className="h-3.5 w-3.5" />
          </span>
          <h4 className="text-[11px] font-semibold uppercase text-[#334b60]">Rango de meses</h4>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#176fc8]">
          <span className="rounded-full bg-[#eaf4ff] px-3 py-1">Inicio: {months[start]}</span>
          <span className="text-[#9aabbb]">→</span>
          <span className={`rounded-full px-3 py-1 ${awaitingEnd ? "border border-dashed border-[#9cc9ef] bg-white text-[#6f93b8]" : "bg-[#eaf4ff]"}`}>{awaitingEnd ? "Fin: elige un mes" : `Fin: ${months[end]}`}</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <div className="relative mt-3 min-w-[420px]">
          <div className="absolute top-[10px] h-[3px] -translate-y-1/2 rounded-full bg-[#e2e8f0]" style={{ left: `${edge}%`, right: `${edge}%` }} />
          <div className="absolute top-[10px] h-[3px] -translate-y-1/2 rounded-full bg-[#9cc9ef] transition-all duration-200" style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }} />
          <div className="relative grid" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }} role="group" aria-label="Rango de meses">
            {labels.map((label, index) => {
              const isEdge = index === start || index === end;
              const inRange = index >= start && index <= end;
              return (
                <button
                  key={months[index]}
                  type="button"
                  onClick={() => selectMonth(index)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                  aria-pressed={inRange}
                  aria-label={`${months[index]}${index === start ? " (inicio)" : ""}${index === end ? " (fin)" : ""}`}
                  className="group flex cursor-pointer flex-col items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[#b8d2ee]"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full transition ${isEdge ? "bg-[#17324a]" : inRange ? "bg-[#cfe3f7]" : "bg-[#e8edf2] group-hover:bg-[#d6e2ee]"}`}>
                    <span className={`rounded-full transition-all ${isEdge ? "h-3 w-3 bg-[#1f6fc0]" : inRange ? "h-2.5 w-2.5 bg-[#7fb5e6]" : "h-2.5 w-2.5 bg-[#cdd6df] group-hover:bg-[#b3c3d3]"}`} />
                  </span>
                  <span className={`text-[10px] ${isEdge ? "font-bold text-[#176fc8]" : inRange ? "font-medium text-[#3d7fc2]" : "text-slate-500"}`}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
