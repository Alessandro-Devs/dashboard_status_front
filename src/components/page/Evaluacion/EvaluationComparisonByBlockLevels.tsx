"use client";
import { useEffect, useState } from "react";
import BarreraCard from "./BarreraCard";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { getEvaluacion, normalizeMateria, tieneNumero, type DistribucionNivelPorBloque } from "./evaluationViewData";

const levels = [
    { key: "nivel1percent", dataKey: "nivel1data", color: "#e5252a", label: "Crítico" },
    { key: "nivel2percent", dataKey: "nivel2data", color: "#f05b0b", label: "Bajo" },
    { key: "nivel3percent", dataKey: "nivel3data", color: "#f2a312", label: "Medio" },
    { key: "nivel4percent", dataKey: "nivel4data", color: "#19a97a", label: "Bueno" },
    { key: "nivel5percent", dataKey: "nivel5data", color: "#0c7f73", label: "Excelente" },
] as const;

type LevelKey = (typeof levels)[number]["key"];

function toNumber(value: unknown) {
    const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
}

function normalizeSegment(value: unknown) {
    return toNumber(value);
}

function clampPercent(value: unknown) {
    return Math.min(Math.max(normalizeSegment(value), 0), 100);
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function segments(row: DistribucionNivelPorBloque) {
    return levels.map((level) => ({
        value: normalizeSegment(row[level.key]),
        data: row[level.dataKey],
        color: level.color,
        label: level.label,
    }));
}

function hasDistributionData(row: DistribucionNivelPorBloque) {
    return normalizeSegment(row.universo) > 0 || segments(row).some((item) => normalizeSegment(item.value) > 0 || normalizeSegment(item.data) > 0);
}

function distributionRows(value: unknown): DistribucionNivelPorBloque[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is DistribucionNivelPorBloque => isRecord(item) && typeof item.bloque === "string" && item.bloque.trim().length > 0);
}

export default function EvaluationComparisonByBlockLevels() {
    useDashboardData();
    const { blocks, setBlocks } = useAuditFilters();
    const [subjects, setSubjects] = useState<string[]>([]);
    const evaluacion = getEvaluacion();
    const rawDistributions = evaluacion.distribucionPorBloqueMateriaNiveles ?? {};
    const distributionAverages = (rawDistributions as unknown as { resumen?: { promedioLengua?: unknown; promedioMatematica?: unknown } }).resumen ?? {};
    const generalAverages = evaluacion.promediosGenerales?.cml;
    const lenguaAverage = toNumber(generalAverages?.lengua) || toNumber(distributionAverages.promedioLengua);
    const mathAverage = toNumber(generalAverages?.matematica) || toNumber(distributionAverages.promedioMatematica);
    const averages = {
        ...(evaluacion.comparativasPorMateria ?? {}),
        ...(lenguaAverage > 0 ? { lengua: { promedio: lenguaAverage, variacionRespectoJunio: null } } : {}),
        ...(mathAverage > 0 ? { matematica: { promedio: mathAverage, variacionRespectoJunio: null } } : {}),
    };
    const distributions = Object.entries(rawDistributions).reduce<Record<string, DistribucionNivelPorBloque[]>>((result, [subject, rows]) => {
        const normalizedRows = distributionRows(rows).filter(hasDistributionData);
        if (normalizedRows.length === 0) return result;
        const normalizedSubject = normalizeMateria(subject);
        result[normalizedSubject] = [...(result[normalizedSubject] ?? []), ...normalizedRows];
        return result;
    }, {});
    const availableSubjects = Object.keys(distributions).map((subject) => ({
        id: subject.toLowerCase(),
        label: formatMateriaLabel(subject),
        value: subject,
    }));
    const validSubjectIds = new Set(availableSubjects.map((item) => item.id));
    const activeSubjects = subjects.filter((subject) => validSubjectIds.has(subject));
    const selectedSubjects = new Set(activeSubjects);
    const filteredAverageEntries = Object.entries(averages)
        .filter(([materia]) => selectedSubjects.size === 0 || selectedSubjects.has(materia.toLowerCase()))
        .sort(([left], [right]) => subjectOrder(left) - subjectOrder(right));
    const promedios = filteredAverageEntries.filter(([, item]) => tieneNumero(item.promedio) && item.promedio > 0);
    const availableBlocks = Array.from(new Map(Object.values(distributions)
        .flatMap((rows) => rows)
        .map((row) => [row.bloque.toLowerCase(), row.bloque])).entries()).map(([id, label]) => ({ id, label }));
    useEffect(() => {
        if (blocks.length === 0)
            return;
        const validBlockIds = new Set(availableBlocks.map((item) => item.id));
        if (blocks.every((block) => validBlockIds.has(block)))
            return;
        setBlocks(blocks.filter((block) => validBlockIds.has(block)));
    }, [availableBlocks, blocks, setBlocks]);
    const selectedBlocks = new Set(blocks);
    const comparativasPorMateria = Object.entries(distributions)
        .sort(([left], [right]) => subjectOrder(left) - subjectOrder(right))
        .filter(([materia]) => selectedSubjects.size === 0 || selectedSubjects.has(materia.toLowerCase()))
        .map(([materia, rows]) => ({
            materia,
            rows: selectedBlocks.size > 0
                ? rows.filter((row) => selectedBlocks.has(row.bloque.toLowerCase()))
                : rows,
        }))
        .filter((item) => item.rows.length > 0);
    return <section className="space-y-4">
    {(availableBlocks.length > 0 || availableSubjects.length > 0) && <article className="rounded-[9px] border border-[#dce3ea] bg-white p-4">
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase text-[#6b7f92]">Filtros</p>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {availableBlocks.length > 0 && <BlockFilter options={availableBlocks} selected={blocks} onChange={setBlocks}/>}
        {availableSubjects.length > 0 && <SubjectFilter options={availableSubjects} selected={activeSubjects} onChange={setSubjects}/>}
      </div>
    </article>}
    {promedios.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{promedios.map(([materia, item]) => <Average key={materia} title={`PROMEDIO ${materia.toUpperCase()}`} value={item.promedio as number} variation={item.variacionRespectoJunio}/>)}</div>}
    {comparativasPorMateria.length > 0 && <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">{comparativasPorMateria.map(({ materia, rows }) => <SubjectColumn key={materia} materia={materia} rows={rows}/>)}</div>}
    {promedios.length === 0 && comparativasPorMateria.length === 0 && <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center"><p className="text-[12px] font-semibold text-[#526a80]">Sin resultados comparativos</p><p className="mt-2 text-[10px] text-[#8b9daf]">No hay comparativas por materia disponibles para este periodo.</p></article>}
    <BarreraCard />
  </section>;
}

function BlockFilter({ options, selected, onChange }: {
    options: Array<{ id: string; label: string }>;
    selected: string[];
    onChange: (value: string[]) => void;
}) {
    const currentValue = selected.find((item) => options.some((option) => option.id === item)) ?? "";
    return <div className="rounded-[9px] border border-[#dce3ea] bg-white p-4">
    <p className="text-[10px] font-semibold uppercase text-[#60778c]">Bloque</p>
    <select value={currentValue} onChange={(event) => onChange(event.target.value ? [event.target.value] : [])} className="mt-2 h-9 w-full rounded-md border border-[#d9e2eb] bg-[#fbfcfd] px-3 text-[10px] font-semibold text-[#334b60] outline-none transition focus:border-[#176fc8] focus:ring-2 focus:ring-[#eaf4ff]">
      <option value="">Todos los bloques</option>
      {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
  </div>;
}

function SubjectFilter({ options, selected, onChange }: {
    options: Array<{ id: string; label: string; value: string }>;
    selected: string[];
    onChange: (value: string[]) => void;
}) {
    const currentValue = selected.find((item) => options.some((option) => option.id === item)) ?? "";
    return <div className="rounded-[9px] border border-[#dce3ea] bg-white p-4">
    <p className="text-[10px] font-semibold uppercase text-[#60778c]">Materia</p>
    <select value={currentValue} onChange={(event) => onChange(event.target.value ? [event.target.value] : [])} className="mt-2 h-9 w-full rounded-md border border-[#d9e2eb] bg-[#fbfcfd] px-3 text-[10px] font-semibold text-[#334b60] outline-none transition focus:border-[#176fc8] focus:ring-2 focus:ring-[#eaf4ff]">
      <option value="">Todas las materias</option>
      {options.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
    </select>
  </div>;
}

function SelectFilter({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}) {
    return <label className="flex items-center justify-between gap-3 rounded-[9px] border border-[#dce3ea] bg-white px-3 py-2">
      <span className="text-[10px] font-semibold text-[#60778c]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="rounded border border-[#d9e2eb] bg-white px-2 py-1.5 text-[10px] font-semibold text-[#334b60] outline-none">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>;
}

function Average({ title, value, variation }: {
    title: string;
    value: number;
    variation: number | null;
}) {
    return <article className="rounded-[9px] border border-[#dce3ea] bg-white p-5"><p className="text-[11px] font-semibold uppercase text-[#6b7f92]">{title}</p><div className="mt-3 flex items-center gap-2"><strong className="text-[25px] text-[#263d52]">{formatValue(value)}</strong><span className="rounded bg-[#fff0d7] px-2 py-1 text-[10px] font-semibold text-[#dd8d15]">Medio</span></div>{tieneNumero(variation) && <p className="mt-2 text-[10px] text-[#e04444]">↘ {formatValue(variation)} vs Junio</p>}</article>;
}

function SubjectColumn({ materia, rows }: {
    materia: string;
    rows: DistribucionNivelPorBloque[];
}) {
    const [criticalSortDirection, setCriticalSortDirection] = useState<"desc" | "asc">("desc");
    const [selectedLevel, setSelectedLevel] = useState<LevelKey>("nivel1percent");
    const visibleRows = [...rows]
        .sort((a, b) => {
            const difference = normalizeSegment(b[selectedLevel]) - normalizeSegment(a[selectedLevel]);
            return criticalSortDirection === "desc" ? difference : -difference;
        });
    return <article className="flex flex-col gap-3 rounded-[10px] border border-[#dce4ec] bg-white p-4">
      <h3 className="text-[14px] font-semibold uppercase text-[#334b60]">{formatMateriaLabel(materia)}</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        <SelectFilter label="Ordenar de" value={criticalSortDirection} onChange={(value) => setCriticalSortDirection(value as "desc" | "asc")} options={[{ value: "desc", label: "Mayor a menor" }, { value: "asc", label: "Menor a mayor" }]}/>
        <SelectFilter label="Estado" value={selectedLevel} onChange={(value) => setSelectedLevel(value as LevelKey)} options={levels.map((level) => ({ value: level.key, label: level.label }))}/>
      </div>
      <Legend />
      <div className="flex flex-col gap-3">
        {visibleRows.map((row) => <Comparison key={`${materia}-${row.bloque}`} block={row.bloque} items={[{ materia, row }]}/>)}
        {visibleRows.length === 0 && <p className="rounded-lg border border-dashed border-[#cbd6e0] px-4 py-5 text-center text-[10px] text-[#71869a]">No hay bloques para el estado seleccionado.</p>}
      </div>
    </article>;
}

function Comparison({ block, items }: {
    block: string;
    items: Array<{ materia: string; row: DistribucionNivelPorBloque }>;
}) {
    return <div className="flex flex-col gap-2">
    <div className="border-t border-[#e9eef3] pt-2">
      <h4 className="text-[13px] font-semibold text-[#334b60] sm:text-[14px]">{block}</h4>
    </div>
    <div className="rounded-[7px] border bg-[#fbfcfd] p-3">
      <div className="mt-4 space-y-3">
        {items.map((item) => <Row key={`${block}-${item.materia}`} row={item.row}/>)}
      </div>
      <div className="mt-4 flex justify-between text-[7px] font-medium uppercase tracking-[0.04em] text-[#667b8e] sm:text-[8px]">
        <span>Crítico</span>
        <span>Excelente</span>
      </div>
    </div>
  </div>;
}

function Legend() {
    return <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
    {levels.map((level) => <div key={level.key} className="flex shrink-0 snap-start items-center gap-1.5 rounded-full border border-[#dde6ee] bg-white px-2.5 py-1 text-[9px] text-[#5f7488]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: level.color }}/>{level.label}</div>)}
  </div>;
}

function Row({ row }: {
    row: DistribucionNivelPorBloque;
}) {
    const rowSegments = segments(row);
    const [hoveredSegment, setHoveredSegment] = useState<(typeof rowSegments)[number] | null>(null);
    return <div className="rounded-[9px] border border-[#e3eaf1] bg-white p-3">
    <div className="mb-2 flex items-center justify-start gap-2">
      <span className="text-[13px] text-[#8da0b2]">{formatValue(row.universo)} universo CE</span>
    </div>
    <div className="relative">
      {hoveredSegment && <div className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 min-w-[170px] rounded-lg border border-[#d9e3ec] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(30,55,80,.16)]">
        <div className="flex items-center gap-2 text-[10px] font-semibold text-[#334b60]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: hoveredSegment.color }}/>{hoveredSegment.label}</div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4"><strong className="text-[15px] text-[#22384c]">{formatValue(hoveredSegment.data)}</strong><span className="text-[10px] font-medium text-[#71869a]">{formatValue(hoveredSegment.value)}%</span></div>
      </div>}
      <div className="overflow-hidden rounded-full bg-[#e9eef3]">
      <div className="flex h-[30px] w-full overflow-hidden rounded-full">
        {rowSegments.map((item, index) => <div key={index} onMouseEnter={() => setHoveredSegment(item)} onMouseLeave={() => setHoveredSegment(null)} aria-label={`${item.label}: ${formatValue(item.data)} (${formatValue(item.value)}%)`} className="flex cursor-pointer items-center justify-center px-1 text-[8px] font-semibold text-white transition-opacity hover:opacity-85" style={{ width: `${clampPercent(item.value)}%`, background: item.color }}>{item.value >= 8 ? `${formatValue(item.value)}%` : ""}</div>)}
      </div>
      </div>
    </div>
  </div>;
}

function formatValue(value: unknown) {
    if (value == null) return "-";
    const numeric = toNumber(value);
    if (!Number.isFinite(numeric)) return "-";
    return Number.isInteger(numeric) ? numeric.toLocaleString("es-SV") : numeric.toFixed(1);
}

function formatMateriaLabel(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function subjectOrder(value: string) {
    const normalized = value.toLowerCase();
    if (normalized === "matematica" || normalized === "matemática") return 0;
    if (normalized === "lengua") return 1;
    return 2;
}
