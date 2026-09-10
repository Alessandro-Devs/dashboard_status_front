"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import learningTemplate from "@/components/page/Aprendizaje/learningProgressTemplate.json";

type SummaryItem = { title: string; value: number | ""; description: string };
type LineItem = { label: string; value: number | ""; classes: string };
type LearningLine = { name: string; trimestre: string; contenido?: string; claseProducida: string; items: LineItem[] };
type BarrierItem = { aplicativo: string; title: string; description: string };
type LearningFormData = { estadoLxp: unknown[]; resumenAvance: SummaryItem[]; lineasAplicativo: LearningLine[]; barreras: BarrierItem[] };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const template = learningTemplate as unknown as LearningFormData;
const summaryTitles = ["Autoría", "Producción / edición", "Publicación"];
const applicationNames = ["IHFB", "Kira", "xAI"];
const emptyTemplate: LearningFormData = {
  estadoLxp: [],
  resumenAvance: template.resumenAvance.map(() => ({ title: "", value: "", description: "" })),
  lineasAplicativo: template.lineasAplicativo.map((line) => ({
    name: "",
    trimestre: "",
    contenido: "",
    claseProducida: "",
    items: line.items.map(() => ({ label: "", value: "", classes: "" })),
  })),
  barreras: template.barreras.map((_, index) => ({ aplicativo: applicationNames[index] ?? "IHFB", title: "", description: "" })),
};
const normalize = (value: unknown): LearningFormData => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return clone(emptyTemplate);
  const source = value as Partial<LearningFormData>;
  return {
    estadoLxp: Array.isArray(source.estadoLxp) ? source.estadoLxp : [],
    resumenAvance: Array.isArray(source.resumenAvance) ? source.resumenAvance as SummaryItem[] : clone(emptyTemplate.resumenAvance),
    lineasAplicativo: Array.isArray(source.lineasAplicativo) ? (source.lineasAplicativo as LearningLine[]).map((line) => ({ ...line, trimestre: typeof line.trimestre === "string" ? line.trimestre : typeof line.contenido === "string" ? line.contenido : "", contenido: typeof line.contenido === "string" ? line.contenido : "", claseProducida: typeof line.claseProducida === "string" ? line.claseProducida : typeof line.claseProducida === "number" ? String(line.claseProducida) : "" })) : clone(emptyTemplate.lineasAplicativo),
    barreras: Array.isArray(source.barreras) ? (source.barreras as Partial<BarrierItem>[]).map((item, index) => ({ aplicativo: typeof item.aplicativo === "string" && item.aplicativo ? item.aplicativo : applicationNames[index] ?? "IHFB", title: typeof item.title === "string" ? item.title : "", description: typeof item.description === "string" ? item.description : "" })) : clone(emptyTemplate.barreras),
  };
};
const input = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const examplePlaceholder = (label: string, value?: string) => `Ej. ${value || label}`;
const readNumber = (value: unknown) => { const number = typeof value === "number" ? value : typeof value === "string" && value.trim() ? Number(value) : NaN; return Number.isFinite(number) ? number : null; };
const calculateSummary = (lines: LearningLine[]): SummaryItem[] => summaryTitles.map((title, itemIndex) => { const values = lines.map((line) => readNumber(line.items[itemIndex]?.value)).filter((value): value is number => value !== null); return { title, value: values.length ? Math.round(values.reduce((total, value) => total + value, 0) / values.length) : "", description: "Avance promedio" }; });

function TextField({ label, value, placeholder, onChange, multiline = false, disabled = false }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void; multiline?: boolean; disabled?: boolean }) {
  const disabledClass = "disabled:cursor-not-allowed disabled:bg-[#eef3f7] disabled:text-[#718799]";
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}{multiline ? <textarea rows={2} value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={`${input} ${disabledClass}`}/> : <input value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value)} disabled={disabled} className={`${input} ${disabledClass}`}/>}</label>;
}

function NumberField({ label, value, placeholder, onChange, disabled = false }: { label: string; value: number | ""; placeholder?: string; onChange: (value: number | "") => void; disabled?: boolean }) {
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}<input type="number" step="any" value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} disabled={disabled} className={`${input} disabled:cursor-not-allowed disabled:bg-[#eef3f7] disabled:text-[#718799]`}/></label>;
}

export default function LearningFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [data, setData] = useState<LearningFormData>(() => clone(emptyTemplate));
  const [loading, setLoading] = useState(Boolean(recordId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recordId) return;
    apiFetch<{ record: { date: string; data: unknown } }>(`/dashboard/sections/aprendizaje/${recordId}`)
      .then(({ record }) => { setDate(record.date); setData(normalize(record.data)); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el registro."))
      .finally(() => setLoading(false));
  }, [recordId]);

  const updateLine = (index: number, next: LearningLine) => setData((current) => ({ ...current, lineasAplicativo: current.lineasAplicativo.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const updateBarrier = (index: number, next: BarrierItem) => setData((current) => ({ ...current, barreras: current.barreras.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const save = async () => {
    if (!date || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(recordId ? `/dashboard/sections/aprendizaje/${recordId}` : "/dashboard/sections/aprendizaje", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, aprendizaje: { ...data, lineasAplicativo: data.lineasAplicativo.map((line, index) => ({ ...line, name: applicationNames[index] ?? line.name, claseProducida: line.items[1]?.classes ?? "", items: line.items.map((item, itemIndex) => ({ ...item, label: summaryTitles[itemIndex] ?? item.label })) })), barreras: data.barreras.map((item) => ({ ...item, aplicativo: item.aplicativo || "IHFB" })), resumenAvance: calculateSummary(data.lineasAplicativo) } }) });
      router.push("/administracion/aprendizaje");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;

  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]"><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Aprendizaje</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header><form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Avance promedio" description="Cards superiores del módulo."/><div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">{calculateSummary(data.lineasAplicativo).map((item, index) => { return <article key={index} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3"><TextField label="Título" value={item.title} onChange={() => undefined} disabled/><NumberField label="Porcentaje" value={item.value} onChange={() => undefined} disabled/><TextField label="Descripción" value={item.description} onChange={() => undefined} disabled/></article>; })}</div></section>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="" description="Cards por aplicativo y contenido."/><div className="space-y-3 p-3 sm:p-4">{data.lineasAplicativo.map((line, lineIndex) => { const guideLine = template.lineasAplicativo[lineIndex]; return <article key={lineIndex} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3"><div className="grid gap-2 sm:grid-cols-2"><TextField label="Aplicativo" value={applicationNames[lineIndex] ?? line.name} onChange={() => undefined} disabled/><TextField label="Trimestre" value={line.trimestre} placeholder="T1" onChange={(trimestre) => updateLine(lineIndex, { ...line, trimestre })}/></div><div className="mt-3 grid gap-2 sm:grid-cols-2"><TextField label="Contenido" value={line.contenido ?? ""} placeholder="101-120" onChange={(contenido) => updateLine(lineIndex, { ...line, contenido })}/><TextField label="Clase producida" value={line.items[1]?.classes ?? ""} onChange={() => undefined} disabled/></div><div className="mt-3 grid gap-2 lg:grid-cols-3">{line.items.map((item, itemIndex) => { const guide = guideLine?.items[itemIndex]; return <div key={itemIndex} className="rounded-md border bg-white p-2.5"><TextField label="Contenido" value={summaryTitles[itemIndex] ?? item.label} onChange={() => undefined} disabled/><NumberField label="Porcentaje" value={item.value} placeholder={String(guide?.value ?? "")} onChange={(value) => updateLine(lineIndex, { ...line, items: line.items.map((current, index) => index === itemIndex ? { ...current, value } : current) })}/><TextField label="Clases" value={item.classes} placeholder={guide?.classes} onChange={(classes) => updateLine(lineIndex, { ...line, items: line.items.map((current, index) => index === itemIndex ? { ...current, classes } : current) })}/></div>; })}</div></article>; })}</div></section>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Barreras" description="Agrega los detalles por aplicativo."/><div className="space-y-3 p-3 sm:p-4">{applicationNames.map((applicationName) => { const barriers = data.barreras.map((item, index) => ({ item, index })).filter(({ item }) => item.aplicativo === applicationName); return <details key={applicationName} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe]"><summary className="cursor-pointer px-3 py-2 text-[11px] font-semibold text-[#294b68]">{applicationName}</summary><div className="space-y-2 border-t border-[#e4ecf2] p-3">{barriers.map(({ item, index }) => <article key={index} className="relative rounded-md border bg-white p-2.5"><button type="button" onClick={() => setData((current) => ({ ...current, barreras: current.barreras.filter((_, itemIndex) => itemIndex !== index) }))} className="absolute right-2 top-2 rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#c85a5a] hover:bg-red-50">Quitar</button><TextField label="Título de la barrera" value={item.title ?? ""} placeholder="Ej. Tiempos de revisión" onChange={(title) => updateBarrier(index, { ...item, aplicativo: applicationName, title })}/><TextField multiline label="Detalle" value={item.description} placeholder="Describe la barrera del aplicativo" onChange={(description) => updateBarrier(index, { ...item, aplicativo: applicationName, description })}/></article>)}<button type="button" onClick={() => setData((current) => ({ ...current, barreras: [...current.barreras, { aplicativo: applicationName, title: "", description: "" }] }))} className="rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8] hover:bg-[#f3f8fc]">Agregar barrera</button></div></details>; })}</div></section>
  </form><footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer></div></main>;
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return <div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><BookOpenCheck size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{title}</h2><p className="text-[9px] text-[#718799]">{description}</p></div></div>;
}

