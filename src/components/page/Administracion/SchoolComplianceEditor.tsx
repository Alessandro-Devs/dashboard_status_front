"use client";

import { ChevronLeft, ChevronRight, ClipboardPaste, FileUp, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import Select from "@/components/ui/Select";
import { parseSchoolCompliance } from "@/lib/schoolCompliance";

// Captura de "Cumplimiento por centro educativo" (gestionCalidad.cumplimientoPorCentro).
// Como pueden ser más de 2,000 centros, se cargan pegando desde Excel o importando un CSV;
// después se pueden revisar, buscar, corregir o eliminar fila por fila con paginación.

export type SchoolComplianceRow = { codigo: string; nombre: string; grupo: string; cumplimiento: number | "" };

const PAGE_SIZE = 10;
const inputClass = "w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const ALL = "__todos__";
const NO_GROUP = "__sin_grupo__";
// Mismos niveles que el dashboard, más "Sin cumplimiento" para encontrar filas incompletas.
const LEVELS = [
  { value: "todos", label: "Todos los niveles", test: () => true },
  { value: "excelente", label: "Excelente (80% o más)", test: (row: SchoolComplianceRow) => typeof row.cumplimiento === "number" && row.cumplimiento >= 80 },
  { value: "medio", label: "Medio (51% a 79%)", test: (row: SchoolComplianceRow) => typeof row.cumplimiento === "number" && row.cumplimiento >= 51 && row.cumplimiento < 80 },
  { value: "bajo", label: "Bajo (50% o menos)", test: (row: SchoolComplianceRow) => typeof row.cumplimiento === "number" && row.cumplimiento < 51 },
  { value: "vacio", label: "Sin cumplimiento", test: (row: SchoolComplianceRow) => row.cumplimiento === "" },
];
const SORTS: Array<{ value: string; label: string; compare?: (a: SchoolComplianceRow, b: SchoolComplianceRow) => number }> = [
  { value: "carga", label: "Orden de carga" },
  { value: "mayor", label: "Mayor cumplimiento", compare: (a, b) => (Number(b.cumplimiento) || 0) - (Number(a.cumplimiento) || 0) },
  { value: "menor", label: "Menor cumplimiento", compare: (a, b) => (Number(a.cumplimiento) || 0) - (Number(b.cumplimiento) || 0) },
  { value: "codigo", label: "Código", compare: (a, b) => a.codigo.localeCompare(b.codigo, "es", { numeric: true }) },
  { value: "nombre", label: "Nombre (A-Z)", compare: (a, b) => a.nombre.localeCompare(b.nombre, "es") },
  { value: "grupo", label: "Grupo", compare: (a, b) => (!a.grupo !== !b.grupo ? (a.grupo ? -1 : 1) : a.grupo.localeCompare(b.grupo, "es", { numeric: true })) },
];
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function toSchoolRows(value: unknown): SchoolComplianceRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    const cumplimiento = typeof row.cumplimiento === "number" && Number.isFinite(row.cumplimiento) ? row.cumplimiento : "";
    return [{ codigo: String(row.codigo ?? ""), nombre: String(row.nombre ?? ""), grupo: String(row.grupo ?? ""), cumplimiento }];
  });
}

export default function SchoolComplianceEditor({ value, onChange }: { value: SchoolComplianceRow[]; onChange: (rows: SchoolComplianceRow[]) => void }) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const [level, setLevel] = useState("todos");
  const [sort, setSort] = useState("carga");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (text: string) => {
    const { rows, skipped } = parseSchoolCompliance(text);
    if (!rows.length) {
      setMessage({ tone: "warn", text: "No se encontraron filas válidas. Usa las columnas Código, Nombre, Grupo y Cumplimiento." });
      return;
    }
    onChange(mode === "replace" ? rows : [...value, ...rows]);
    setMessage({ tone: "ok", text: `Se cargaron ${rows.length.toLocaleString("es-SV")} centros${skipped ? `; se omitieron ${skipped} filas sin cumplimiento válido` : ""}.` });
    setPasted("");
    setPasteOpen(false);
    setQuery("");
    setGroup(ALL);
    setLevel("todos");
    setPage(1);
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    load(await file.text());
    if (fileRef.current) fileRef.current.value = "";
  };

  const term = normalize(query.trim());
  // Grupos presentes en los datos, con cantidad de centros y promedio.
  const groups = [...new Set(value.map((row) => row.grupo.trim()))]
    .sort((a, b) => (!a ? 1 : !b ? -1 : a.localeCompare(b, "es", { numeric: true })))
    .map((name) => {
      const items = value.filter((row) => row.grupo.trim() === name);
      const values = items.map((row) => row.cumplimiento).filter((item): item is number => typeof item === "number");
      return { id: name || NO_GROUP, label: name || "Sin grupo", count: items.length, average: values.length ? values.reduce((sum, item) => sum + item, 0) / values.length : null };
    });
  const activeGroup = groups.some((item) => item.id === group) ? group : ALL;
  const levelTest = LEVELS.find((item) => item.value === level)?.test ?? (() => true);
  const compare = SORTS.find((item) => item.value === sort)?.compare;
  const indexed = value.map((row, index) => ({ row, index }))
    .filter(({ row }) => (activeGroup === ALL || (row.grupo.trim() || NO_GROUP) === activeGroup) && levelTest(row) && (!term || row.codigo.toLowerCase().includes(term) || normalize(row.nombre).includes(term) || normalize(row.grupo).includes(term)))
    .sort((a, b) => (compare ? compare(a.row, b.row) : 0) || a.index - b.index);
  const filtersActive = activeGroup !== ALL || level !== "todos" || term !== "" || sort !== "carga";
  const clearFilters = () => { setQuery(""); setGroup(ALL); setLevel("todos"); setSort("carga"); setPage(1); };
  const totalPages = Math.max(1, Math.ceil(indexed.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = indexed.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const numbers = value.map((row) => row.cumplimiento).filter((item): item is number => typeof item === "number");
  const average = numbers.length ? numbers.reduce((sum, item) => sum + item, 0) / numbers.length : 0;
  const update = (index: number, next: SchoolComplianceRow) => onChange(value.map((row, rowIndex) => (rowIndex === index ? next : row)));

  return <div className="space-y-3">
    {/* Resumen y acciones */}
    <div className="flex flex-col gap-2 rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3 md:flex-row md:items-center md:justify-between">
      <div><p className="text-[11px] font-bold text-[#294b68]">{value.length.toLocaleString("es-SV")} centros cargados</p><p className="text-[9px] text-[#8a9cab]">{value.length ? `Cumplimiento promedio ${average.toFixed(1)}%` : "Pega los datos desde Excel o importa un archivo CSV."}</p></div>
      <div className="flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setPasteOpen((open) => !open)} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><ClipboardPaste size={12}/>Pegar desde Excel</button>
        <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><FileUp size={12}/>Importar CSV</button>
        <input ref={fileRef} type="file" accept=".csv,.txt,text/csv,text/plain" className="hidden" onChange={(event) => importFile(event.target.files?.[0])}/>
        <button type="button" onClick={() => { onChange([{ codigo: "", nombre: "", grupo: "", cumplimiento: "" }, ...value]); setQuery(""); setGroup(ALL); setLevel("todos"); setSort("carga"); setPage(1); }} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={12}/>Agregar centro</button>
        {value.length ? <button type="button" onClick={() => { if (window.confirm("¿Quitar todos los centros cargados?")) { onChange([]); setMessage(null); } }} className="inline-flex items-center gap-1 rounded-md border border-[#f3d2c2] bg-white px-2 py-1 text-[10px] font-semibold text-[#c2410c]"><Trash2 size={12}/>Vaciar</button> : null}
      </div>
    </div>

    {pasteOpen ? <div className="rounded-lg border border-[#dce7ef] bg-white p-3">
      <p className="text-[10px] font-semibold text-[#5d7285]">Copia en Excel las columnas <strong>Código, Nombre, Grupo y Cumplimiento</strong> y pégalas aquí. Con encabezado, las columnas pueden venir en cualquier orden.</p>
      <textarea value={pasted} onChange={(event) => setPasted(event.target.value)} rows={6} placeholder={"Código\tNombre\tGrupo\tCumplimiento\n10001\tCentro Escolar José Matías Delgado\tG1 F3\t85.5"} className={`${inputClass} mt-2 font-mono text-[10px]`}/>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-3 text-[10px] text-[#5d7285]">
          <label className="flex items-center gap-1"><input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")}/>Reemplazar los actuales</label>
          <label className="flex items-center gap-1"><input type="radio" checked={mode === "append"} onChange={() => setMode("append")}/>Agregar a los actuales</label>
        </div>
        <button type="button" onClick={() => load(pasted)} disabled={!pasted.trim()} className="rounded-md bg-[#176fc8] px-3 py-1.5 text-[10px] font-semibold text-white disabled:opacity-50">Cargar datos</button>
      </div>
    </div> : null}

    {message ? <p className={`rounded-md px-3 py-2 text-[10px] font-medium ${message.tone === "ok" ? "bg-[#e9f8ef] text-[#157a40]" : "bg-[#fff6e5] text-[#a15c07]"}`}>{message.text}</p> : null}

    {/* Revisión y edición */}
    {value.length ? <div className="rounded-lg border border-[#dce7ef] bg-white">
      <div className="space-y-2 border-b border-[#e8eef3] p-2.5">
        {groups.some((item) => item.id !== NO_GROUP) ? <div className="flex gap-1.5 overflow-x-auto pb-0.5">
          {groups.map((item) => {
            const active = activeGroup === item.id;
            return <button key={item.id} type="button" onClick={() => { setGroup(active ? ALL : item.id); setPage(1); }} aria-pressed={active} className={`shrink-0 rounded-md border px-2 py-1 text-left text-[9px] transition ${active ? "border-[#176fc8] bg-[#eef6ff]" : "border-[#dce7ef] bg-white hover:border-[#bfd8eb]"}`}>
              <span className="font-semibold text-[#294b68]">{item.label}</span>
              <span className="ml-1.5 tabular-nums text-[#8a9cab]">{item.count.toLocaleString("es-SV")} CE{item.average !== null ? ` · ${item.average.toFixed(1)}%` : ""}</span>
            </button>;
          })}
        </div> : null}
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_160px_180px_200px]">
          <label className="relative block"><Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9cab]"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código, nombre o grupo" className={`${inputClass} pl-7`}/></label>
          <Select size="form" ariaLabel="Filtrar por grupo" value={activeGroup} onChange={(next) => { setGroup(next); setPage(1); }} options={[{ value: ALL, label: "Todos los grupos" }, ...groups.map((item) => ({ value: item.id, label: `${item.label} (${item.count.toLocaleString("es-SV")})` }))]}/>
          <Select size="form" ariaLabel="Filtrar por nivel" value={level} onChange={(next) => { setLevel(next); setPage(1); }} options={LEVELS.map(({ value: optionValue, label }) => ({ value: optionValue, label }))}/>
          <Select size="form" ariaLabel="Ordenar" value={sort} onChange={(next) => { setSort(next); setPage(1); }} options={SORTS.map(({ value: optionValue, label }) => ({ value: optionValue, label: `Ordenar: ${label}` }))}/>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] text-[#8a9cab]">{indexed.length.toLocaleString("es-SV")} de {value.length.toLocaleString("es-SV")} centros</span>
          {filtersActive ? <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-semibold text-[#176fc8] hover:bg-[#eef6ff]"><RotateCcw size={11}/>Limpiar filtros</button> : null}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-[10px]">
          <thead className="bg-[#f5f9fc] text-[#5d7285]"><tr><th className="w-[120px] px-2.5 py-2 text-left font-semibold">Código</th><th className="px-2.5 py-2 text-left font-semibold">Nombre del centro educativo</th><th className="w-[110px] px-2.5 py-2 text-left font-semibold">Grupo</th><th className="w-[120px] px-2.5 py-2 text-right font-semibold">Cumplimiento (%)</th><th className="w-9" aria-label="Acciones"/></tr></thead>
          <tbody>
            {visible.map(({ row, index }) => <tr key={index} className="border-t border-[#eef2f6]">
              <td className="px-2 py-1.5"><input value={row.codigo} placeholder="Ej. 10001" onChange={(event) => update(index, { ...row, codigo: event.target.value })} className={inputClass} aria-label="Código"/></td>
              <td className="px-2 py-1.5"><input value={row.nombre} placeholder="Ej. Centro Escolar José Matías Delgado" onChange={(event) => update(index, { ...row, nombre: event.target.value })} className={inputClass} aria-label="Nombre"/></td>
              <td className="px-2 py-1.5"><input value={row.grupo} placeholder="Ej. G1 F3" onChange={(event) => update(index, { ...row, grupo: event.target.value })} className={inputClass} aria-label="Grupo"/></td>
              <td className="px-2 py-1.5"><input type="number" min={0} max={100} step="any" value={row.cumplimiento} placeholder="85.5" onChange={(event) => update(index, { ...row, cumplimiento: event.target.value === "" ? "" : Number(event.target.value) })} className={`${inputClass} text-right tabular-nums`} aria-label="Cumplimiento"/></td>
              <td className="px-1 py-1.5 text-center"><button type="button" onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))} className="rounded-md p-1 text-[#c2410c] hover:bg-[#fff1ea]" aria-label={`Eliminar ${row.nombre || row.codigo || "centro"}`}><Trash2 size={12}/></button></td>
            </tr>)}
            {!visible.length ? <tr><td colSpan={5} className="px-3 py-6 text-center text-[10px] text-[#8a9cab]">No hay centros que coincidan con los filtros.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-[#e8eef3] px-2.5 py-2 text-[9px] text-[#71869a]">
        <span>Página {current} de {totalPages}</span>
        <div className="flex gap-1">
          <button type="button" disabled={current === 1} onClick={() => setPage(current - 1)} className="rounded-md border border-[#d8e4ee] p-1 disabled:opacity-40" aria-label="Página anterior"><ChevronLeft size={12}/></button>
          <button type="button" disabled={current === totalPages} onClick={() => setPage(current + 1)} className="rounded-md border border-[#d8e4ee] p-1 disabled:opacity-40" aria-label="Página siguiente"><ChevronRight size={12}/></button>
        </div>
      </div>
    </div> : null}
  </div>;
}
