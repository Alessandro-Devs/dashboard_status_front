"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import Select from "@/components/ui/Select";
import {
  ALL_BLOCKS,
  emptyLevels,
  HEATMAP_LEVELS,
  HEATMAP_MONTHS,
  HEATMAP_SUBJECTS,
  normalizeHeatmap,
  normalizeRiskFactors,
  type FactoresRiesgo,
  type HeatmapProgreso,
  type LevelValues,
  type RiskFactor,
  type RiskFactorGroup,
} from "@/lib/progressHeatmap";

type JsonValue = string | number | null | JsonValue[] | { [key: string]: JsonValue };

const inputStyle = "w-full rounded-md border border-[#d8e4ee] bg-white px-1.5 py-1 text-center text-[11px] text-[#243f57] outline-none transition focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const chipStyle = (active: boolean) => `flex h-7 cursor-pointer items-center gap-1 rounded-md border px-2.5 text-[10px] font-semibold transition ${active ? "border-[#176fc8] bg-[#176fc8] text-white" : "border-[#d8e4ee] bg-white text-[#4b6378] hover:border-[#9cc3e6]"}`;
const parseCell = (raw: string): number | null => {
  if (raw.trim() === "") return null;
  const numeric = Number(raw.replace(",", "."));
  return Number.isFinite(numeric) ? numeric : null;
};

// ---------------------------------------------------------------------------
// Heatmap: porcentaje por materia, bloque, nivel y mes.
// ---------------------------------------------------------------------------
export function ProgressHeatmapEditor({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const heatmap = normalizeHeatmap(value);
  const [subject, setSubject] = useState<string>(HEATMAP_SUBJECTS[1]);
  const [selectedBlock, setSelectedBlock] = useState<string>(heatmap.bloques[0] ?? "");
  const [newBlock, setNewBlock] = useState("");
  const block = heatmap.bloques.includes(selectedBlock) ? selectedBlock : heatmap.bloques[0] ?? "";
  const levels = heatmap.materias[subject]?.[block] ?? emptyLevels();
  const studentLevels = heatmap.estudiantes[subject]?.[block] ?? emptyLevels();
  const universe = heatmap.universos[subject]?.[block] ?? null;
  // Celdas fuera de 0–100 en cualquier materia o bloque (se avisan antes de guardar).
  const outOfRange = Object.entries(heatmap.materias).flatMap(([subjectName, blocks]) => Object.entries(blocks).flatMap(([blockName, blockLevels]) => Object.entries(blockLevels).flatMap(([levelName, months]) => months.flatMap((cell, month) => typeof cell === "number" && (cell > 100 || cell < 0) ? [`${subjectName} · ${blockName} · ${levelName} · ${HEATMAP_MONTHS[month]}: ${cell}%`] : []))));

  const emit = (next: HeatmapProgreso) => onChange(next as unknown as JsonValue);
  // Con universo capturado, el porcentaje de cada celda se calcula: estudiantes / universo × 100.
  const automatic = universe !== null && universe > 0;
  const withPercentages = (students: LevelValues, total: number | null, current: LevelValues): LevelValues => total !== null && total > 0
    ? Object.fromEntries(Object.entries(students).map(([level, months]) => [level, months.map((cell) => (cell === null ? null : Math.round((cell / total) * 1000) / 10))]))
    : current;
  const saveBlock = (students: LevelValues, total: number | null) => emit({
    ...heatmap,
    estudiantes: { ...heatmap.estudiantes, [subject]: { ...heatmap.estudiantes[subject], [block]: students } },
    universos: { ...heatmap.universos, [subject]: { ...heatmap.universos[subject], [block]: total } },
    materias: { ...heatmap.materias, [subject]: { ...heatmap.materias[subject], [block]: withPercentages(students, total, levels) } },
  });
  const setStudentCell = (level: string, month: number, raw: string) => saveBlock({ ...studentLevels, [level]: studentLevels[level].map((cell, index) => (index === month ? parseCell(raw) : cell)) }, universe);
  const setUniverse = (raw: string) => saveBlock(studentLevels, parseCell(raw));
  const addBlock = () => {
    const name = newBlock.trim().toUpperCase();
    if (!name || name === ALL_BLOCKS.toUpperCase() || heatmap.bloques.includes(name)) return;
    emit({
      bloques: [...heatmap.bloques, name],
      materias: Object.fromEntries(HEATMAP_SUBJECTS.map((item) => [item, { ...heatmap.materias[item], [name]: emptyLevels() }])),
      universos: Object.fromEntries(HEATMAP_SUBJECTS.map((item) => [item, { ...heatmap.universos[item], [name]: null }])),
      estudiantes: Object.fromEntries(HEATMAP_SUBJECTS.map((item) => [item, { ...heatmap.estudiantes[item], [name]: emptyLevels() }])),
    });
    setSelectedBlock(name);
    setNewBlock("");
  };
  const removeBlock = (name: string) => {
    const without = <T,>(table: Record<string, Record<string, T>>) => Object.fromEntries(HEATMAP_SUBJECTS.map((item) => {
      const rest = { ...table[item] };
      delete rest[name];
      return [item, rest];
    }));
    emit({ bloques: heatmap.bloques.filter((item) => item !== name), materias: without(heatmap.materias), universos: without(heatmap.universos), estudiantes: without(heatmap.estudiantes) });
  };
  const clearBlock = () => emit({
    ...heatmap,
    materias: { ...heatmap.materias, [subject]: { ...heatmap.materias[subject], [block]: emptyLevels() } },
    universos: { ...heatmap.universos, [subject]: { ...heatmap.universos[subject], [block]: null } },
    estudiantes: { ...heatmap.estudiantes, [subject]: { ...heatmap.estudiantes[subject], [block]: emptyLevels() } },
  });

  return <div className="col-span-full space-y-3">
    {outOfRange.length ? <div className="rounded-lg border border-[#f3c3c3] bg-[#fff5f5] px-3 py-2 text-[10px] text-[#b33a3a]"><p className="font-semibold">{outOfRange.length === 1 ? "Hay 1 celda" : `Hay ${outOfRange.length} celdas`} con porcentajes fuera de 0–100. Revísalas antes de guardar:</p><p className="mt-1 leading-relaxed">{outOfRange.slice(0, 6).join(" · ")}{outOfRange.length > 6 ? ` · y ${outOfRange.length - 6} más` : ""}</p></div> : null}
    <div className="flex flex-wrap items-end gap-4">
      <div>
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[.04em] text-[#71869a]">Materia</p>
        <div className="flex gap-1.5">{HEATMAP_SUBJECTS.map((item) => <button key={item} type="button" onClick={() => setSubject(item)} className={chipStyle(item === subject)}>{item}</button>)}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="mb-1 text-[9px] font-semibold uppercase tracking-[.04em] text-[#71869a]">Bloque</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {heatmap.bloques.map((item) => <span key={item} className={chipStyle(item === block)}>
            <button type="button" onClick={() => setSelectedBlock(item)} className="cursor-pointer">{item}</button>
            <button type="button" onClick={() => removeBlock(item)} aria-label={`Quitar bloque ${item}`} title="Quitar bloque (borra sus datos del heatmap)" className="cursor-pointer opacity-60 hover:opacity-100"><X size={11} /></button>
          </span>)}
          <span className="flex items-center gap-1">
            <input value={newBlock} onChange={(event) => setNewBlock(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addBlock(); } }} placeholder="Nuevo bloque" className="h-7 w-[92px] rounded-md border border-dashed border-[#b9cfe2] bg-white px-2 text-[10px] text-[#243f57] outline-none focus:border-[#5d9ed8]" />
            <button type="button" onClick={addBlock} className="flex h-7 cursor-pointer items-center gap-1 rounded-md border border-[#b9cfe2] bg-[#f3f8fd] px-2 text-[10px] font-semibold text-[#176fc8] hover:bg-[#e8f2fc]"><Plus size={11} />Agregar</button>
          </span>
        </div>
      </div>
    </div>

    {block ? <div className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-bold text-[#294b68]">{subject} · {block}<span className="ml-2 text-[9px] font-medium text-[#8a9cab]">Escribe el universo y los estudiantes por nivel; el porcentaje se calcula solo.</span></p>
        <button type="button" onClick={clearBlock} className="flex cursor-pointer items-center gap-1 text-[9px] font-semibold text-[#c05050] hover:underline"><Trash2 size={11} />Vaciar tabla</button>
      </div>
      <label className="mb-3 flex w-fit items-center gap-2 rounded-md border border-[#d8e4ee] bg-white px-2.5 py-1.5">
        <span className="whitespace-nowrap text-[9px] font-semibold uppercase tracking-[.04em] text-[#71869a]">Universo de estudiantes · {block}</span>
        <input type="number" inputMode="numeric" min={0} step={1} value={universe ?? ""} placeholder="Ej. 1200" onChange={(event) => setUniverse(event.target.value)} className={`${inputStyle} !w-[110px]`} aria-label={`Universo ${subject} ${block}`} />
      </label>
      <p className="mb-1 text-[10px] font-semibold text-[#4b6378]">Cantidad de estudiantes por nivel<span className="ml-2 text-[9px] font-medium text-[#8a9cab]">También se muestra al pasar el mouse en el dashboard.</span></p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-1">
          <thead><tr><th className="w-[92px]" />{HEATMAP_MONTHS.map((month) => <th key={month} className="text-[9px] font-semibold text-[#6b8196]">{month.slice(0, 3)}</th>)}</tr></thead>
          <tbody>{HEATMAP_LEVELS.map((level) => <tr key={level.name}>
            <td className="whitespace-nowrap pr-1 text-[10px] font-semibold text-[#4b6378]"><span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: level.dotColor }} />{level.name}</td>
            {HEATMAP_MONTHS.map((month, index) => <td key={month}>
              <input type="number" inputMode="numeric" min={0} step={1} aria-label={`Estudiantes ${level.name} ${month}`} value={studentLevels[level.name][index] ?? ""} onChange={(event) => setStudentCell(level.name, index, event.target.value)} className={inputStyle} />
            </td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mb-1 mt-3 text-[10px] font-semibold text-[#4b6378]">Porcentaje por nivel<span className="ml-2 text-[9px] font-medium text-[#8a9cab]">{automatic ? "Se calcula automáticamente: estudiantes ÷ universo × 100." : "Escribe el universo del bloque para calcular los porcentajes."}</span></p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-separate border-spacing-1">
          <thead><tr><th className="w-[92px]" />{HEATMAP_MONTHS.map((month) => <th key={month} className="text-[9px] font-semibold text-[#6b8196]">{month.slice(0, 3)}</th>)}</tr></thead>
          <tbody>{HEATMAP_LEVELS.map((level) => <tr key={level.name}>
            <td className="whitespace-nowrap pr-1 text-[10px] font-semibold text-[#4b6378]"><span className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle" style={{ backgroundColor: level.dotColor }} />{level.name}</td>
            {HEATMAP_MONTHS.map((month, index) => <td key={month}>
              <input type="number" inputMode="decimal" min={0} max={100} step="any" aria-label={`${level.name} ${month}`} value={levels[level.name][index] ?? ""} disabled readOnly className={`${inputStyle} cursor-not-allowed !border-transparent !bg-[#eef4f9] font-semibold !text-[#176fc8] ${(levels[level.name][index] ?? 0) > 100 || (levels[level.name][index] ?? 0) < 0 ? "border-[#e25c5c] bg-[#fff3f3] text-[#c03030]" : ""}`} title={(levels[level.name][index] ?? 0) > 100 ? "El porcentaje no puede ser mayor que 100" : undefined} />
            </td>)}
          </tr>)}</tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[9px] text-[#8a9cab]">El bloque “Todos” del dashboard se calcula automáticamente con el promedio de los bloques capturados.</p>
    </div> : <p className="rounded-lg border border-dashed border-[#cbd6e0] p-4 text-center text-[10px] text-[#8b9daf]">Agrega un bloque para capturar resultados.</p>}
  </div>;
}

// ---------------------------------------------------------------------------
// Factores de riesgo: cualquier bloque puede tenerlos.
// ---------------------------------------------------------------------------
const emptyFactor = (): RiskFactor => ({ nombre: "", porcentaje: null, estudiantes: null });
const groupLabels: Record<keyof RiskFactorGroup, { title: string; tone: string }> = {
  intervenible: { title: "Intervenible", tone: "border-[#bfe3d7] bg-[#f3faf7] text-[#08775e]" },
  noIntervenible: { title: "No intervenible", tone: "border-[#f5d9ae] bg-[#fffaf1] text-[#b06a0d]" },
};

export function RiskFactorsEditor({ value, blocks, onChange }: { value: JsonValue; blocks: string[]; onChange: (value: JsonValue) => void }) {
  const factors = normalizeRiskFactors(value);
  const configured = Object.keys(factors);
  const available = [...new Set([...blocks, ...configured])].filter((item) => !configured.includes(item));
  const [toAdd, setToAdd] = useState("");
  const emit = (next: FactoresRiesgo) => onChange(next as unknown as JsonValue);

  const updateGroup = (block: string, kind: keyof RiskFactorGroup, items: RiskFactor[]) => emit({ ...factors, [block]: { ...factors[block], [kind]: items } });
  const addBlock = () => {
    const name = toAdd || available[0];
    if (!name) return;
    emit({ ...factors, [name]: { intervenible: [emptyFactor()], noIntervenible: [emptyFactor()] } });
    setToAdd("");
  };
  const removeBlock = (block: string) => {
    const rest = { ...factors };
    delete rest[block];
    emit(rest);
  };

  return <div className="col-span-full space-y-3">
    <div className="flex flex-wrap items-center gap-2">
      <p className="text-[10px] text-[#5d7285]">El botón “Factores de riesgo” aparece en el dashboard solo en los bloques configurados aquí.</p>
      {available.length ? <span className="ml-auto flex items-center gap-1.5">
        <Select value={toAdd || available[0]} options={available} onChange={setToAdd} size="sm" ariaLabel="Bloque para agregar" className="w-[90px]" />
        <button type="button" onClick={addBlock} className="flex h-7 cursor-pointer items-center gap-1 rounded-md border border-[#b9cfe2] bg-[#f3f8fd] px-2.5 text-[10px] font-semibold text-[#176fc8] hover:bg-[#e8f2fc]"><Plus size={11} />Agregar bloque</button>
      </span> : null}
    </div>

    {configured.length === 0 ? <p className="rounded-lg border border-dashed border-[#cbd6e0] p-4 text-center text-[10px] text-[#8b9daf]">Ningún bloque tiene factores de riesgo. Agrega uno para empezar.</p> : null}

    {configured.map((block) => <div key={block} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold text-[#294b68]">Bloque {block}{!blocks.includes(block) ? <span className="ml-2 text-[9px] font-medium text-[#c87913]">No está en el heatmap</span> : null}</p>
        <button type="button" onClick={() => removeBlock(block)} className="flex cursor-pointer items-center gap-1 text-[9px] font-semibold text-[#c05050] hover:underline"><Trash2 size={11} />Quitar bloque</button>
      </div>
      <div className="grid gap-2 lg:grid-cols-2">
        {(Object.keys(groupLabels) as (keyof RiskFactorGroup)[]).map((kind) => {
          const items = factors[block][kind];
          return <div key={kind} className={`rounded-md border p-2 ${groupLabels[kind].tone}`}>
            <p className="mb-1.5 text-[10px] font-bold">{groupLabels[kind].title}</p>
            <div className="mb-1 grid grid-cols-[1fr_64px_80px_22px] gap-1 text-[8px] font-semibold uppercase text-[#71869a]"><span>Factor</span><span>%</span><span>Estudiantes</span><span /></div>
            <div className="space-y-1">
              {items.map((item, index) => <div key={index} className="grid grid-cols-[1fr_64px_80px_22px] items-center gap-1">
                <input value={item.nombre} placeholder="Nombre del factor" onChange={(event) => updateGroup(block, kind, items.map((row, rowIndex) => rowIndex === index ? { ...row, nombre: event.target.value } : row))} className={`${inputStyle} text-left`} />
                <input type="number" inputMode="decimal" min={0} max={100} step="any" value={item.porcentaje ?? ""} onChange={(event) => updateGroup(block, kind, items.map((row, rowIndex) => rowIndex === index ? { ...row, porcentaje: parseCell(event.target.value) } : row))} className={inputStyle} />
                <input type="number" inputMode="numeric" min={0} step={1} value={item.estudiantes ?? ""} onChange={(event) => updateGroup(block, kind, items.map((row, rowIndex) => rowIndex === index ? { ...row, estudiantes: parseCell(event.target.value) } : row))} className={inputStyle} />
                <button type="button" onClick={() => updateGroup(block, kind, items.filter((_, rowIndex) => rowIndex !== index))} aria-label="Quitar factor" className="flex h-6 w-6 cursor-pointer items-center justify-center rounded text-[#9aabbb] hover:bg-white hover:text-[#c05050]"><Trash2 size={11} /></button>
              </div>)}
            </div>
            <button type="button" onClick={() => updateGroup(block, kind, [...items, emptyFactor()])} className="mt-1.5 flex cursor-pointer items-center gap-1 text-[9px] font-semibold text-[#176fc8] hover:underline"><Plus size={11} />Agregar factor</button>
          </div>;
        })}
      </div>
    </div>)}
  </div>;
}
