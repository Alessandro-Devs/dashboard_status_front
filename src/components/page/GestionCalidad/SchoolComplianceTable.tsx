"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, RotateCcw, School, Search } from "lucide-react";
import { useState } from "react";
import Select from "@/components/ui/Select";
import { readSchoolCompliance, type SchoolCompliance } from "@/lib/schoolCompliance";
import { CardTitle, DashboardCard } from "./DashboardUI";
import { qualityData } from "./qualityData";

// Cumplimiento por centro educativo. Se captura en Administración > Gestión de Calidad
// ("Cumplimiento por centro educativo", pegando desde Excel o importando un CSV) y se guarda en
// gestionCalidad.cumplimientoPorCentro. Puede tener más de 2,000 centros, por eso va paginada.
// Todos los filtros se arman con los datos de la fecha: grupos, conteos por nivel y promedios.

type SchoolRow = SchoolCompliance;
type SortKey = "codigo" | "nombre" | "grupo" | "cumplimiento";
type Sort = { key: SortKey; dir: "asc" | "desc" };

const LEVELS = [
  { id: "todos", label: "Todos", test: () => true },
  { id: "excelente", label: "Excelente", test: (value: number) => value >= 80, color: "#16813f" },
  { id: "medio", label: "Medio", test: (value: number) => value >= 51 && value < 80, color: "#eab308" },
  { id: "bajo", label: "Bajo", test: (value: number) => value < 51, color: "#e33a3a" },
] as const;
type LevelId = (typeof LEVELS)[number]["id"];

// Opciones de "Ordenar por" (incluye mayor y menor cumplimiento).
const SORT_OPTIONS: Array<{ value: string; label: string; sort: Sort }> = [
  { value: "cumplimiento-desc", label: "Mayor cumplimiento", sort: { key: "cumplimiento", dir: "desc" } },
  { value: "cumplimiento-asc", label: "Menor cumplimiento", sort: { key: "cumplimiento", dir: "asc" } },
  { value: "codigo-asc", label: "Código", sort: { key: "codigo", dir: "asc" } },
  { value: "nombre-asc", label: "Nombre (A-Z)", sort: { key: "nombre", dir: "asc" } },
  { value: "grupo-asc", label: "Grupo", sort: { key: "grupo", dir: "asc" } },
];

const ALL = "__todos__";
const NO_GROUP = "__sin_grupo__";
const PAGE_SIZES = [10, 25, 50, 100];
const complianceColor = (value: number) => (value >= 80 ? "#16813f" : value >= 51 ? "#eab308" : "#e33a3a");
const complianceText = (value: number) => (value >= 80 ? "#13733a" : value >= 51 ? "#a16207" : "#c62828");
const formatInt = (value: number) => value.toLocaleString("es-SV");
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const average = (rows: SchoolRow[]) => rows.reduce((sum, row) => sum + row.cumplimiento, 0) / Math.max(1, rows.length);

// Números de página con "…" para no mostrar cientos de botones.
function pageItems(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((page) => pages.add(page));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((page) => pages.add(page));
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  return sorted.flatMap((page, index) => (index > 0 && page - sorted[index - 1] > 1 ? ["gap" as const, page] : [page]));
}

function compare(a: SchoolRow, b: SchoolRow, sort: Sort) {
  const factor = sort.dir === "asc" ? 1 : -1;
  if (sort.key === "cumplimiento") return (a.cumplimiento - b.cumplimiento) * factor || a.codigo.localeCompare(b.codigo, "es", { numeric: true });
  if (sort.key === "grupo") {
    // Los centros sin grupo van al final.
    if (!a.grupo !== !b.grupo) return a.grupo ? -1 : 1;
    return a.grupo.localeCompare(b.grupo, "es", { numeric: true }) * factor || a.codigo.localeCompare(b.codigo, "es", { numeric: true });
  }
  return a[sort.key].localeCompare(b[sort.key], "es", { numeric: true }) * factor;
}

export default function SchoolComplianceTable() {
  // Se lee en cada render: al cambiar la fecha de corte llegan otros datos.
  const schools = readSchoolCompliance((qualityData as { cumplimientoPorCentro?: unknown }).cumplimientoPorCentro);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const [level, setLevel] = useState<LevelId>("todos");
  const [sort, setSort] = useState<Sort>({ key: "codigo", dir: "asc" });
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const reset = () => setPage(1);

  // Grupos presentes en los datos, con cantidad de centros y promedio.
  const groups = [...new Set(schools.map((school) => school.grupo))]
    .sort((a, b) => (!a ? 1 : !b ? -1 : a.localeCompare(b, "es", { numeric: true })))
    .map((name) => { const items = schools.filter((school) => school.grupo === name); return { id: name || NO_GROUP, label: name || "Sin grupo", count: items.length, average: average(items) }; });
  const hasGroups = groups.some((item) => item.id !== NO_GROUP);
  const activeGroup = groups.some((item) => item.id === group) ? group : ALL;

  // Filtros en cascada: los conteos de nivel respetan el grupo y la búsqueda.
  const term = normalize(query.trim());
  const base = schools.filter((school) =>
    (activeGroup === ALL || (school.grupo || NO_GROUP) === activeGroup) &&
    (!term || normalize(school.codigo).includes(term) || normalize(school.nombre).includes(term) || normalize(school.grupo).includes(term)));
  const counts = Object.fromEntries(LEVELS.map((item) => [item.id, base.filter((school) => item.test(school.cumplimiento)).length])) as Record<LevelId, number>;
  const levelTest = LEVELS.find((item) => item.id === level)?.test ?? (() => true);
  const rows = base.filter((school) => levelTest(school.cumplimiento)).sort((a, b) => compare(a, b, sort));

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const visible = rows.slice(start, start + pageSize);
  const filtersActive = activeGroup !== ALL || level !== "todos" || term !== "";
  const sortValue = SORT_OPTIONS.find((option) => option.sort.key === sort.key && option.sort.dir === sort.dir)?.value ?? "";

  const toggleSort = (key: SortKey) => {
    setSort((previous) => (previous.key === key ? { key, dir: previous.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "cumplimiento" ? "desc" : "asc" }));
    reset();
  };
  const clearFilters = () => { setQuery(""); setGroup(ALL); setLevel("todos"); reset(); };

  if (!schools.length) return null;
  const subtitle = filtersActive
    ? `${formatInt(rows.length)} de ${formatInt(schools.length)} centros · promedio ${average(rows).toFixed(1)}%`
    : `${formatInt(schools.length)} centros · promedio ${average(schools).toFixed(1)}%`;

  return <DashboardCard className="mt-4">
    <CardTitle title="Cumplimiento por centro educativo" subtitle={subtitle} icon={<span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#e8f3ff]"><School className="h-4 w-4 text-[#1670d2]" /></span>} />

    {/* Resumen por grupo: también sirve como filtro rápido */}
    {hasGroups ? <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
      {groups.map((item) => {
        const active = activeGroup === item.id;
        return <button key={item.id} type="button" onClick={() => { setGroup(active ? ALL : item.id); reset(); }} aria-pressed={active} className={`min-w-[96px] shrink-0 rounded-lg border px-2.5 py-1.5 text-left transition ${active ? "border-[#1670d2] bg-[#eef6ff]" : "border-[#e3e9ef] bg-white hover:border-[#c9d6e2]"}`}>
          <span className="block text-[9px] font-semibold text-[#29445b]">{item.label}</span>
          <span className="mt-0.5 flex items-baseline justify-between gap-2"><span className="text-[12px] font-semibold tabular-nums" style={{ color: complianceText(item.average) }}>{item.average.toFixed(1)}%</span><span className="text-[8px] tabular-nums text-[#8a9bb0]">{formatInt(item.count)} CE</span></span>
        </button>;
      })}
    </div> : null}

    {/* Filtros */}
    <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_170px_210px]">
      <label className="relative block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a9bb0]" />
        <input value={query} onChange={(event) => { setQuery(event.target.value); reset(); }} placeholder="Buscar por código, nombre o grupo" className="h-7 w-full rounded-md border border-[#d6dfe8] bg-white pl-8 pr-3 text-[10px] text-[#17324a] outline-none transition placeholder:text-[#9aabbd] focus:border-[#1670d2] focus:ring-2 focus:ring-[#1670d2]/15" />
      </label>
      {hasGroups ? <Select size="sm" ariaLabel="Filtrar por grupo" value={activeGroup} onChange={(value) => { setGroup(value); reset(); }} options={[{ value: ALL, label: "Todos los grupos" }, ...groups.map((item) => ({ value: item.id, label: `${item.label} (${formatInt(item.count)})` }))]} /> : null}
      <Select size="sm" ariaLabel="Ordenar por" value={sortValue} placeholder="Ordenar por" onChange={(value) => { const option = SORT_OPTIONS.find((item) => item.value === value); if (option) { setSort(option.sort); reset(); } }} options={SORT_OPTIONS.map(({ value, label }) => ({ value, label: `Ordenar: ${label}` }))} />
    </div>

    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap gap-1.5">
        {LEVELS.map((item) => {
          const active = level === item.id;
          return <button key={item.id} type="button" onClick={() => { setLevel(item.id); reset(); }} aria-pressed={active} className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold transition ${active ? "bg-[#17324a] text-white" : "bg-[#f1f5f9] text-[#4f6a82] hover:bg-[#e6edf4]"}`}>
            {"color" in item ? <i className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} /> : null}
            {item.label}
            <span className={`tabular-nums ${active ? "text-white/70" : "text-[#8a9bb0]"}`}>{formatInt(counts[item.id])}</span>
          </button>;
        })}
      </div>
      {filtersActive ? <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold text-[#1670d2] hover:bg-[#eef6ff]"><RotateCcw className="h-3 w-3" />Limpiar filtros</button> : null}
    </div>

    {/* Tabla */}
    <div className="mt-3 overflow-x-auto rounded-lg border border-[#e3e9ef]">
      <table className="w-full border-collapse text-[10px]">
        <thead className="bg-[#f6f9fc]">
          <tr className="text-[9px] font-semibold uppercase tracking-[.04em] text-[#6f8295]">
            <SortHeader label="Código" column="codigo" sort={sort} onSort={toggleSort} className="sm:w-[90px]" />
            <SortHeader label="Centro educativo" column="nombre" sort={sort} onSort={toggleSort} />
            {hasGroups ? <SortHeader label="Grupo" column="grupo" sort={sort} onSort={toggleSort} className="hidden sm:table-cell sm:w-[110px]" /> : null}
            <SortHeader label="Cumplimiento" column="cumplimiento" sort={sort} onSort={toggleSort} className="sm:w-[190px]" align="right" />
          </tr>
        </thead>
        <tbody>
          {visible.length ? visible.map((school, index) => <tr key={`${school.codigo}-${school.nombre}-${index}`} className="border-t border-[#eef2f6] transition-colors hover:bg-[#f8fbfe]">
            <td className="px-2.5 py-2.5 font-semibold tabular-nums text-[#1670d2] sm:px-3">{school.codigo || "—"}</td>
            <td className="px-2.5 py-2.5 text-[#29445b] sm:px-3">
              {school.nombre || "—"}
              {hasGroups && school.grupo ? <span className="mt-0.5 block text-[8px] font-semibold text-[#8a9bb0] sm:hidden">{school.grupo}</span> : null}
            </td>
            {hasGroups ? <td className="hidden px-3 py-2.5 sm:table-cell">{school.grupo ? <button type="button" onClick={() => { setGroup(school.grupo); reset(); }} className="rounded-full bg-[#eef3f8] px-2 py-0.5 text-[9px] font-semibold text-[#4f6a82] transition hover:bg-[#e1ebf5]" title={`Ver solo ${school.grupo}`}>{school.grupo}</button> : <span className="text-[#b3c1cf]">—</span>}</td> : null}
            <td className="px-2.5 py-2.5 sm:px-3">
              <div className="flex items-center justify-end gap-2.5">
                <div className="hidden h-1.5 w-full max-w-[110px] overflow-hidden rounded-full bg-[#edf2f7] sm:block"><div className="h-full rounded-full" style={{ width: `${school.cumplimiento}%`, backgroundColor: complianceColor(school.cumplimiento) }} /></div>
                <span className="w-[42px] text-right font-semibold tabular-nums" style={{ color: complianceText(school.cumplimiento) }}>{school.cumplimiento.toFixed(1)}%</span>
              </div>
            </td>
          </tr>) : <tr><td colSpan={hasGroups ? 4 : 3} className="px-3 py-10 text-center text-[10px] text-[#8a9bb0]">No hay centros educativos que coincidan con los filtros.</td></tr>}
        </tbody>
      </table>
    </div>

    {/* Paginación */}
    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3 text-[9px] text-[#71869a]">
        <span>{rows.length ? <>Mostrando <strong className="font-semibold text-[#29445b]">{formatInt(start + 1)}–{formatInt(Math.min(start + pageSize, rows.length))}</strong> de <strong className="font-semibold text-[#29445b]">{formatInt(rows.length)}</strong></> : "Sin resultados"}</span>
        <span className="flex items-center gap-1.5">Filas
          <Select size="xs" className="w-[58px]" ariaLabel="Filas por página" value={String(pageSize)} onChange={(value) => { setPageSize(Number(value)); reset(); }} options={PAGE_SIZES.map(String)} />
        </span>
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

function SortHeader({ label, column, sort, onSort, className = "", align = "left" }: { label: string; column: SortKey; sort: Sort; onSort: (key: SortKey) => void; className?: string; align?: "left" | "right" }) {
  const active = sort.key === column;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return <th className={`px-2.5 py-2.5 font-semibold sm:px-3 ${align === "right" ? "text-right" : "text-left"} ${className}`} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
    <button type="button" onClick={() => onSort(column)} className={`inline-flex items-center gap-1 uppercase transition hover:text-[#17324a] ${active ? "text-[#17324a]" : ""}`}>
      {label}<Icon className={`h-3 w-3 ${active ? "text-[#1670d2]" : "text-[#b3c1cf]"}`} />
    </button>
  </th>;
}

function PageButton({ children, label, onClick, active = false, disabled = false }: { children: React.ReactNode; label: string; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return <button type="button" aria-label={label} aria-current={active ? "page" : undefined} disabled={disabled} onClick={onClick} className={`flex h-7 min-w-7 items-center justify-center rounded-md px-1.5 text-[10px] font-semibold tabular-nums transition ${active ? "bg-[#1670d2] text-white" : "text-[#4f6a82] hover:bg-[#eef3f8]"} disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent`}>{children}</button>;
}
