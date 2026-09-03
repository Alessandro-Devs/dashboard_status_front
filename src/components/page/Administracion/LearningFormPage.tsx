"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import learningTemplate from "@/components/page/Aprendizaje/learningProgressTemplate.json";

type SummaryItem = { title: string; value: number | ""; description: string };
type LineItem = { label: string; value: number | ""; classes: string };
type LearningLine = { name: string; claseProducida: number | ""; items: LineItem[] };
type BarrierItem = { title: string; description: string };
type LearningFormData = { estadoLxp: unknown[]; resumenAvance: SummaryItem[]; lineasAplicativo: LearningLine[]; barreras: BarrierItem[] };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const template = learningTemplate as LearningFormData;
const emptyTemplate: LearningFormData = {
  estadoLxp: [],
  resumenAvance: template.resumenAvance.map(() => ({ title: "", value: "", description: "" })),
  lineasAplicativo: template.lineasAplicativo.map((line) => ({
    name: "",
    claseProducida: "",
    items: line.items.map(() => ({ label: "", value: "", classes: "" })),
  })),
  barreras: template.barreras.map(() => ({ title: "", description: "" })),
};
const normalize = (value: unknown): LearningFormData => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return clone(emptyTemplate);
  const source = value as Partial<LearningFormData>;
  return {
    estadoLxp: Array.isArray(source.estadoLxp) ? source.estadoLxp : [],
    resumenAvance: Array.isArray(source.resumenAvance) ? source.resumenAvance as SummaryItem[] : clone(emptyTemplate.resumenAvance),
    lineasAplicativo: Array.isArray(source.lineasAplicativo) ? (source.lineasAplicativo as LearningLine[]).map((line) => ({ ...line, claseProducida: typeof line.claseProducida === "number" ? line.claseProducida : "" })) : clone(emptyTemplate.lineasAplicativo),
    barreras: Array.isArray(source.barreras) ? source.barreras as BarrierItem[] : clone(emptyTemplate.barreras),
  };
};
const input = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const examplePlaceholder = (label: string, value?: string) => `Ej. ${value || label}`;

function TextField({ label, value, placeholder, onChange, multiline = false }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void; multiline?: boolean }) {
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}{multiline ? <textarea rows={2} value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value)} className={input}/> : <input value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value)} className={input}/>}</label>;
}

function NumberField({ label, value, placeholder, onChange }: { label: string; value: number | ""; placeholder?: string; onChange: (value: number | "") => void }) {
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}<input type="number" step="any" value={value} placeholder={examplePlaceholder(label, placeholder)} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} className={input}/></label>;
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

  const updateSummary = (index: number, next: SummaryItem) => setData((current) => ({ ...current, resumenAvance: current.resumenAvance.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const updateLine = (index: number, next: LearningLine) => setData((current) => ({ ...current, lineasAplicativo: current.lineasAplicativo.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const updateBarrier = (index: number, next: BarrierItem) => setData((current) => ({ ...current, barreras: current.barreras.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const save = async () => {
    if (!date || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(recordId ? `/dashboard/sections/aprendizaje/${recordId}` : "/dashboard/sections/aprendizaje", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, aprendizaje: data }) });
      router.push("/administracion/aprendizaje");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;

  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]"><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Aprendizaje</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header><form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Avance promedio" description="Cards superiores del módulo."/><div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">{data.resumenAvance.map((item, index) => { const guide = template.resumenAvance[index]; return <article key={index} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3"><TextField label="Título" value={item.title} placeholder={guide?.title} onChange={(title) => updateSummary(index, { ...item, title })}/><NumberField label="Porcentaje" value={item.value} placeholder={String(guide?.value ?? "")} onChange={(value) => updateSummary(index, { ...item, value })}/><TextField label="Descripción" value={item.description} placeholder={guide?.description} onChange={(description) => updateSummary(index, { ...item, description })}/></article>; })}</div></section>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="" description="Cards por aplicativo y contenido."/><div className="space-y-3 p-3 sm:p-4">{data.lineasAplicativo.map((line, lineIndex) => { const guideLine = template.lineasAplicativo[lineIndex]; return <article key={lineIndex} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3"><TextField label="Aplicativo" value={line.name} placeholder={guideLine?.name} onChange={(name) => updateLine(lineIndex, { ...line, name })}/><div className="mt-3 max-w-[180px]"><NumberField label="Clase producida" value={line.claseProducida} placeholder={String(guideLine?.claseProducida ?? 97)} onChange={(claseProducida) => updateLine(lineIndex, { ...line, claseProducida })}/></div><div className="mt-3 grid gap-2 lg:grid-cols-3">{line.items.map((item, itemIndex) => { const guide = guideLine?.items[itemIndex]; return <div key={itemIndex} className="rounded-md border bg-white p-2.5"><TextField label="Contenido" value={item.label} placeholder={guide?.label} onChange={(label) => updateLine(lineIndex, { ...line, items: line.items.map((current, index) => index === itemIndex ? { ...current, label } : current) })}/><NumberField label="Porcentaje" value={item.value} placeholder={String(guide?.value ?? "")} onChange={(value) => updateLine(lineIndex, { ...line, items: line.items.map((current, index) => index === itemIndex ? { ...current, value } : current) })}/><TextField label="Clases" value={item.classes} placeholder={guide?.classes} onChange={(classes) => updateLine(lineIndex, { ...line, items: line.items.map((current, index) => index === itemIndex ? { ...current, classes } : current) })}/></div>; })}</div></article>; })}</div></section>
    <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Barreras" description="Cards inferiores de observaciones."/><div className="grid gap-3 p-3 md:grid-cols-3 sm:p-4">{data.barreras.map((item, index) => { const guide = template.barreras[index]; return <article key={index} className="relative rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3"><button type="button" onClick={() => setData((current) => ({ ...current, barreras: current.barreras.filter((_, itemIndex) => itemIndex !== index) }))} className="absolute right-2 top-2 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar barrera ${index + 1}`}><Trash2 size={12}/></button><TextField label="Título" value={item.title} placeholder={guide?.title} onChange={(title) => updateBarrier(index, { ...item, title })}/><TextField multiline label="Descripción" value={item.description} placeholder={guide?.description} onChange={(description) => updateBarrier(index, { ...item, description })}/></article>; })}</div><div className="border-t border-[#e6edf2] px-4 py-2"><button type="button" onClick={() => setData((current) => ({ ...current, barreras: [...current.barreras, { title: "", description: "" }] }))} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={11}/>Agregar barrera</button></div></section>
  </form><footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer></div></main>;
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return <div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><BookOpenCheck size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{title}</h2><p className="text-[9px] text-[#718799]">{description}</p></div></div>;
}
