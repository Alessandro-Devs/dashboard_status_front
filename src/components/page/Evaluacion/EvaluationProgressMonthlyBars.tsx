"use client";

import { useEffect, useMemo, useState } from "react";
import { MonthRangeFilter, monthOptions } from "./EvaluationSankeyView";
import { getEvaluacion, normalizeMateria } from "./evaluationViewData";
import { useDashboardData } from "@/stores/DashboardDataContext";

const levels = [
  { label: "Crítico", color: "#e5252a" }, { label: "Bajo", color: "#f05b0b" },
  { label: "Medio", color: "#f2a312" }, { label: "Bueno", color: "#19a97a" }, { label: "Excelente", color: "#0c7f73" },
] as const;
type MonthlyBlock = { block: string; materia: string; subgrupo: string; universe: number; values: number[]; data: number[]; averageMath: number | null; averageLanguage: number | null };
type MonthlyData = { month: string; blocks: MonthlyBlock[] };

function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function numberValue(value: unknown) { const numeric = typeof value === "number" ? value : Number(value); return Number.isFinite(numeric) ? numeric : 0; }
function hasMonthlyBlockData(block: MonthlyBlock) {
  return block.universe > 0 || block.values.some((value) => value > 0) || block.data.some((value) => value > 0) || (block.averageMath ?? 0) > 0 || (block.averageLanguage ?? 0) > 0;
}
function loadMonthlyData(): MonthlyData[] {
  const source = (getEvaluacion() as unknown as Record<string, unknown>).resultadosPorMes;
  if (!isRecord(source)) return [];
  return monthOptions.map((month) => {
    const entry = Object.entries(source).find(([key]) => key.toLowerCase() === month.toLowerCase());
    const rawBlocks = entry && Array.isArray(entry[1]) ? entry[1] : [];
    return { month, blocks: rawBlocks.filter(isRecord).map((raw) => {
      const universe = numberValue(raw.universo);
      const data = [1, 2, 3, 4, 5].map((level) => numberValue(raw[`nivel${level}data`]));
      const values = [1, 2, 3, 4, 5].map((level, index) => numberValue(raw[`nivel${level}percent`]) || (universe > 0 ? Math.round((data[index] / universe) * 1000) / 10 : 0));
      return { block: String(raw.bloque ?? ""), materia: normalizeMateria(String(raw.materia ?? "")), subgrupo: String(raw.subgrupo ?? ""), universe, values, data, averageMath: raw.promedioMatematica == null ? null : numberValue(raw.promedioMatematica), averageLanguage: raw.promedioLengua == null ? null : numberValue(raw.promedioLengua) };
    }).filter((block) => block.block && block.materia && hasMonthlyBlockData(block)) };
  }).filter((item) => item.blocks.length > 0);
}

export default function EvaluationProgressMonthlyBars() {
  const { snapshotDate } = useDashboardData();
  const monthlyData = useMemo(() => { void snapshotDate; return loadMonthlyData(); }, [snapshotDate]);
  const [startMonth, setStartMonth] = useState<number | null>(null); const [endMonth, setEndMonth] = useState<number | null>(null);
  const [selectedBlock, setSelectedBlock] = useState(""); const [selectedSubject, setSelectedSubject] = useState(""); const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const blocks = useMemo(() => Array.from(new Set(monthlyData.flatMap((item) => item.blocks.map((block) => block.block)))), [monthlyData]);
  const subjects = useMemo(() => Array.from(new Set(monthlyData.flatMap((item) => item.blocks.map((block) => block.materia)))), [monthlyData]);
  const activeBlock = blocks.includes(selectedBlock) ? selectedBlock : blocks.find((block) => block.toLowerCase() === "b1") ?? blocks[0] ?? "";
  const activeSubject = subjects.includes(selectedSubject) ? selectedSubject : subjects.find((subject) => subject.toLowerCase() === "matematica") ?? subjects[0] ?? "";
  const subgroups = useMemo(() => Array.from(new Set(monthlyData.flatMap((item) => item.blocks.filter((block) => block.block === activeBlock && block.materia === activeSubject).map((block) => block.subgrupo)).filter(Boolean))), [monthlyData, activeBlock, activeSubject]);
  // The selected subject must be synchronized when the API snapshot changes.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!subjects.includes(selectedSubject)) setSelectedSubject(subjects.find((subject) => subject.toLowerCase() === "matemática" || subject.toLowerCase() === "matematica") ?? subjects[0] ?? ""); }, [subjects, selectedSubject]);
  const activeSubgroup = subgroups.includes(selectedSubgroup) ? selectedSubgroup : "";
  if (!monthlyData.some((item) => item.blocks.length > 0)) return null;
  const visibleMonths = startMonth !== null && endMonth !== null ? monthlyData.slice(startMonth, endMonth + 1).map((item) => {
    const matchingBlocks = item.blocks.filter((block) => block.block === activeBlock && block.materia === activeSubject);
    const visibleBlocks = activeSubgroup === "" ? aggregateBlocks(matchingBlocks) : matchingBlocks.filter((block) => block.subgrupo === activeSubgroup);
    return { ...item, blocks: visibleBlocks };
  }).filter((item) => item.blocks.length > 0) : [];
  const averages = visibleMonths.flatMap((item) => item.blocks);
  const generalAverages = getEvaluacion().promediosGenerales?.progreso;
  const generalMath = numberValue(generalAverages?.matematica);
  const generalLanguage = numberValue(generalAverages?.lengua);
  if (generalMath > 0 || generalLanguage > 0) {
    const base = averages[0];
    if (base) averages.splice(0, averages.length, { ...base, averageMath: generalMath > 0 ? generalMath : base.averageMath, averageLanguage: generalLanguage > 0 ? generalLanguage : base.averageLanguage });
  }
  return <section className="space-y-4"><MonthRangeFilter startMonth={startMonth} endMonth={endMonth} onStartChange={(value) => { setStartMonth(value); if (endMonth !== null && value > endMonth) setEndMonth(value); }} onEndChange={(value) => { setEndMonth(value); if (startMonth !== null && value < startMonth) setStartMonth(value); }} /><FilterPanel blocks={blocks} subjects={subjects} subgroups={subgroups} selectedBlock={selectedBlock} selectedSubject={selectedSubject} selectedSubgroup={selectedSubgroup} onBlockChange={(value) => { setSelectedBlock(value); setSelectedSubgroup(""); }} onSubjectChange={(value) => { setSelectedSubject(value); setSelectedSubgroup(""); }} onSubgroupChange={setSelectedSubgroup} /><div className="grid grid-cols-1 gap-3 md:grid-cols-2"><Average title="PROMEDIO MATEMÁTICA" value={average(averages.map((item) => item.averageMath))} /><Average title="PROMEDIO LENGUA" value={average(averages.map((item) => item.averageLanguage))} /></div><article className="rounded-xl border border-[#dce4ec] bg-white p-4"><div className="mb-4"><h3 className="text-[13px] font-semibold uppercase text-[#334b60]">Resultados por mes</h3><p className="mt-1 text-[9px] text-[#8a9daf]"></p></div>{visibleMonths.length > 0 ? <div className="space-y-3">{visibleMonths.map((item) => <MonthlyMonth key={item.month} month={item.month} blocks={item.blocks} />)}</div> : <div className="rounded-lg border border-dashed border-[#cbd6e0] bg-[#fbfcfd] px-5 py-8 text-center"><p className="text-[11px] font-semibold text-[#526a80]">Selecciona un mes para comenzar</p><p className="mt-1.5 text-[9px] text-[#8b9daf]">Elige un punto de inicio y uno de fin para consultar los resultados.</p></div>}</article></section>;
}
function average(values: Array<number | null>) { const valid = values.filter((value): value is number => value !== null && value > 0); return valid.length ? Math.round((valid.reduce((sum, value) => sum + value, 0) / valid.length) * 100) / 100 : null; }
function aggregateBlocks(blocks: MonthlyBlock[]): MonthlyBlock[] {
  if (blocks.length === 0) return [];
  const universe = blocks.reduce((sum, block) => sum + block.universe, 0);
  const data = blocks[0].data.map((_, index) => blocks.reduce((sum, block) => sum + (block.data[index] ?? 0), 0));
  const values = data.map((amount) => universe > 0 ? Math.round((amount / universe) * 1000) / 10 : 0);
  return [{ ...blocks[0], subgrupo: "", universe, data, values, averageMath: average(blocks.map((block) => block.averageMath)), averageLanguage: average(blocks.map((block) => block.averageLanguage)) }];
}
function Average({ title, value }: { title: string; value: number | null }) { return <article className="rounded-[9px] border border-[#dce3ea] bg-white p-5"><p className="text-[11px] font-semibold uppercase text-[#6b7f92]">{title}</p><div className="mt-3 flex items-center gap-2"><strong className="text-[25px] text-[#263d52]">{value === null ? "—" : `${value}%`}</strong><span className="rounded bg-[#fff0d7] px-2 py-1 text-[10px] font-semibold text-[#dd8d15]">Medio</span></div></article>; }
function FilterPanel({ blocks, subjects, subgroups, selectedBlock, selectedSubject, selectedSubgroup, onBlockChange, onSubjectChange, onSubgroupChange }: { blocks: string[]; subjects: string[]; subgroups: string[]; selectedBlock: string; selectedSubject: string; selectedSubgroup: string; onBlockChange: (value: string) => void; onSubjectChange: (value: string) => void; onSubgroupChange: (value: string) => void }) { return <article className="rounded-xl border border-[#dce4ec] bg-white p-3"><div className="mb-2"></div><div className="grid gap-2 sm:grid-cols-3"><FilterSelect label="Bloque" value={selectedBlock} options={blocks} onChange={onBlockChange} /><FilterSelect label="Materia" value={selectedSubject} options={subjects} onChange={onSubjectChange} /><FilterSelect label="Subgrupo" value={selectedSubgroup} options={subgroups} onChange={onSubgroupChange} /></div></article>; }
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) { return <label className="block text-[8px] font-semibold uppercase tracking-[0.04em] text-[#71869a]"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#d9e2eb] bg-[#fbfcfd] px-2.5 py-2 text-[10px] font-semibold normal-case text-[#334b60] outline-none transition focus:border-[#176fc8] focus:ring-2 focus:ring-[#eaf4ff]"><option value="" disabled hidden>Seleccione</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>; }
function MonthlyMonth({ month, blocks }: { month: string; blocks: MonthlyBlock[] }) { return <div className="space-y-2"><h4 className="text-[12px] font-semibold text-[#334b60]">{month}</h4>{blocks.map((block) => <MonthlyBar key={`${month}-${block.block}-${block.materia}-${block.subgrupo}`} {...block} />)}</div>; }
function MonthlyBar({ block, materia, subgrupo, universe, values, data }: MonthlyBlock) { const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); const hoveredValue = hoveredIndex === null ? null : values[hoveredIndex]; return <div className="rounded-[9px] border border-[#e3eaf1] bg-[#fbfcfd] p-3"><div className="mb-2 flex items-center justify-between gap-2"><h4 className="text-[11px] font-semibold text-[#334b60]">{block} · {materia}{subgrupo ? ` · ${subgrupo}` : ""}</h4><span className="text-[10px] text-[#8da0b2]">{universe || "-"} universo CE</span></div><div className="relative">{hoveredValue !== null && <div className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 min-w-[150px] rounded-lg border border-[#d9e3ec] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(30,55,80,.16)]"><div className="flex items-center gap-2 text-[10px] font-semibold text-[#334b60]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: levels[hoveredIndex as number].color }} />{levels[hoveredIndex as number].label}</div><div className="mt-1.5 flex items-baseline justify-between gap-4"><strong className="text-[15px] text-[#22384c]">{data[hoveredIndex as number] || "-"}</strong><span className="text-[10px] font-medium text-[#71869a]">{hoveredValue}%</span></div></div>}<div className="flex h-[30px] w-full overflow-hidden rounded-full bg-[#e9eef3]">{values.map((value, index) => <div key={levels[index].label} onMouseEnter={() => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)} aria-label={`${levels[index].label}: ${value}%`} className="flex cursor-pointer items-center justify-center px-1 text-[8px] font-semibold text-white transition-opacity hover:opacity-85" style={{ width: `${value}%`, background: levels[index].color }}>{value >= 8 ? `${value}%` : ""}</div>)}</div></div><div className="mt-2 flex justify-between text-[7px] font-medium uppercase tracking-[0.04em] text-[#667b8e] sm:text-[8px]"><span>Crítico</span><span>Excelente</span></div></div>; }
