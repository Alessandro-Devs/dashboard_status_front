"use client";

import { ChevronLeft, ChevronRight, ClipboardPaste, FileUp, Plus, Search, Trash2 } from "lucide-react";
import { useRef, useState } from "react";
import { parseSchoolCompliance } from "@/lib/schoolCompliance";

// Captura de "Cumplimiento por centro educativo" (gestionCalidad.cumplimientoPorCentro).
// Como pueden ser más de 2,000 centros, se cargan pegando desde Excel o importando un CSV;
// después se pueden revisar, buscar, corregir o eliminar fila por fila con paginación.

export type SchoolComplianceRow = { codigo: string; nombre: string; cumplimiento: number | "" };

const PAGE_SIZE = 10;
const inputClass = "w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function toSchoolRows(value: unknown): SchoolComplianceRow[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const row = item as Record<string, unknown>;
    const cumplimiento = typeof row.cumplimiento === "number" && Number.isFinite(row.cumplimiento) ? row.cumplimiento : "";
    return [{ codigo: String(row.codigo ?? ""), nombre: String(row.nombre ?? ""), cumplimiento }];
  });
}

export default function SchoolComplianceEditor({ value, onChange }: { value: SchoolComplianceRow[]; onChange: (rows: SchoolComplianceRow[]) => void }) {
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const [mode, setMode] = useState<"replace" | "append">("replace");
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = (text: string) => {
    const { rows, skipped } = parseSchoolCompliance(text);
    if (!rows.length) {
      setMessage({ tone: "warn", text: "No se encontraron filas válidas. Usa tres columnas: Código, Nombre y Cumplimiento." });
      return;
    }
    onChange(mode === "replace" ? rows : [...value, ...rows]);
    setMessage({ tone: "ok", text: `Se cargaron ${rows.length.toLocaleString("es-SV")} centros${skipped ? `; se omitieron ${skipped} filas sin cumplimiento válido` : ""}.` });
    setPasted("");
    setPasteOpen(false);
    setQuery("");
    setPage(1);
  };

  const importFile = async (file: File | undefined) => {
    if (!file) return;
    load(await file.text());
    if (fileRef.current) fileRef.current.value = "";
  };

  const term = normalize(query.trim());
  const indexed = value.map((row, index) => ({ row, index })).filter(({ row }) => !term || row.codigo.toLowerCase().includes(term) || normalize(row.nombre).includes(term));
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
        <button type="button" onClick={() => { onChange([{ codigo: "", nombre: "", cumplimiento: "" }, ...value]); setQuery(""); setPage(1); }} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={12}/>Agregar centro</button>
        {value.length ? <button type="button" onClick={() => { if (window.confirm("¿Quitar todos los centros cargados?")) { onChange([]); setMessage(null); } }} className="inline-flex items-center gap-1 rounded-md border border-[#f3d2c2] bg-white px-2 py-1 text-[10px] font-semibold text-[#c2410c]"><Trash2 size={12}/>Vaciar</button> : null}
      </div>
    </div>

    {pasteOpen ? <div className="rounded-lg border border-[#dce7ef] bg-white p-3">
      <p className="text-[10px] font-semibold text-[#5d7285]">Copia en Excel las columnas <strong>Código, Nombre y Cumplimiento</strong> (con o sin encabezado) y pégalas aquí.</p>
      <textarea value={pasted} onChange={(event) => setPasted(event.target.value)} rows={6} placeholder={"Código\tNombre\tCumplimiento\n10001\tCentro Escolar José Matías Delgado\t85.5"} className={`${inputClass} mt-2 font-mono text-[10px]`}/>
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
      <div className="flex items-center justify-between gap-2 border-b border-[#e8eef3] p-2.5">
        <label className="relative block w-full max-w-[280px]"><Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9cab]"/><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código o nombre" className={`${inputClass} pl-7`}/></label>
        <span className="shrink-0 text-[9px] text-[#8a9cab]">{indexed.length.toLocaleString("es-SV")} resultados</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-[10px]">
          <thead className="bg-[#f5f9fc] text-[#5d7285]"><tr><th className="w-[120px] px-2.5 py-2 text-left font-semibold">Código</th><th className="px-2.5 py-2 text-left font-semibold">Nombre del centro educativo</th><th className="w-[120px] px-2.5 py-2 text-right font-semibold">Cumplimiento (%)</th><th className="w-9" aria-label="Acciones"/></tr></thead>
          <tbody>
            {visible.map(({ row, index }) => <tr key={index} className="border-t border-[#eef2f6]">
              <td className="px-2 py-1.5"><input value={row.codigo} placeholder="Ej. 10001" onChange={(event) => update(index, { ...row, codigo: event.target.value })} className={inputClass} aria-label="Código"/></td>
              <td className="px-2 py-1.5"><input value={row.nombre} placeholder="Ej. Centro Escolar José Matías Delgado" onChange={(event) => update(index, { ...row, nombre: event.target.value })} className={inputClass} aria-label="Nombre"/></td>
              <td className="px-2 py-1.5"><input type="number" min={0} max={100} step="any" value={row.cumplimiento} placeholder="85.5" onChange={(event) => update(index, { ...row, cumplimiento: event.target.value === "" ? "" : Number(event.target.value) })} className={`${inputClass} text-right tabular-nums`} aria-label="Cumplimiento"/></td>
              <td className="px-1 py-1.5 text-center"><button type="button" onClick={() => onChange(value.filter((_, rowIndex) => rowIndex !== index))} className="rounded-md p-1 text-[#c2410c] hover:bg-[#fff1ea]" aria-label={`Eliminar ${row.nombre || row.codigo || "centro"}`}><Trash2 size={12}/></button></td>
            </tr>)}
            {!visible.length ? <tr><td colSpan={4} className="px-3 py-6 text-center text-[10px] text-[#8a9cab]">No hay centros que coincidan con la búsqueda.</td></tr> : null}
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
