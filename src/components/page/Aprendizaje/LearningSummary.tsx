"use client";

import { AlertTriangle, BookOpenCheck, Layers3 } from "lucide-react";
import type { LearningLine } from "./learningData";
import learningTemplate from "./learningProgressTemplate.json";

export type LearningProgressSummary = { title: string; value: number; description: string };
export type LearningProgressLine = { name: string; claseProducida?: number; items: Array<{ label: string; value: number; classes: string }> };
export type LearningProgressNote = { title: string; description: string };
export type LearningProgressData = {
  resumenAvance?: LearningProgressSummary[];
  lineasAplicativo?: LearningProgressLine[];
  barreras?: LearningProgressNote[];
};

const defaultProgressData = learningTemplate as LearningProgressData;
const colorForIndex = (index: number) => ["text-[#126fd0] bg-[#eaf3ff]", "text-[#16863f] bg-[#eaf8ef]", "text-[#e77b13] bg-[#fff3e6]"][index % 3];
const textColorForIndex = (index: number) => ["text-[#126fd0]", "text-[#16863f]", "text-[#e77b13]"][index % 3];
const lastClassValue = (value: string) => value.split(/\s+de\s+|-|\//i).at(-1)?.trim() ?? value;
const readNumber = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

export default function LearningSummary({ lines }: { lines: LearningLine[] }) {
  const maxClass = lines.length ? Math.max(...lines.map((item) => item.estatus.hastaClase)) : 0;
  const barriers = lines.filter((item) => item.barrera).length;
  const cards = [
    [Layers3, "Líneas visibles", String(lines.length), "Aplicativos según los filtros", "text-[#126fd0] bg-[#eaf3ff]"],
    [BookOpenCheck, "Clase más avanzada", String(maxClass), "Máximo registrado en el periodo", "text-[#16863f] bg-[#eaf8ef]"],
    [AlertTriangle, "Barreras identificadas", String(barriers), "Una barrera principal por línea", "text-[#e77b13] bg-[#fff3e6]"],
  ] as const;
  return <div className="mt-5 grid gap-4 md:grid-cols-3">{cards.map(([Icon, title, value, description, colors]) => <article key={title} className="min-h-[118px] rounded-lg border bg-white p-4">
    <div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors}`}><Icon className="h-4 w-4"/></span><span className="text-[9px] font-semibold uppercase text-[#587086]">{title}</span></div>
    <p className={`mt-4 text-[26px] font-medium ${colors.split(" ")[0]}`}>{value}</p>
    <p className="mt-3 text-[9px] text-[#8295a8]">{description}</p>
  </article>)}</div>;
}

export function LearningProgressSummaryCards({ data = defaultProgressData }: { data?: LearningProgressData }) {
  return <div className="mt-5 grid gap-4 md:grid-cols-3">{(data.resumenAvance ?? []).map((item, index) => {
    const colors = colorForIndex(index);
    return <article key={item.title} className="min-h-[118px] rounded-lg border bg-white p-4">
      <div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors}`}><BookOpenCheck className="h-4 w-4"/></span><span className="text-[9px] font-semibold uppercase text-[#587086]">{item.title}</span></div>
      <p className={`mt-4 text-[26px] font-medium ${colors.split(" ")[0]}`}>{item.value}%</p>
      <p className="mt-3 text-[9px] text-[#8295a8]">{item.description}</p>
    </article>;
  })}</div>;
}

export function LearningProgressLineCards({ data = defaultProgressData }: { data?: LearningProgressData }) {
  return <div className="mt-5 grid gap-4 lg:grid-cols-3">{(data.lineasAplicativo ?? []).map((line) => <article key={line.name} className="rounded-lg border bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-[14px] font-semibold text-[#17324a]">{line.name}</h3>
        <p className="mt-1 text-[9px] font-semibold uppercase text-[#587086]">Contenido</p>
      </div>
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-8 min-w-10 items-center justify-center rounded-md bg-[#eaf3ff] px-2 text-[14px] font-semibold text-[#126fd0]">{line.claseProducida ?? 97}</div>
        <p className="mt-1 text-[8px] font-semibold uppercase tracking-wide text-[#8295a8]">Producido</p>
      </div>
    </div>
    <div className="mt-4 space-y-3">{line.items.map((item, index) => {
      const color = textColorForIndex(index);
      return <div key={item.label} className="rounded-md border border-[#e1e8ef] bg-[#f8fbfe] px-3 py-3">
        <div className="flex items-start justify-between gap-3"><p className="text-[10px] font-semibold text-[#29445b]">{item.label}</p><strong className={`text-[20px] leading-none ${color}`}>{item.value}%</strong></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e3ebf2]"><div className={`h-full rounded-full ${color}`} style={{ width: `${item.value}%`, backgroundColor: "currentColor" }}/></div>
        <div className="mt-2 flex items-center justify-between gap-3"><span className="text-[8px] text-[#8295a8]">Clases</span><span className="text-[10px] font-semibold text-[#526a80]">{lastClassValue(item.classes)}</span></div>
      </div>;
    })}</div>
  </article>)}</div>;
}

export function LearningProgressNotes({ data = defaultProgressData }: { data?: LearningProgressData }) {
  return <div className="mt-5 grid gap-4 md:grid-cols-3">{(data.barreras ?? []).map((item) => <article key={item.title} className="rounded-lg border border-[#e1e8ef] bg-white p-4">
    <div className="flex items-start gap-3"><span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#fff3e6] text-[#e77b13]"><AlertTriangle className="h-4 w-4"/></span><div><h3 className="text-[12px] font-semibold text-[#29445b]">{item.title}</h3><p className="mt-2 text-[9px] leading-5 text-[#71869a]">{item.description}</p></div></div>
  </article>)}</div>;
}

export function hasLearningProgressData(value: unknown): value is LearningProgressData {
  if (typeof value !== "object" || value === null) return false;

  const data = value as LearningProgressData;
  const hasSummary = data.resumenAvance?.some((item) => (readNumber(item.value) ?? 0) > 0) ?? false;
  const hasLines = data.lineasAplicativo?.some((line) => line.items.some((item) => (readNumber(item.value) ?? 0) > 0)) ?? false;

  return hasSummary || hasLines;
}
