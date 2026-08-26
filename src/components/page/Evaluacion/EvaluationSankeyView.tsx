"use client";

import { useState } from "react";
import { GitBranch } from "lucide-react";
import { ResponsiveContainer, Sankey, Tooltip, type SankeyNodeProps, type TooltipContentProps } from "recharts";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { getEvaluacion, tieneNumero, tieneTexto, type NivelDesempeno } from "./evaluationViewData";

type SankeyNode = {
  name?: string;
};

type SankeyLink = {
  source: number;
  target: number;
  value: number;
};

type SankeyDataset = {
  title: string;
  nodes: SankeyNode[];
  links: SankeyLink[];
};

type SeparateSankeyTransition = {
  de: string;
  hacia: string;
  totalCe: number | null;
  valores: Array<Array<number | null>>;
};

type SeparateSankey = {
  titulo: string;
  materia: string;
  bloque: string;
  subgrupo: string | number | null;
  niveles: string[];
  transiciones: SeparateSankeyTransition[];
};

function toFlowNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export default function EvaluationSankeyView() {
  useDashboardData();

  const evaluacion = getEvaluacion() as Record<string, unknown>;
  const explicitSankeys = resolveSeparateSankeys(evaluacion.sankeysSeparados);

  if (explicitSankeys.length > 0) {
    return <MergedSankeyView sankeys={explicitSankeys} />;
  }

  const directSankeys = findSankeyDatasets(evaluacion);
  if (directSankeys.length > 0) {
    return (
      <section className="grid grid-cols-1 gap-4">
        {directSankeys.slice(0, 6).map((dataset, index) => (
          <DirectSankeyCard key={`${dataset.title}-${index}`} dataset={dataset} />
        ))}
      </section>
    );
  }

  const vista = evaluacion.vistaResultados as {
    materiasDisponibles?: string[];
    materiaSeleccionadaPorDefecto?: string;
    trayectoriaDeResultados?: {
      nivelesDeDesempeno?: NivelDesempeno[];
      resumenPorNivel?: Array<{
        idNivel: string;
        centrosEscolares: number | null;
        porcentajeDelTotal: number | null;
      }>;
      etapas?: Array<{
        nombre: string;
        centrosPorNivel: Record<string, number>;
      }>;
      distribucionPorcentualDeLosFlujos?: Partial<{
        permaneceEnElMismoNivel: number;
        subeUnNivel: number;
        bajaUnNivel: number;
      }>;
      lecturaPrincipal?: string;
      descripcionLectura?: string;
    };
  } | undefined;

  const materias = vista?.materiasDisponibles ?? [];
  const materia = vista?.materiaSeleccionadaPorDefecto || materias[0] || "";
  const trayectoria = vista?.trayectoriaDeResultados;
  const niveles = trayectoria?.nivelesDeDesempeno ?? [];
  const etapas = trayectoria?.etapas ?? [];
  const resumen = trayectoria?.resumenPorNivel ?? [];
  const sankey = crearSankey(niveles, etapas, trayectoria?.distribucionPorcentualDeLosFlujos);
  const hasSankey = niveles.length > 0 && etapas.length > 1;
  const hasSummary = resumen.length > 0;
  const hasReading = tieneTexto(trayectoria?.lecturaPrincipal) || tieneTexto(trayectoria?.descripcionLectura);

  if (!hasSankey && !hasSummary && !hasReading) {
    return (
      <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center">
        <p className="text-[12px] font-semibold text-[#526a80]">Sin sankeys de progreso</p>
        <p className="mt-2 text-[10px] text-[#8b9daf]">No se encontraron datasets de sankey en la BD para la vista de Progreso.</p>
      </article>
    );
  }

  return (
    <section className="space-y-4">
      {hasSankey && (
        <section className="overflow-hidden rounded-xl border bg-white">
          <header className="flex flex-wrap justify-between gap-3 border-b px-4 py-3">
            <div className="flex gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]">
                <GitBranch className="h-3.5 w-3.5" />
              </span>
              <div>
                <h3 className="text-[11px] font-semibold text-[#334b60]">Trayectoria de resultados</h3>
                <p className="text-[7px] text-[#8a9daf]">Movimiento entre niveles de desempeño{materia ? ` · ${materia}` : ""}</p>
                {niveles.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {niveles.map((nivel) => (
                      <span key={nivel.id} className="flex items-center gap-1 text-[7px] text-[#8a9daf]">
                        <i className="h-2 w-2 rounded-full" style={{ backgroundColor: nivel.colorHexadecimal }} />
                        {nivel.nombre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </header>
          <div className="p-4">
            <div className="h-[320px]">
              <ResponsiveContainer>
                <Sankey data={sankey} node={(props: SankeyNodeProps) => <LegacyNode {...props} niveles={niveles} />} nodeWidth={10} nodePadding={16}>
                  <Tooltip content={FlowTooltip} />
                </Sankey>
              </ResponsiveContainer>
            </div>
            {hasSummary && (
              <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
                {resumen.map((item) => {
                  const nivel = niveles.find((nivelItem) => nivelItem.id === item.idNivel);
                  return (
                    <div key={item.idNivel} className="rounded-md border p-2.5">
                      <p className="text-[8px] font-semibold">{nivel?.nombre ?? item.idNivel}</p>
                      {tieneNumero(item.centrosEscolares) && <strong style={{ color: nivel?.colorHexadecimal }}>{item.centrosEscolares}</strong>}
                      {tieneNumero(item.porcentajeDelTotal) && <p className="text-[7px]">{item.porcentajeDelTotal}% del universo</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}
      {hasReading && (
        <article className="rounded-lg border bg-white p-4">
          <p className="text-[8px] font-semibold uppercase text-[#71869a]">Lectura principal</p>
          {tieneTexto(trayectoria?.lecturaPrincipal) && <p className="mt-1.5 text-[11px] font-semibold">{trayectoria?.lecturaPrincipal}</p>}
          {tieneTexto(trayectoria?.descripcionLectura) && <p className="mt-1.5 text-[8px] text-[#8a9daf]">{trayectoria?.descripcionLectura}</p>}
        </article>
      )}
    </section>
  );
}

function MergedSankeyView({ sankeys }: { sankeys: SeparateSankey[] }) {
  const blocks = uniqueValues(sankeys.map((item) => item.bloque)).sort(compareBlockLabels);
  const materias = uniqueValues(sankeys.map((item) => item.materia)).sort((a, b) => a.localeCompare(b));
  const [selectedBlock, setSelectedBlock] = useState(blocks[0] ?? "");
  const [selectedMateria, setSelectedMateria] = useState("Todas");
  const [selectedSubgrupo, setSelectedSubgrupo] = useState("Todos");

  const sankeysForBlock = sankeys.filter((item) => item.bloque === selectedBlock && (selectedMateria === "Todas" || item.materia === selectedMateria));
  const subgrupos = uniqueValues(sankeysForBlock.map((item) => normalizeSubgroup(item.subgrupo))).sort((a, b) => a.localeCompare(b));
  const hasSpecificSubgroups = subgrupos.some((item) => item !== "General");

  const visibleSankeys = sankeys.filter((item) => (
    item.bloque === selectedBlock
    && (selectedMateria === "Todas" || item.materia === selectedMateria)
    && (!hasSpecificSubgroups || selectedSubgrupo === "Todos" || normalizeSubgroup(item.subgrupo) === selectedSubgrupo)
  ));
  const mergedDataset = mergeSeparateSankeys(visibleSankeys);

  return (
    <section className="space-y-4">
      <article className="overflow-hidden rounded-xl border bg-white">
        <header className="flex flex-wrap items-end justify-between gap-3 border-b px-4 py-3">
          <div className="flex gap-2.5">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]">
              <GitBranch className="h-3.5 w-3.5" />
            </span>
            <div>
              <h3 className="text-[11px] font-semibold text-[#334b60]">Trayectoria de progreso</h3>
              <p className="text-[7px] text-[#8a9daf]">Sankey fusionado por bloque con filtro de materia</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <FilterField label="Bloque" value={selectedBlock} onChange={setSelectedBlock} options={blocks} />
            <FilterField label="Materia" value={selectedMateria} onChange={setSelectedMateria} options={["Todas", ...materias]} />
            {hasSpecificSubgroups && <FilterField label="Subgrupo" value={selectedSubgrupo} onChange={setSelectedSubgrupo} options={["Todos", ...subgrupos.filter((item) => item !== "General")]} />}
          </div>
        </header>
        <div className="p-4">
          {mergedDataset && mergedDataset.links.length > 0 ? (
            <div className="h-[320px]">
              <ResponsiveContainer>
                <Sankey data={{ nodes: mergedDataset.nodes, links: mergedDataset.links }} node={DirectNode} nodeWidth={10} nodePadding={16}>
                  <Tooltip content={FlowTooltip} />
                </Sankey>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[#d7e1eb] bg-[#fbfcfd] px-4 py-10 text-center">
              <p className="text-[10px] font-semibold text-[#526a80]">Sin transiciones visibles</p>
              <p className="mt-2 text-[9px] text-[#8b9daf]">No hay datos del sankey para el bloque y la materia seleccionados.</p>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

function DirectSankeyCard({ dataset }: { dataset: SankeyDataset }) {
  return (
    <article className="overflow-hidden rounded-xl border bg-white">
      <header className="flex items-start gap-2.5 border-b px-4 py-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]">
          <GitBranch className="h-3.5 w-3.5" />
        </span>
        <div>
          <h3 className="text-[11px] font-semibold text-[#334b60]">{dataset.title}</h3>
          <p className="text-[7px] text-[#8a9daf]">Trayectoria de progreso desde la base de datos</p>
        </div>
      </header>
      <div className="p-4">
        {dataset.links.length > 0 ? (
          <div className="h-[320px]">
            <ResponsiveContainer>
              <Sankey data={{ nodes: dataset.nodes, links: dataset.links }} node={DirectNode} nodeWidth={10} nodePadding={16}>
                <Tooltip content={FlowTooltip} />
              </Sankey>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#d7e1eb] bg-[#fbfcfd] px-4 py-10 text-center">
            <p className="text-[10px] font-semibold text-[#526a80]">Sin transiciones visibles</p>
            <p className="mt-2 text-[9px] text-[#8b9daf]">Este sankey no trae enlaces con valores mayores a cero para mostrarse.</p>
          </div>
        )}
      </div>
    </article>
  );
}

function resolveSeparateSankeys(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [] as SeparateSankey[];
  return Object.values(value).filter((item): item is SeparateSankey => isSeparateSankey(item));
}

function isSeparateSankey(value: unknown): value is SeparateSankey {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.titulo === "string" && Array.isArray(candidate.niveles) && Array.isArray(candidate.transiciones);
}

function collectStageNames(transiciones: SeparateSankeyTransition[]) {
  const names: string[] = [];
  transiciones.forEach((transition) => {
    if (!names.includes(transition.de)) names.push(transition.de);
    if (!names.includes(transition.hacia)) names.push(transition.hacia);
  });
  return names;
}

function hasPositiveFlow(transition: SeparateSankeyTransition) {
  return transition.valores.some((row) => row.some((value) => toFlowNumber(value) > 0));
}

function mergeSeparateSankeys(items: SeparateSankey[]): SankeyDataset | null {
  if (items.length === 0) return null;

  const transitions = items.flatMap((item) => {
    const useful = item.transiciones.filter(hasPositiveFlow);
    return useful.length > 0 ? useful : item.transiciones;
  });
  const stageNames = collectStageNames(transitions);
  const levels = sortLevels(uniqueValues(items.flatMap((item) => item.niveles)));
  if (stageNames.length === 0 || levels.length === 0) return null;

  const nodes = stageNames.flatMap((stage) => levels.map((level) => ({ name: `${stage} · ${level}` })));
  const stageIndexMap = new Map(stageNames.map((stage, index) => [stage, index]));
  const levelIndexMap = new Map(levels.map((level, index) => [level, index]));
  const flowMap = new Map<string, number>();

  items.forEach((item) => {
    const itemTransitions = item.transiciones.filter(hasPositiveFlow);
    const sourceTransitions = itemTransitions.length > 0 ? itemTransitions : item.transiciones;
    sourceTransitions.forEach((transition) => {
      const fromStageIndex = stageIndexMap.get(transition.de);
      const toStageIndex = stageIndexMap.get(transition.hacia);
      if (fromStageIndex === undefined || toStageIndex === undefined) return;

      transition.valores.forEach((row, fromLevelIndex) => {
        const fromLevel = item.niveles[fromLevelIndex];
        const normalizedFromIndex = fromLevel ? levelIndexMap.get(fromLevel) : undefined;
        if (normalizedFromIndex === undefined) return;

        row.forEach((raw, toLevelIndex) => {
          const toLevel = item.niveles[toLevelIndex];
          const normalizedToIndex = toLevel ? levelIndexMap.get(toLevel) : undefined;
          const amount = toFlowNumber(raw);
          if (normalizedToIndex === undefined || amount <= 0) return;

          const source = fromStageIndex * levels.length + normalizedFromIndex;
          const target = toStageIndex * levels.length + normalizedToIndex;
          const key = `${source}-${target}`;
          flowMap.set(key, (flowMap.get(key) ?? 0) + amount);
        });
      });
    });
  });

  return {
    title: items.length === 1 ? items[0].titulo : "Trayectoria fusionada",
    nodes,
    links: [...flowMap.entries()]
      .map(([key, value]) => {
        const [source, target] = key.split("-").map(Number);
        return { source, target, value };
      })
      .filter((item) => item.value > 0),
  };
}

function findSankeyDatasets(root: Record<string, unknown>) {
  const results: SankeyDataset[] = [];
  const seen = new Set<unknown>();

  function visit(value: unknown, path: string[]) {
    if (!value || typeof value !== "object" || seen.has(value)) return;
    seen.add(value);

    if (isSankeyRecord(value)) {
      results.push({
        title: formatPathTitle(path[path.length - 1] ?? "Sankey"),
        nodes: value.nodes,
        links: value.links,
      });
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, [...path, String(index)]));
      return;
    }

    for (const [key, child] of Object.entries(value)) {
      visit(child, [...path, key]);
    }
  }

  visit(root, []);
  return dedupeSankeys(results);
}

function dedupeSankeys(items: SankeyDataset[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function isSankeyRecord(value: unknown): value is { nodes: SankeyNode[]; links: SankeyLink[] } {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!Array.isArray(record.nodes) || !Array.isArray(record.links)) return false;

  return record.links.every((link) => {
    if (!link || typeof link !== "object") return false;
    const candidate = link as Record<string, unknown>;
    return typeof candidate.source === "number" && typeof candidate.target === "number" && typeof candidate.value === "number";
  });
}

function formatPathTitle(value: string) {
  const normalized = value.replace(/[_-]+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").trim();
  if (!normalized) return "Sankey";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function crearSankey(
  niveles: NivelDesempeno[],
  etapas: Array<{
    nombre: string;
    centrosPorNivel: Record<string, number>;
  }>,
  flujo?: Partial<{
    permaneceEnElMismoNivel: number;
    subeUnNivel: number;
    bajaUnNivel: number;
  }>,
) {
  const same = flujo?.permaneceEnElMismoNivel ?? 80;
  const up = flujo?.subeUnNivel ?? 10;
  const down = flujo?.bajaUnNivel ?? 10;

  return {
    nodes: etapas.flatMap((etapa) => niveles.map((nivel) => ({ name: `${etapa.nombre} · ${nivel.nombre}` }))),
    links: etapas.slice(0, -1).flatMap((etapa, etapaIndex) =>
      niveles.flatMap((nivel, nivelIndex) => {
        const value = etapa.centrosPorNivel[nivel.id] ?? 0;
        const source = etapaIndex * niveles.length + nivelIndex;
        const next = (etapaIndex + 1) * niveles.length;
        const links = [{ source, target: next + nivelIndex, value: Math.round((value * same) / 100) }];
        if (nivelIndex > 0) links.push({ source, target: next + nivelIndex - 1, value: Math.round((value * up) / 100) });
        if (nivelIndex < niveles.length - 1) links.push({ source, target: next + nivelIndex + 1, value: Math.round((value * down) / 100) });
        return links.filter((item) => item.value > 0);
      }),
    ),
  };
}

function LegacyNode({ index, x, y, width, height, niveles }: SankeyNodeProps & { niveles: NivelDesempeno[] }) {
  return <rect x={x} y={y} width={width} height={height} rx={2} fill={niveles[index % niveles.length]?.colorHexadecimal ?? "#64748b"} />;
}

function DirectNode({ x, y, width, height }: SankeyNodeProps) {
  const safeX = typeof x === "number" ? x : 0;
  const safeY = typeof y === "number" ? y : 0;
  const safeWidth = typeof width === "number" ? width : 10;
  const safeHeight = typeof height === "number" ? height : 0;
  const visibleHeight = Math.max(safeHeight, 3);
  const adjustedY = safeHeight > 0 ? safeY : safeY - 1.5;

  return <rect x={safeX} y={adjustedY} width={safeWidth} height={visibleHeight} rx={2} fill="#176fc8" />;
}

function FilterField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[7px] font-semibold uppercase text-[#8a9daf]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-8 min-w-[130px] rounded-md border border-[#d7e1eb] bg-white px-2.5 text-[8px] font-medium text-[#334b60] outline-none focus:border-[#69bdf5]"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function uniqueValues(values: string[]) {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function sortLevels(levels: string[]) {
  const normalizedOrder = ["critico", "bajo", "medio", "bueno", "excelente"];

  return [...levels].sort((left, right) => {
    const leftIndex = normalizedOrder.indexOf(normalizeLevelName(left));
    const rightIndex = normalizedOrder.indexOf(normalizeLevelName(right));

    if (leftIndex !== -1 || rightIndex !== -1) {
      if (leftIndex === -1) return 1;
      if (rightIndex === -1) return -1;
      if (leftIndex !== rightIndex) return leftIndex - rightIndex;
    }

    return left.localeCompare(right);
  });
}

function normalizeLevelName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function normalizeSubgroup(value: SeparateSankey["subgrupo"]) {
  if (typeof value === "string" && value.trim().length > 0) return value.trim();
  if (typeof value === "number" && Number.isFinite(value) && value !== 0) return String(value);
  return "General";
}

function compareBlockLabels(left: string, right: string) {
  const leftMatch = left.match(/\d+/);
  const rightMatch = right.match(/\d+/);

  if (leftMatch && rightMatch) {
    const numericDiff = Number(leftMatch[0]) - Number(rightMatch[0]);
    if (numericDiff !== 0) return numericDiff;
  }

  return left.localeCompare(right);
}

function FlowTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload as {
    source?: { name?: string };
    target?: { name?: string };
    value?: number;
    name?: string;
  };

  return (
    <div className="rounded-md border bg-white p-2 text-[8px] shadow-lg">
      <strong>
        {item.source?.name ?? item.name}
        {item.target?.name ? ` -> ${item.target.name}` : ""}
      </strong>
      <p>{item.value ?? payload[0].value} centros escolares</p>
    </div>
  );
}
