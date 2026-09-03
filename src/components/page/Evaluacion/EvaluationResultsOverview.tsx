"use client";
import { useState } from "react";
import { ArrowDownRight, ArrowUpRight, GitBranch, Minus } from "lucide-react";
import { ResponsiveContainer, Sankey, Tooltip, type SankeyNodeProps, type TooltipContentProps } from "recharts";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { formatoMiles, formatoNumero, getEvaluacion, tieneNumero, tieneTexto, type NivelDesempeno } from "./evaluationViewData";

export default function EvaluationResultsOverview() {
    useDashboardData();
    const vista = getEvaluacion().vistaResultados;
    const materias = vista?.materiasDisponibles ?? [];
    const [materiaElegida, setMateria] = useState("");
    const materia = materiaElegida || vista?.materiaSeleccionadaPorDefecto || materias[0] || "";
    const composicion = vista?.composicionDelUniverso[materia] ?? [];
    const trayectoria = vista?.trayectoriaDeResultados;
    const niveles = trayectoria?.nivelesDeDesempeno ?? [];
    const etapas = trayectoria?.etapas ?? [];
    const sankey = crearSankey(niveles, etapas, trayectoria?.distribucionPorcentualDeLosFlujos);
    const resumen = trayectoria?.resumenPorNivel ?? [];
    if (!vista)
        return null;
    return <div className="space-y-4">
    {materias.length > 0 && <section className="flex items-center justify-between rounded-lg border bg-white px-4 py-3"><div><p className="text-[9px] font-semibold uppercase text-[#60778c]">Materia</p><p className="text-[7px] text-[#91a2b5]">Dimensión de análisis</p></div><div className="flex rounded-md border p-0.5">{materias.map(item => <button key={item} onClick={() => setMateria(item)} className={`h-6 rounded px-3 text-[8px] font-semibold ${materia === item ? "bg-[#176fc8] text-white" : "text-[#60778c]"}`}>{item}</button>)}</div></section>}
    {composicion.length > 0 && <><div className="flex justify-between"><div><h2 className="text-[13px] font-semibold uppercase text-[#263d52]">Composición del universo</h2><p className="text-[8px] text-[#8a9daf]">Movimiento respecto a la etapa anterior</p></div><span className="text-[8px] text-[#60778c]">{materia}</span></div><div className="grid gap-3 md:grid-cols-3">{composicion.map((item, index) => <Composition key={item.estado} item={item} index={index}/>)}</div></>}
    {niveles.length > 0 && (etapas.length > 1 || resumen.length > 0) && <section className="overflow-hidden rounded-xl border bg-white"><header className="flex flex-wrap justify-between gap-3 border-b px-4 py-3"><div className="flex gap-2.5"><span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#eaf4ff] text-[#176fc8]"><GitBranch className="h-3.5 w-3.5"/></span><div><h3 className="text-[11px] font-semibold text-[#334b60]">Trayectoria de resultados</h3><p className="text-[7px] text-[#8a9daf]">Movimiento entre niveles de desempeño</p></div></div></header><div className="p-4">{etapas.length > 1 && <div className="h-[270px]"><ResponsiveContainer><Sankey data={sankey} node={(props: SankeyNodeProps) => <Node {...props} niveles={niveles}/>} nodeWidth={9} nodePadding={12}><Tooltip content={FlowTooltip}/></Sankey></ResponsiveContainer></div>} {resumen.length > 0 && <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{resumen.map(r => { const n = niveles.find(item => item.id === r.idNivel); return <div key={r.idNivel} className="rounded-md border p-2.5"><p className="text-[8px] font-semibold">{n?.nombre ?? r.idNivel}</p>{tieneNumero(r.centrosEscolares) && <strong style={{ color: n?.colorHexadecimal }}>{formatoMiles(r.centrosEscolares)}</strong>}{tieneNumero(r.porcentajeDelTotal) && <p className="text-[7px]">{formatoNumero(r.porcentajeDelTotal)}% del universo</p>}</div>; })}</div>}</div></section>}
    {(tieneTexto(trayectoria?.lecturaPrincipal) || tieneTexto(trayectoria?.descripcionLectura)) && <article className="rounded-lg border bg-white p-4"><p className="text-[8px] font-semibold uppercase text-[#71869a]">Lectura principal</p>{tieneTexto(trayectoria?.lecturaPrincipal) && <p className="mt-1.5 text-[11px] font-semibold">{trayectoria.lecturaPrincipal}</p>}{tieneTexto(trayectoria?.descripcionLectura) && <p className="mt-1.5 text-[8px] text-[#8a9daf]">{trayectoria.descripcionLectura}</p>}</article>}
  </div>;
}

function crearSankey(niveles: NivelDesempeno[], etapas: Array<{
    nombre: string;
    centrosPorNivel: Record<string, number>;
}>, flujo?: Partial<{
    permaneceEnElMismoNivel: number;
    subeUnNivel: number;
    bajaUnNivel: number;
}>) {
    const same = flujo?.permaneceEnElMismoNivel ?? 80, up = flujo?.subeUnNivel ?? 10, down = flujo?.bajaUnNivel ?? 10;
    return {
        nodes: etapas.flatMap(e => niveles.map(n => ({ name: `${e.nombre} · ${n.nombre}` }))),
        links: etapas.slice(0, -1).flatMap((e, i) => niveles.flatMap((n, j) => {
            const value = e.centrosPorNivel[n.id] ?? 0, source = i * niveles.length + j, next = (i + 1) * niveles.length, links = [{ source, target: next + j, value: Math.round(value * same / 100) }];
            if (j > 0)
                links.push({ source, target: next + j - 1, value: Math.round(value * up / 100) });
            if (j < niveles.length - 1)
                links.push({ source, target: next + j + 1, value: Math.round(value * down / 100) });
            return links.filter(l => l.value > 0);
        })),
    };
}

function Composition({ item, index }: {
    item: {
        estado: string;
        centrosEscolares: number | null;
        porcentajeDelTotal: number | null;
        variacionRespectoEtapaAnterior: number | null;
    };
    index: number;
}) {
    const color = index === 1 ? "#16a34a" : index === 2 ? "#dc2626" : "#64748b", Icon = index === 1 ? ArrowUpRight : index === 2 ? ArrowDownRight : Minus;
    return <article className="rounded-lg border bg-white p-4"><div className="flex gap-2"><Icon className="h-4 w-4" style={{ color }}/><h3 className="text-[10px] font-semibold">{item.estado}</h3></div>{tieneNumero(item.centrosEscolares) && <strong className="mt-3 block text-2xl" style={{ color }}>{formatoMiles(item.centrosEscolares)}</strong>}{tieneNumero(item.porcentajeDelTotal) && <p className="text-[8px]">{formatoNumero(item.porcentajeDelTotal)}% del total</p>}{tieneNumero(item.variacionRespectoEtapaAnterior) && <p className="mt-3 border-t pt-2 text-[7px]">Variación: {formatoNumero(item.variacionRespectoEtapaAnterior)} pp</p>}</article>;
}

function Node({ index, x, y, width, height, niveles }: SankeyNodeProps & {
    niveles: NivelDesempeno[];
}) {
    return <rect x={x} y={y} width={width} height={height} rx={2} fill={niveles[index % niveles.length]?.colorHexadecimal ?? "#64748b"}/>;
}

function FlowTooltip({ active, payload }: TooltipContentProps) {
    if (!active || !payload?.length)
        return null;
    const p = payload[0].payload as {
        source?: { name?: string };
        target?: { name?: string };
        value?: number;
        name?: string;
    };
    return <div className="rounded-md border bg-white p-2 text-[8px] shadow-lg"><strong>{p.source?.name ?? p.name}{p.target?.name ? ` → ${p.target.name}` : ""}</strong><p>{formatoMiles(p.value ?? payload[0].value)} centros escolares</p></div>;
}
