"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import MonthRangeFilter, { type MonthRange } from "./MonthRangeFilter";
import { getEvaluacion } from "./evaluationViewData";
import { ALL_BLOCKS, blocksWithData, cellColor, HEATMAP_LEVELS, HEATMAP_MONTHS, hasRiskFactors, levelValuesFor, normalizeHeatmap, normalizeRiskFactors, RISK_LEVELS, subjectsWithData, visibleFactors, type RiskFactor, type RiskFactorGroup } from "@/lib/progressHeatmap";
import Select from "@/components/ui/Select";

const months = HEATMAP_MONTHS;

export default function EvaluationProgressHeatmap() {
  const evaluacion = getEvaluacion();
  const heatmap = normalizeHeatmap(evaluacion.heatmapProgreso);
  const riskFactors = normalizeRiskFactors(evaluacion.factoresRiesgo);
  const [selectedBlock, setSelectedBlock] = useState(ALL_BLOCKS);
  const [selectedSubject, setSelectedSubject] = useState("Matemática");
  // Filtros dinámicos: solo materias y bloques con datos para la fecha seleccionada.
  const subjectOptions = subjectsWithData(heatmap);
  const activeSubject = subjectOptions.includes(selectedSubject) ? selectedSubject : subjectOptions.includes("Matemática") ? "Matemática" : subjectOptions[0] ?? selectedSubject;
  const blockOptions = [ALL_BLOCKS, ...blocksWithData(heatmap, activeSubject)];
  const [riskFactorsActive, setRiskFactorsActive] = useState(false);
  const [monthRange, setMonthRange] = useState<MonthRange>({ start: 0, end: months.length - 1 });
  const visibleMonthIndexes = useMemo(() => months.map((_, index) => index).filter((index) => index >= monthRange.start && index <= monthRange.end), [monthRange]);
  const gridTemplateColumns = `120px repeat(${visibleMonthIndexes.length}, minmax(65px, 1fr))`;
  const gridMinWidth = Math.max(420, 120 + visibleMonthIndexes.length * 82);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ overflow: false });
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const update = () => {
      const maxScroll = element.scrollWidth - element.clientWidth;
      setScrollState({ overflow: maxScroll > 1 });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [gridMinWidth]);
  const activeBlock = blockOptions.includes(selectedBlock) ? selectedBlock : ALL_BLOCKS;
  const blockRiskFactors = activeBlock === ALL_BLOCKS ? undefined : riskFactors[activeBlock];
  const canShowRiskFactors = hasRiskFactors(blockRiskFactors);
  const showRiskFactors = riskFactorsActive && canShowRiskFactors;
  const levelValues = levelValuesFor(heatmap, activeSubject, activeBlock);
  const chartLevels = HEATMAP_LEVELS.filter((level) => !showRiskFactors || RISK_LEVELS.includes(level.name)).map((level) => {
    const values = levelValues[level.name] ?? [];
    return { ...level, values };
  });
  const hasVisibleData = chartLevels.some((level) => visibleMonthIndexes.some((index) => typeof level.values[index] === "number"));

  return (
    <div>
    <MonthRangeFilter months={months} value={monthRange} onChange={setMonthRange} />
    <section className="rounded-xl border border-[#dce4ec] bg-white p-4">
      <div className="mb-4">
        <h3 className="text-[13px] font-semibold uppercase text-[#334b60]">Resultados de progreso</h3>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <FilterSelect label="Bloque" value={activeBlock} options={blockOptions} onChange={(value) => { setSelectedBlock(value); setRiskFactorsActive(false); }} />
        <FilterSelect label="Materia" value={activeSubject} options={subjectOptions} onChange={setSelectedSubject} />
        {canShowRiskFactors ? <button type="button" aria-pressed={showRiskFactors} onClick={() => setRiskFactorsActive((active) => !active)} className={`h-7 cursor-pointer rounded-md border px-3 text-[9px] font-semibold transition sm:ml-auto ${showRiskFactors ? "border-[#e6a7aa] bg-[#fff1f1] text-[#d64545] hover:bg-[#ffe5e5]" : "border-[#f2c48e] bg-[#fff7ea] text-[#c87913] hover:bg-[#fff0d2]"}`}>Factores de riesgo{showRiskFactors ? <span className="ml-2 text-sm leading-none">×</span> : null}</button> : null}
        {scrollState.overflow ? <p className={`flex h-7 items-center gap-1 text-[10px] text-[#a0aec0] ${canShowRiskFactors ? "sm:ml-3" : "sm:ml-auto"}`}><MoveHorizontal className="h-3 w-3" strokeWidth={1.5} />Desplace horizontalmente</p> : null}
      </div>
      <div className="relative">
      <div ref={scrollRef} className="w-full overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#e2e8f0] [&::-webkit-scrollbar-thumb:hover]:bg-[#cbd5e1] [&::-webkit-scrollbar-track]:bg-transparent">
        <div style={{ minWidth: gridMinWidth }}>
          <div className="mb-3 grid items-end gap-2" style={{ gridTemplateColumns }}>
            <div />
            {visibleMonthIndexes.map((index) => <div key={months[index]} className="text-center text-[12px] font-medium text-slate-500">{months[index]}</div>)}
          </div>
          <div className="space-y-2">
            {chartLevels.map((level) => <div key={level.name} className="grid items-center gap-2" style={{ gridTemplateColumns }}>
              <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: level.dotColor }} /><span className="text-[12px] font-medium text-slate-600">{level.name}</span></div>
              {visibleMonthIndexes.map((index) => {
                const value = level.values[index];
                if (typeof value !== "number") return <div key={`${level.name}-${index}`} className="flex h-[52px] items-center justify-center rounded-lg bg-[#f1f5f9] text-[12px] font-medium text-[#a0aec0]" title="Sin dato">—</div>;
                const color = cellColor(level.name, value);
                return <div key={`${level.name}-${index}`} className="flex h-[52px] items-center justify-center rounded-lg text-[12px] font-semibold transition-transform duration-150 hover:scale-[1.03]" style={{ backgroundColor: color.background, color: color.text }}>{value}%</div>;
              })}
            </div>)}
          </div>
        </div>
      </div>
      </div>
      {!hasVisibleData ? <p className="mt-3 text-center text-[10px] text-[#8b9daf]">No hay resultados capturados para esta materia, bloque y rango de meses.</p> : null}
      {showRiskFactors && blockRiskFactors ? <RiskFactorsTreemap key={activeBlock} group={blockRiskFactors} /> : null}
    </section>
    </div>
  );
}

const formatPercent = (value: number | null) => (value === null ? "—" : `${value.toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`);
const formatStudents = (value: number | null) => (value === null ? "" : `${value.toLocaleString("en-US")} estudiantes`);
const sumPercent = (items: RiskFactor[]) => items.reduce((total, item) => total + (item.porcentaje ?? 0), 0);

function RiskFactorsTreemap({ group }: { group: RiskFactorGroup }) {
  const [showDetails, setShowDetails] = useState<"intervenible" | "no-intervenible" | null>(null);
  const intervenibleItems = visibleFactors(group.intervenible);
  const nonIntervenibleItems = visibleFactors(group.noIntervenible);
  const intervenible = showDetails === "intervenible";
  // Cada factor ocupa un ancho proporcional a su porcentaje y la fila siempre se llena.
  const factors = [...(intervenible ? intervenibleItems : nonIntervenibleItems)].sort((a, b) => (b.porcentaje ?? 0) - (a.porcentaje ?? 0));
  const factorColors = intervenible ? ["#98cfbf", "#a9d8cb", "#b9e0d5", "#c7e6dd"] : ["#f2ad7e", "#f4b78e", "#f5bf9b", "#f6c39f", "#f7c7a9", "#f8cfb5", "#f9d0b7", "#fbd8c2"];
  // Ancho de cada grupo proporcional a su porcentaje total (mínimo visible si alguno es 0).
  const intervenibleWeight = Math.max(sumPercent(intervenibleItems), intervenibleItems.length ? 1 : 0);
  const nonIntervenibleWeight = Math.max(sumPercent(nonIntervenibleItems), nonIntervenibleItems.length ? 1 : 0);

  return <div className="mt-6 rounded-lg border border-[#dce4ec] bg-[#fbfcfd] p-3">
    <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><h4 className="text-[10px] font-semibold uppercase tracking-[.04em] text-[#526a80]">Factores de riesgo</h4>{showDetails ? <button type="button" onClick={() => setShowDetails(null)} className="cursor-pointer text-[8px] font-semibold text-[#176fc8]">← Volver</button> : null}</div><span className="text-[8px] text-[#8a9daf]">{intervenible ? "Intervenible" : showDetails ? "No intervenible" : "Clasificación inicial"}</span></div>
    {!showDetails ? <div className="flex h-24 overflow-hidden rounded-md">
      {intervenibleItems.length ? <button type="button" onClick={() => setShowDetails("intervenible")} style={{ flexGrow: intervenibleWeight }} className="flex basis-0 cursor-pointer flex-col items-center justify-center bg-[#e5f4f0] text-[10px] font-semibold text-[#08775e] transition hover:brightness-95">Intervenible<span className="mt-0.5 text-[9px] font-medium">{formatPercent(sumPercent(intervenibleItems))}</span></button> : null}
      {nonIntervenibleItems.length ? <button type="button" onClick={() => setShowDetails("no-intervenible")} style={{ flexGrow: nonIntervenibleWeight }} className="flex basis-0 cursor-pointer flex-col items-center justify-center bg-[#fff0d7] text-[10px] font-semibold text-[#c87913] transition hover:brightness-95">No intervenible<span className="mt-0.5 text-[9px] font-medium">{formatPercent(sumPercent(nonIntervenibleItems))}</span></button> : null}
    </div> : <div className="flex flex-wrap overflow-hidden rounded-md">{factors.map((factor, index) => <div key={`${factor.nombre}-${index}`} className={`flex min-h-[58px] min-w-[110px] basis-0 flex-col justify-center px-2 py-1.5 text-center ${intervenible ? "text-[#08775e]" : "text-[#7b4a1d]"}`} style={{ backgroundColor: factorColors[index % factorColors.length], flexGrow: Math.max(factor.porcentaje ?? 0, 1) }}><strong className="text-[8px] font-semibold leading-tight">{factor.nombre}</strong><span className="mt-1 text-[10px] font-bold">{formatPercent(factor.porcentaje)}</span><small className="text-[7px]">{formatStudents(factor.estudiantes)}</small></div>)}</div>}
  </div>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <div className="block w-full text-[7px] font-semibold uppercase tracking-[.04em] text-[#71869a] sm:w-[130px]">
    <span>{label}</span>
    <Select value={value} options={options} onChange={onChange} size="xs" ariaLabel={label} className="mt-1 w-full" />
  </div>;
}
