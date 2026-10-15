"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, School, Search } from "lucide-react";
import { useState } from "react";
import { readSchoolCompliance, type SchoolCompliance } from "@/lib/schoolCompliance";
import { CardTitle, DashboardCard } from "./DashboardUI";
import { qualityData } from "./qualityData";

type SchoolRow = SchoolCompliance;

// Cumplimiento por centro educativo. Se captura en Administración > Gestión de Calidad
// ("Cumplimiento por centro educativo", pegando desde Excel o importando un CSV) y se guarda en
// gestionCalidad.cumplimientoPorCentro. Puede tener más de 2,000 centros, por eso va paginada.

const LEVELS = [
  { id: "todos", label: "Todos", test: () => true },
  { id: "excelente", label: "Excelente", test: (value: number) => value >= 80, color: "#16813f" },
  { id: "medio", label: "Medio", test: (value: number) => value >= 51 && value < 80, color: "#eab308" },
  { id: "bajo", label: "Bajo", test: (value: number) => value < 51, color: "#e33a3a" },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];
type SortKey = keyof SchoolRow;

const PAGE_SIZES = [10, 25, 50, 100];
const complianceColor = (value: number) => (value >= 80 ? "#16813f" : value >= 51 ? "#eab308" : "#e33a3a");
const complianceText = (value: number) => (value >= 80 ? "#13733a" : value >= 51 ? "#a16207" : "#c62828");
const formatInt = (value: number) => value.toLocaleString("es-SV");
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Números de página con "…" para no mostrar cientos de botones.
function pageItems(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? ["gap" as const, page] : [page]));
}

export default function SchoolComplianceTable() {
  // Se lee en cada render: al cambiar la fecha de corte llegan otros datos.
  const SCHOOLS = readSchoolCompliance((qualityData as { cumplimientoPorCentro?: unknown }).cumplimientoPorCentro);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<LevelId>("todos");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "codigo", dir: "asc" });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const counts = Object.fromEntries(LEVELS.map((item) => [item.id, SCHOOLS.filter((school) => item.test(school.cumplimiento)).length])) as Record<LevelId, number>;
  const average = SCHOOLS.reduce((sum, school) => sum + school.cumplimiento, 0) / Math.max(1, SCHOOLS.length);

  const rows = (() => {
    const term = normalize(query.trim());
    const test = LEVELS.find((item) => item.id === level)?.test ?? (() => true);
    const filtered = SCHOOLS.filter((school) => test(school.cumplimiento) && (!term || school.codigo.includes(term) || normalize(school.nombre).includes(term)));
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      if (sort.key === "cumplimiento") return (a.cumplimiento - b.cumplimiento) * factor;
      if (sort.key === "codigo") return a.codigo.localeCompare(b.codigo, "es", { numeric: true }) * factor;
      return a.nombre.localeCompare(b.nombre, "es") * factor;
    });
  })();

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);

  const toggleSort = (key: SortKey) => {
    setSort((previous) => (previous.key === key ? { key, dir: previous.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "cumplimiento" ? "desc" : "asc" }));
    setPage(1);
  };

  if (!SCHOOLS.length) return null;
  return <DashboardCard className="mt-4">
    <CardTitle title="Cumplimiento por centro educativo" subtitle={`${formatInt(SCHOOLS.length)} centros · promedio ${average.toFixed(1)}%`} icon={<span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e8f3ff]"><School className="h-4 w-4 text-[#1670d2]" /></span>} />

    {/* Filtros */}
    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-1.5">
        {LEVELS.map((item) => {
          const active = level === item.id;
          return <button key={item.id} type="button" onClick={() => { setLevel(item.id); setPage(1); }} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold transition ${active ? "bg-[#17324a] text-white" : "bg-[#f1f5f9] text-[#4f6a82] hover:bg-[#e6edf4]"}`}>
            {"color" in item ? <i className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} /> : null}
            {item.label}
            <span className={`tabular-nums ${active ? "text-white/70" : "text-[#8a9bb0]"}`}>{formatInt(counts[item.id])}</span>
          </button>;
        })}
      </div>
      <label className="relative block w-full md:w-[260px]">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9bb0]" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por código o nombre" className="h-8 w-full rounded-md border border-[#d6dfe8] bg-white pl-8 pr-3 text-[10px] text-[#17324a] outline-none transition placeholder:text-[#9aabbd] focus:border-[#1670d2] focus:ring-2 focus:ring-[#1670d2]/15" />
      </label>
    </div>

    {/* Tabla */}
    <div className="mt-3 overflow-x-auto rounded-lg border border-[#e3e9ef]">
      <table className="w-full border-collapse text-[10px]">
        <thead className="bg-[#f6f9fc]">
          <tr className="text-[9px] font-semibold uppercase tracking-[.04em] text-[#6f8295]">
            <SortHeader label="Código" column="codigo" sort={sort} onSort={toggleSort} className="sm:w-[96px]" />
            <SortHeader label="Centro educativo" column="nombre" sort={sort} onSort={toggleSort} />
            <SortHeader label="Cumplimiento" column="cumplimiento" sort={sort} onSort={toggleSort} className="sm:w-[200px]" align="right" />
          </tr>
        </thead>
        <tbody>
          {visible.length ? visible.map((school) => <tr key={`${school.codigo}-${school.nombre}`} className="border-t border-[#eef2f6] transition-colors hover:bg-[#f8fbfe]">
            <td className="px-2.5 py-2.5 sm:px-3 font-semibold tabular-nums text-[#1670d2]">{school.codigo}</td>
            <td className="px-2.5 py-2.5 sm:px-3 text-[#29445b]">{school.nombre}</td>
            <td className="px-2.5 py-2.5 sm:px-3">
              <div className="flex items-center justify-end gap-2.5">
                <div className="hidden h-1.5 w-full max-w-[110px] overflow-hidden sm:block rounded-full bg-[#edf2f7]"><div className="h-full rounded-full" style={{ width: `${school.cumplimiento}%`, backgroundColor: complianceColor(school.cumplimiento) }} /></div>
                <span className="w-[42px] text-right font-semibold tabular-nums" style={{ color: complianceText(school.cumplimiento) }}>{school.cumplimiento.toFixed(1)}%</span>
              </div>
            </td>
          </tr>) : <tr><td colSpan={3} className="px-3 py-10 text-center text-[10px] text-[#8a9bb0]">No hay centros educativos que coincidan con la búsqueda.</td></tr>}
        </tbody>
      </table>
    </div>

    {/* Paginación */}
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[9px] text-[#71869a]">
        <span>{rows.length ? <>Mostrando <strong className="font-semibold text-[#29445b]">{formatInt(start + 1)}–{formatInt(Math.min(start + pageSize, rows.length))}</strong> de <strong className="font-semibold text-[#29445b]">{formatInt(rows.length)}</strong></> : "Sin resultados"}</span>
        <label className="flex items-center gap-1.5">Filas
          <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="h-7 rounded-md border border-[#d6dfe8] bg-white px-1.5 text-[9px] text-[#29445b] outline-none focus:border-[#1670d2]">
            {PAGE_SIZES.map((size) => <option key={size} value={size}>{size}</option>)}
          </select>
        </label>
      </div>
      <nav aria-label="Paginación" className="flex items-center gap-1 self-end sm:self-auto">
        <PageButton label="Página anterior" disabled={current === 1} onClick={() => setPage(current - 1)}><ChevronLeft className="h-3.5 w-3.5" /></PageButton>
        {pageItems(current, totalPages).map((item, index) => item === "gap"
          ? <span key={`gap-${index}`} className="w-6 text-center text-[10px] text-[#9aabbd]">…</span>
          : <PageButton key={item} label={`Página ${item}`} active={item === current} onClick={() => setPage(item)}>{item}</PageButton>)}
        <PageButton label="Página siguiente" disabled={current === totalPages} onClick={() => setPage(current + 1)}><ChevronRight className="h-3.5 w-3.5" /></PageButton>
      </nav>
    </div>
  </DashboardCard>;
}

function SortHeader({ label, column, sort, onSort, className = "", align = "left" }: { label: string; column: SortKey; sort: { key: SortKey; dir: "asc" | "desc" }; onSort: (key: SortKey) => void; className?: string; align?: "left" | "right" }) {
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return <th className={`px-2.5 py-2.5 sm:px-3 font-semibold ${align === "right" ? "text-right" : "text-left"} ${className}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
    <button type="button" onClick={() => onSort(column)} className={`inline-flex items-center gap-1 uppercase transition hover:text-[#17324a] ${active ? "text-[#17324a]" : ""}`}>
      {label}<Icon className={`h-3 w-3 ${active ? "text-[#1670d2]" : "text-[#b3c1cf]"}`} />
    </button>
  </th>;
}

function PageButton({ children, label, onClick, active = false, disabled = false }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" aria-label={label} aria-current={active ? "page" : undefined} disabled={disabled} onClick={onClick} className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold tabular-nums transition ${active ? "bg-[#1670d2] text-white" : "text-[#4f6a82] hover:bg-[#eef3f8]"} disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent`}>{children}</button>;
}
