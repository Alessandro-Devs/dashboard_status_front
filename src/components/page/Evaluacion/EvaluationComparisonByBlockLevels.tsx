"use client";

import { useEffect } from "react";
import BarreraCard from "./BarreraCard";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { getEvaluacion, tieneNumero, type DistribucionNivelPorBloque } from "./evaluationViewData";

const levels = [
  { key: "nivel1", color: "#e5252a", label: "Nivel 1" },
  { key: "nivel2", color: "#f05b0b", label: "Nivel 2" },
  { key: "nivel3", color: "#f2a312", label: "Nivel 3" },
  { key: "nivel4", color: "#19a97a", label: "Nivel 4" },
  { key: "nivel5", color: "#0c7f73", label: "Nivel 5" },
] as const;

function normalizeSegment(value: number | null) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function segments(row: DistribucionNivelPorBloque) {
  return levels.map((level) => ({
    value: normalizeSegment(row[level.key]),
    color: level.color,
    label: level.label,
  }));
}

export default function EvaluationComparisonByBlockLevels() {
  useDashboardData();
  const { blocks, setBlocks } = useAuditFilters();
  const evaluacion = getEvaluacion();
  const averages = evaluacion.comparativasPorMateria ?? {};
  const distributions = evaluacion.distribucionPorBloqueMateriaNiveles ?? {};
  const promedios = Object.entries(averages).filter(([, item]) => tieneNumero(item.promedio));
  const availableBlocks = Array.from(
    new Map(
      Object.values(distributions)
        .flatMap((rows) => rows)
        .map((row) => [row.bloque.toLowerCase(), row.bloque]),
    ).entries(),
  ).map(([id, label]) => ({ id, label }));

  useEffect(() => {
    if (blocks.length === 0) return;
    const validBlockIds = new Set(availableBlocks.map((item) => item.id));
    if (blocks.every((block) => validBlockIds.has(block))) return;
    setBlocks(blocks.filter((block) => validBlockIds.has(block)));
  }, [availableBlocks, blocks, setBlocks]);

  const selectedBlocks = new Set(blocks);
  const comparativas = Object.entries(distributions)
    .map(([materia, rows]) => [
      materia,
      selectedBlocks.size > 0
        ? rows.filter((row) => selectedBlocks.has(row.bloque.toLowerCase()))
        : rows,
    ] as const)
    .filter(([, rows]) => rows.length > 0);

  return <section className="space-y-4">
    {promedios.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{promedios.map(([materia, item]) => <Average key={materia} title={`PROMEDIO ${materia.toUpperCase()}`} value={item.promedio as number} variation={item.variacionRespectoJunio} />)}</div>}
    {availableBlocks.length > 0 && <BlockFilter options={availableBlocks} selected={blocks} onChange={setBlocks} />}
    {comparativas.length > 0 && <div className="grid grid-cols-1 gap-4">{comparativas.map(([materia, rows]) => <Comparison key={materia} title={`${materia[0].toUpperCase() + materia.slice(1)} - Comparativa por niveles`} rows={rows} />)}</div>}
    {promedios.length === 0 && comparativas.length === 0 && <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center"><p className="text-[12px] font-semibold text-[#526a80]">Sin resultados comparativos</p><p className="mt-2 text-[10px] text-[#8b9daf]">No hay comparativas por materia disponibles para este periodo.</p></article>}
    <BarreraCard />
  </section>;
}

function BlockFilter({ options, selected, onChange }:{ options:Array<{ id:string; label:string }>; selected:string[]; onChange:(value:string[]) => void }) {
  return <article className="flex justify-between rounded-[9px] border border-[#dce3ea] bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase text-[#6b7f92]">Bloques</p>
        <p className="mt-1 text-[10px] text-[#8a9daf]">Filtro construido con los bloques disponibles en la base.</p>
      </div>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option.id);
        return <button key={option.id} type="button" onClick={() => onChange(active ? selected.filter((item) => item !== option.id) : [option.id])} className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${active ? "border-[#176fc8] bg-[#eaf4ff] text-[#176fc8]" : "border-[#d9e2eb] bg-white text-[#60778c]"}`}>{option.label}</button>;
      })}
      {selected.length > 0 && <button type="button" onClick={() => onChange([])} className="text-[10px] font-semibold text-[#176fc8]">Limpiar filtro</button>}
    </div>
  </article>;
}

function Average({ title, value, variation }:{ title:string; value:number; variation:number|null }) {
  return <article className="rounded-[9px] border border-[#dce3ea] bg-white p-5"><p className="text-[11px] font-semibold uppercase text-[#6b7f92]">{title}</p><div className="mt-3 flex items-center gap-2"><strong className="text-[25px] text-[#263d52]">{value}</strong><span className="rounded bg-[#fff0d7] px-2 py-1 text-[10px] font-semibold text-[#dd8d15]">Medio</span></div>{tieneNumero(variation) && <p className="mt-2 text-[10px] text-[#e04444]">↘ {variation} vs Junio</p>}</article>;
}

function Comparison({ title, rows }:{ title:string; rows:DistribucionNivelPorBloque[] }) {
  return <article className="overflow-hidden rounded-[10px] border border-[#dce4ec] bg-white">
    <div className="border-b border-[#e9eef3] px-4 py-4 sm:px-5">
      <h3 className="text-[13px] font-semibold text-[#334b60] sm:text-[14px]">{title}</h3>
      <p className="mt-1 text-[10px] text-[#8a9daf]">Porcentaje de estudiantes en cada nivel</p>
    </div>
    <div className="bg-[#fbfcfd] px-3 py-3 sm:px-5 sm:py-4">
      <Legend />
      <div className="mt-4 space-y-3">
        {rows.map((row) => <Row key={row.bloque} label={row.bloque} row={row} />)}
      </div>
      <div className="mt-4 flex justify-between text-[7px] font-medium uppercase tracking-[0.04em] text-[#667b8e] sm:text-[8px]">
        <span>Critico</span>
        <span>Excelente</span>
      </div>
    </div>
  </article>;
}

function Legend() {
  return <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
    {levels.map((level) => <div key={level.key} className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-[#dde6ee] bg-white px-2.5 py-1 text-[9px] text-[#5f7488]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }} />{level.label}</div>)}
  </div>;
}

function Row({ label, row }:{ label:string; row:DistribucionNivelPorBloque }) {
  const rowSegments = segments(row);
  return <div className="rounded-[9px] border border-[#e3eaf1] bg-white p-3">
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="rounded-full bg-[#eef4fb] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.04em] text-[#486f94]">{label}</span>
      <span className="text-[8px] text-[#8da0b2]">{formatTotal(rowSegments)}% total</span>
    </div>
    <div className="overflow-hidden rounded-full bg-[#e9eef3]">
      <div className="flex h-[30px] w-full overflow-hidden rounded-full">
        {rowSegments.map((item, index) => <div key={index} className="flex items-center justify-center px-1 text-[8px] font-semibold text-white" style={{ width: `${item.value}%`, background: item.color }}>{item.value >= 8 ? `${item.value}%` : ""}</div>)}
      </div>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
      {rowSegments.map((item, index) => <div key={index} className="rounded-[8px] bg-[#f6f9fc] px-2 py-1.5 text-center"><p className="text-[8px] font-medium text-[#6c8093]">{item.label}</p><p className="mt-1 text-[10px] font-semibold text-[#2d465b]">{formatValue(item.value)}%</p></div>)}
    </div>
  </div>;
}

function formatTotal(items: Array<{ value:number }>) {
  return Math.round(items.reduce((sum, item) => sum + item.value, 0) * 10) / 10;
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}
