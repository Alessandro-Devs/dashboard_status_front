"use client";

import { Layers3 } from "lucide-react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { PUBLISHED_PHASES, readEditorial, type EditorialLine, type PublishedSubject } from "@/lib/learningEditorial";
import { LearningProgressSummaryCards } from "./LearningSummary";

// Aprendizaje / contenido. Los datos se capturan en Administración > Aprendizaje ("Flujo editorial"
// y "Clases publicadas por asignatura y fase") y se guardan en aprendizaje.editorial.

type Line = EditorialLine;

// Orden del flujo editorial (como en el esquema): Kira, IHFB, xAI; las demás líneas van después.
const FLOW_ORDER = ["Kira", "IHFB", "xAI"];

const STAGE_COLORS = ["#1670d2", "#16863f", "#e77b13"];
const shortName = (nombre: string) => FLOW_ORDER.find((key) => nombre.toLowerCase().startsWith(key.toLowerCase())) ?? nombre.split(/\s[-(]/)[0].trim();
const flowRank = (line: Line) => { const index = FLOW_ORDER.findIndex((key) => line.nombre.toLowerCase().startsWith(key.toLowerCase())); return index === -1 ? FLOW_ORDER.length : index; };

export default function LearningEditorialFlow() {
  const data = readEditorial((dashboardDatabase.aprendizaje as { editorial?: unknown } | undefined)?.editorial);
  if (!data) return <div className="rounded-xl border border-dashed border-[#cbd6e0] bg-white px-5 py-10 text-center"><p className="text-[11px] font-semibold text-[#526a80]">No hay información de Aprendizaje registrada para esta fecha.</p></div>;
  const flow = [...data.lineas].sort((a, b) => flowRank(a) - flowRank(b));
  return (
    <section aria-label="Aprendizaje y contenido" className="space-y-8">
      {data.lineas.length ? <>
        {/* Avance promedio por etapa */}
        <div className="-mt-5">
          <LearningProgressSummaryCards data={{ resumenAvance: data.resumen }} />
        </div>

        {/* Flujo editorial */}
        <div>
          <SectionTitle title="Flujo editorial" />
          <div className="mt-4 rounded-lg border border-[#d7e0e9] bg-white p-4 sm:p-5">
            <div className="space-y-4">
              {flow.map((line, index) => <FlowBar key={`${line.nombre}-${index}`} line={line} />)}
            </div>
          </div>
        </div>

        {/* Estado actual por línea */}
        <div>
          <SectionTitle title="Avance por línea" aside={<span className="rounded-full bg-[#e8f3ff] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[.04em] text-[#1670d2]">Hoy</span>} />
          <div className="mt-4 grid gap-4 lg:grid-cols-3">{data.lineas.map((line, index) => <LineCard key={`${line.nombre}-${index}`} line={line} />)}</div>
        </div>
      </> : null}

      {/* Clases publicadas por asignatura y fase */}
      {data.publicadas.length ? <PublishedTable rows={data.publicadas} /> : null}
    </section>
  );
}

function SectionTitle({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-3">
    <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[.04em] text-[#253d53]"><Layers3 className="h-4 w-4 text-[#1670d2]" />{title}</h2>
    {aside}
  </div>;
}

// Una barra por línea: clases producidas sobre el total.
function FlowBar({ line }: { line: Line }) {
  return <div className="grid gap-1.5 sm:grid-cols-[72px_1fr_110px] sm:items-center sm:gap-4">
    <div className="flex items-baseline justify-between gap-2 sm:block">
      <span className="text-[12px] font-semibold text-[#17324a]">{shortName(line.nombre)}</span>
      <span className="text-[9px] text-[#8a9bb0] sm:hidden"><strong className="font-semibold tabular-nums text-[#4f6a82]">{line.producido}</strong> de {line.total}</span>
    </div>
    <div className="h-2.5 overflow-hidden rounded-full bg-[#e8eef4]">
      <div className="h-full rounded-full bg-[#1670d2]" style={{ width: `${line.total > 0 ? Math.min(100, (line.producido / line.total) * 100) : 0}%` }} />
    </div>
    <span className="hidden text-right text-[9px] text-[#8a9bb0] sm:block"><strong className="text-[12px] font-semibold tabular-nums text-[#4f6a82]">{line.producido}</strong> de {line.total} clases</span>
  </div>;
}

function LineCard({ line }: { line: Line }) {
  return <article className="rounded-xl border border-[#e1e8ef] bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-[14px] font-semibold text-[#17324a]">{line.nombre}</h3>
        <p className="mt-1 text-[9px] font-semibold uppercase text-[#587086]">{line.rango}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end">
        <div className="flex h-8 min-w-10 items-center justify-center rounded-md bg-[#eaf3ff] px-2 text-[14px] font-semibold tabular-nums text-[#126fd0]">{line.producido}</div>
        <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-[#8295a8]">Producido</p>
      </div>
    </div>
    <div className="mt-4 space-y-3">
      {line.etapas.map((stage, index) => <div key={stage.label} className="rounded-lg border border-[#e6edf3] bg-[#f8fbfe] p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-semibold text-[#29445b]">{stage.label}</span>
          <span className="text-[18px] font-semibold leading-none tabular-nums" style={{ color: STAGE_COLORS[index] }}>{stage.pct}%</span>
        </div>
        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e3e9ef]"><div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, stage.pct))}%`, backgroundColor: STAGE_COLORS[index] }} /></div>
        <div className="mt-2 flex items-center justify-between text-[9px]">
          <span className="text-[#8a9bb0]">Clases</span>
          <span className="font-semibold tabular-nums text-[#4f6a82]">{stage.clases ?? "—"}</span>
        </div>
      </div>)}
    </div>
  </article>;
}

const formatNumber = (value: number) => value.toLocaleString("en-US");

// Tabla con mapa de calor: la intensidad del azul depende del volumen de clases publicadas.
function PublishedTable({ rows }: { rows: PublishedSubject[] }) {
  const totals = PUBLISHED_PHASES.map((_, index) => rows.reduce((sum, row) => sum + (row.fases[index] ?? 0), 0));
  const grandTotal = totals.reduce((sum, value) => sum + value, 0);
  const max = Math.max(1, ...rows.flatMap((row) => row.fases));
  const cellStyle = (value: number) => {
    const level = value / max;
    return { backgroundColor: `rgba(22, 112, 210, ${0.08 + level * 0.42})`, color: "#17324a" };
  };
  return <div className="rounded-xl border border-[#e1e8ef] bg-white p-4 sm:p-5">
    <h3 className="text-[14px] font-semibold text-[#17324a]">Clases publicadas por asignatura y fase</h3>
    <p className="mt-1 text-[10px] text-[#8a9bb0]">La intensidad del color indica el volumen de clases publicadas</p>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-[#e6edf3] text-[10px] font-semibold text-[#7a8ea3]">
            <th className="py-2.5 pr-3 text-left font-semibold">Asignatura</th>
            {PUBLISHED_PHASES.map((phase) => <th key={phase} className="px-2 py-2.5 text-right font-semibold">{phase}</th>)}
            <th className="py-2.5 pl-3 text-right font-semibold">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const total = row.fases.reduce((sum, value) => sum + value, 0);
            return <tr key={`${row.asignatura}-${rowIndex}`} className="border-b border-[#eef2f6]">
              <td className="py-2.5 pr-3 font-semibold text-[#17324a]">{row.asignatura}</td>
              {row.fases.map((value, index) => <td key={index} className="px-2 py-2.5 text-right">
                <span className="inline-flex min-w-[52px] justify-center rounded-md px-2.5 py-1.5 font-semibold tabular-nums" style={cellStyle(value)}>{formatNumber(value)}</span>
              </td>)}
              <td className="py-2.5 pl-3 text-right font-semibold tabular-nums text-[#17324a]">{formatNumber(total)}</td>
            </tr>;
          })}
        </tbody>
        <tfoot>
          <tr className="font-semibold text-[#17324a]">
            <td className="pt-3 pr-3">Total</td>
            {totals.map((value, index) => <td key={index} className="px-2 pt-3 text-right tabular-nums">{formatNumber(value)}</td>)}
            <td className="pt-3 pl-3 text-right tabular-nums">{formatNumber(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>;
}
