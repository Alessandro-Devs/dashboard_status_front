"use client";

import { GitBranch } from "lucide-react";
import { ResponsiveContainer, Sankey, Tooltip, type SankeyNodeProps, type TooltipContentProps } from "recharts";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { getEvaluacion, tieneNumero, tieneTexto, type NivelDesempeno } from "./evaluationViewData";

type SankeyNode = { name?: string };
type SankeyLink = { source: number; target: number; value: number };
type SankeyDataset = { title: string; nodes: SankeyNode[]; links: SankeyLink[] };
type SeparateSankeyTransition = { de: string; hacia: string; totalCe: number | null; valores: Array<Array<number | null>> };
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
    return <section className="grid grid-cols-1 gap-4">
      {explicitSankeys.map((dataset, index) => <DirectSankeyCard key={`${dataset.title}-${index}`} dataset={dataset} />)}
    </section>;
  }

  const directSankeys = findSankeyDatasets(evaluacion);

  if (directSankeys.length > 0) {
    return <section className="grid grid-cols-1 gap-4">
      {directSankeys.slice(0, 6).map((dataset, index) => <DirectSankeyCard key={`${dataset.title}-${index}`} dataset={dataset} />)}
    </section>;
  }

  const vista = evaluacion.vistaResultados as {
    materiasDisponibles?: string[];
    materiaSeleccionadaPorDefecto?: string;
    trayectoriaDeResultados?: {
      nivelesDeDesempeno?: NivelDesempeno[];
      resumenPorNivel?: Array<{ idNivel: string; centrosEscolares: number | null; porcentajeDelTotal: number | null }>;
      etapas?: Array<{ nombre: string; centrosPorNivel: Record<string, number> }>;
      distribucionPorcentualDeLosFlujos?: Partial<{ permaneceEnElMismoNivel: number; subeUnNivel: number; bajaUnNivel: number }>;
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
    return <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center">
      <p className="text-[12px] font-semibold text-[#526a80]">Sin sankeys de progreso</p>
      <p className="mt-2 text-[10px] text-[#8b9daf]">No se encontraron datasets de sankey en la BD para la vista de Progreso.</p>
    </article>;
  }

  return <section className="space-y-4">
    {hasSankey && <section className="overflow-hidden rounded-xl border bg-white">
      <header className="flex flex-wrap justify-between gap-3 border-b px-4 py-3">
        <div className="flex gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]"><GitBranch className="h-3.5 w-3.5" /></span>
          <div>
            <h3 className="text-[11px] font-semibold text-[#334b60]">Trayectoria de resultados</h3>
            <p className="text-[7px] text-[#8a9daf]">Movimiento entre niveles de desempeño{materia ? ` · ${materia}` : ""}</p>
          </div>
        </div>
      </header>
      <div className="p-4">
        <div className="h-[320px]">
          <ResponsiveContainer>
            <Sankey data={sankey} node={(props:SankeyNodeProps) => <LegacyNode {...props} niveles={niveles} />} nodeWidth={10} nodePadding={16}>
              <Tooltip content={FlowTooltip} />
            </Sankey>
          </ResponsiveContainer>
        </div>
        {hasSummary && <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">{resumen.map((item) => { const nivel = niveles.find((nivelItem) => nivelItem.id === item.idNivel); return <div key={item.idNivel} className="rounded-md border p-2.5"><p className="text-[8px] font-semibold">{nivel?.nombre ?? item.idNivel}</p>{tieneNumero(item.centrosEscolares) && <strong style={{ color: nivel?.colorHexadecimal }}>{item.centrosEscolares}</strong>}{tieneNumero(item.porcentajeDelTotal) && <p className="text-[7px]">{item.porcentajeDelTotal}% del universo</p>}</div>; })}</div>}
      </div>
    </section>}
    {hasReading && <article className="rounded-lg border bg-white p-4"><p className="text-[8px] font-semibold uppercase text-[#71869a]">Lectura principal</p>{tieneTexto(trayectoria?.lecturaPrincipal) && <p className="mt-1.5 text-[11px] font-semibold">{trayectoria?.lecturaPrincipal}</p>}{tieneTexto(trayectoria?.descripcionLectura) && <p className="mt-1.5 text-[8px] text-[#8a9daf]">{trayectoria?.descripcionLectura}</p>}</article>}
  </section>;
}

function DirectSankeyCard({ dataset }: { dataset: SankeyDataset }) {
  return <article className="overflow-hidden rounded-xl border bg-white">
    <header className="flex items-start gap-2.5 border-b px-4 py-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]"><GitBranch className="h-3.5 w-3.5" /></span>
      <div>
        <h3 className="text-[11px] font-semibold text-[#334b60]">{dataset.title}</h3>
        <p className="text-[7px] text-[#8a9daf]">Trayectoria de progreso desde la base de datos</p>
      </div>
    </header>
    <div className="p-4">
      {dataset.links.length > 0 ? <div className="h-[320px]">
        <ResponsiveContainer>
          <Sankey data={{ nodes: dataset.nodes, links: dataset.links }} node={DirectNode} nodeWidth={10} nodePadding={16}>
            <Tooltip content={FlowTooltip} />
          </Sankey>
        </ResponsiveContainer>
      </div> : <div className="rounded-lg border border-dashed border-[#d7e1eb] bg-[#fbfcfd] px-4 py-10 text-center"><p className="text-[10px] font-semibold text-[#526a80]">Sin transiciones visibles</p><p className="mt-2 text-[9px] text-[#8b9daf]">Este sankey no trae enlaces con valores mayores a cero para mostrarse.</p></div>}
    </div>
  </article>;
}

function resolveSeparateSankeys(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [] as SankeyDataset[];
  return Object.values(value)
    .map((item) => toSeparateSankeyDataset(item))
    .filter((item): item is SankeyDataset => item !== null)
    .slice(0, 6);
}

function toSeparateSankeyDataset(value: unknown): SankeyDataset | null {
  if (!isSeparateSankey(value)) return null;
  const usefulTransitions = value.transiciones.filter(hasPositiveFlow);
  const sourceTransitions = usefulTransitions.length > 0 ? usefulTransitions : value.transiciones;
  const stageNames = collectStageNames(sourceTransitions);
  const nodes = stageNames.flatMap((stage) => value.niveles.map((level) => ({ name: `${stage} · ${level}` })));
  const links: SankeyLink[] = [];
  const stageIndexMap = new Map(stageNames.map((stage, index) => [stage, index]));

  sourceTransitions.forEach((transition) => {
    const fromStageIndex = stageIndexMap.get(transition.de);
    const toStageIndex = stageIndexMap.get(transition.hacia);
    if (fromStageIndex === undefined || toStageIndex === undefined) return;
    transition.valores.forEach((row, fromLevelIndex) => {
      row.forEach((raw, toLevelIndex) => {
        const amount = toFlowNumber(raw);
        if (amount <= 0) return;
        const source = fromStageIndex * value.niveles.length + fromLevelIndex;
        const target = toStageIndex * value.niveles.length + toLevelIndex;
        links.push({ source, target, value: amount });
      });
    });
  });

  return { title: value.titulo, nodes, links };
}

function isSeparateSankey(value: unknown): value is SeparateSankey {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.titulo === "string"
    && Array.isArray(candidate.niveles)
    && Array.isArray(candidate.transiciones);
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

function crearSankey(niveles:NivelDesempeno[], etapas:Array<{nombre:string;centrosPorNivel:Record<string,number>}>, flujo?:Partial<{permaneceEnElMismoNivel:number;subeUnNivel:number;bajaUnNivel:number}>) {
  const same = flujo?.permaneceEnElMismoNivel ?? 80;
  const up = flujo?.subeUnNivel ?? 10;
  const down = flujo?.bajaUnNivel ?? 10;
  return {
    nodes: etapas.flatMap((etapa) => niveles.map((nivel) => ({ name: `${etapa.nombre} · ${nivel.nombre}` }))),
    links: etapas.slice(0, -1).flatMap((etapa, etapaIndex) => niveles.flatMap((nivel, nivelIndex) => {
      const value = etapa.centrosPorNivel[nivel.id] ?? 0;
      const source = etapaIndex * niveles.length + nivelIndex;
      const next = (etapaIndex + 1) * niveles.length;
      const links = [{ source, target: next + nivelIndex, value: Math.round(value * same / 100) }];
      if (nivelIndex > 0) links.push({ source, target: next + nivelIndex - 1, value: Math.round(value * up / 100) });
      if (nivelIndex < niveles.length - 1) links.push({ source, target: next + nivelIndex + 1, value: Math.round(value * down / 100) });
      return links.filter((item) => item.value > 0);
    })),
  };
}

function LegacyNode({ index, x, y, width, height, niveles }: SankeyNodeProps & { niveles:NivelDesempeno[] }) {
  return <rect x={x} y={y} width={width} height={height} rx={2} fill={niveles[index % niveles.length]?.colorHexadecimal ?? "#64748b"} />;
}

function DirectNode({ x, y, width, height }: SankeyNodeProps) {
  return <rect x={x} y={y} width={width} height={height} rx={2} fill="#176fc8" />;
}

function FlowTooltip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as { source?: { name?: string }; target?: { name?: string }; value?: number; name?: string };
  return <div className="rounded-md border bg-white p-2 text-[8px] shadow-lg"><strong>{item.source?.name ?? item.name}{item.target?.name ? ` → ${item.target.name}` : ""}</strong><p>{item.value ?? payload[0].value} centros escolares</p></div>;
}
