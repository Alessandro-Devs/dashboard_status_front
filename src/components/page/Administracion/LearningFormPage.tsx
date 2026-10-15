"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, BookOpenCheck, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { blankEditorial, blankEditorialLine, blankPublishedSubject, EDITORIAL_STAGES, editorialSummary, normalizeEditorial, PUBLISHED_PHASES, toNumber, type EditorialInput, type EditorialLineInput, type PublishedSubjectInput } from "@/lib/learningEditorial";

// Formulario de Aprendizaje: captura lo que se muestra en el dashboard (aprendizaje.editorial):
// avance promedio (calculado), flujo editorial / avance por línea y clases publicadas por asignatura y fase.

type Raw = Record<string, unknown>;
const isObject = (value: unknown): value is Raw => value !== null && typeof value === "object" && !Array.isArray(value);
const input = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff] disabled:cursor-not-allowed disabled:bg-[#eef3f7] disabled:text-[#718799]";
const cellBase = "w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const cellInput = `${cellBase} text-right tabular-nums`;

function TextField({ label, value, placeholder, onChange }: { label: string; value: string; placeholder?: string; onChange: (value: string) => void }) {
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}<input value={value} placeholder={placeholder ? `Ej. ${placeholder}` : undefined} onChange={(event) => onChange(event.target.value)} className={input}/></label>;
}

function NumberField({ label, value, placeholder, onChange, suffix, disabled = false }: { label: string; value: string | number; placeholder?: string; onChange: (value: string | number) => void; suffix?: string; disabled?: boolean }) {
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}<span className="relative block"><input type="number" step="any" min={0} value={value} placeholder={placeholder ? `Ej. ${placeholder}` : undefined} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} disabled={disabled} className={`${input} ${suffix ? "pr-6" : ""}`}/>{suffix ? <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 pt-0.5 text-[10px] text-[#8a9cab]">{suffix}</span> : null}</span></label>;
}

export default function LearningFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [data, setData] = useState<EditorialInput>(() => blankEditorial());
  // Lo demás que tenga el registro (datos de versiones anteriores) se conserva al guardar.
  const [raw, setRaw] = useState<Raw>({});
  const [loading, setLoading] = useState(Boolean(recordId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!recordId) return;
    apiFetch<{ record: { date: string; data: unknown } }>(`/dashboard/sections/aprendizaje/${recordId}`)
      .then(({ record }) => { setDate(record.date); setRaw(isObject(record.data) ? record.data : {}); setData(normalizeEditorial(isObject(record.data) ? record.data.editorial : undefined)); })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el registro."))
      .finally(() => setLoading(false));
  }, [recordId]);

  const updateLine = (index: number, next: EditorialLineInput) => setData((current) => ({ ...current, lineas: current.lineas.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const updateSubject = (index: number, next: PublishedSubjectInput) => setData((current) => ({ ...current, publicadas: current.publicadas.map((item, itemIndex) => itemIndex === index ? next : item) }));
  const summary = editorialSummary(data);
  const phaseTotals = PUBLISHED_PHASES.map((_, index) => data.publicadas.reduce((sum, row) => sum + (toNumber(row.valores[index]) ?? 0), 0));

  const save = async () => {
    if (!date || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(recordId ? `/dashboard/sections/aprendizaje/${recordId}` : "/dashboard/sections/aprendizaje", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, aprendizaje: { ...raw, editorial: { ...data, lineas: data.lineas.map((line) => ({ ...line, producido: line.etapas[1]?.clases ?? "" })) } } }) });
      router.push("/administracion/aprendizaje");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;

  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]">
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Aprendizaje</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header>
    <form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>

      {/* Avance promedio (calculado) */}
      <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Avance promedio" description="Cards superiores del módulo. Se calculan solas con el promedio de cada etapa de las líneas."/>
        <div className="grid gap-3 p-3 sm:grid-cols-3 sm:p-4">{summary.map((item) => <div key={item.title} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] px-3 py-2.5"><p className="text-[10px] font-semibold text-[#5d7285]">{item.title}</p><p className="mt-1 text-[20px] font-semibold leading-none tabular-nums text-[#176fc8]">{item.value}%</p><p className="mt-1 text-[9px] text-[#8a9cab]">{item.description}</p></div>)}</div>
      </section>

      {/* Líneas: flujo editorial + avance por línea */}
      <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Flujo editorial y avance por línea" description="Cada línea alimenta su barra del flujo editorial (producido de total) y su card con Autoría, Edición y Publicación."/>
        <div className="space-y-3 p-3 sm:p-4">
          {data.lineas.map((line, lineIndex) => <article key={lineIndex} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3">
            <div className="mb-2 flex items-center justify-between"><p className="text-[11px] font-bold text-[#294b68]">{line.nombre.trim() || `Línea ${lineIndex + 1}`}</p><button type="button" onClick={() => setData((current) => ({ ...current, lineas: current.lineas.filter((_, index) => index !== lineIndex) }))} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-[#c2410c] hover:bg-[#fff1ea]" aria-label={`Eliminar línea ${lineIndex + 1}`}><Trash2 size={12}/>Eliminar</button></div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <TextField label="Nombre de la línea" value={line.nombre} placeholder={["IHFB (Trimestre 3)", "Kira 2° - 6° (Trimestre 3)", "xAI - 6° (Trimestre 2)"][lineIndex] ?? "IHFB (Trimestre 3)"} onChange={(nombre) => updateLine(lineIndex, { ...line, nombre })}/>
              <TextField label="Rango de clases" value={line.rango} placeholder="110 a 160" onChange={(rango) => updateLine(lineIndex, { ...line, rango })}/>
              <NumberField label="Clases producidas" value={line.etapas[1]?.clases ?? ""} disabled onChange={() => undefined}/>
              <NumberField label="Total de clases" value={line.total} placeholder="160" onChange={(total) => updateLine(lineIndex, { ...line, total })}/>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">{line.etapas.map((stage, stageIndex) => <div key={stageIndex} className="rounded-md border border-[#e3ebf2] bg-white p-2.5"><p className="text-[10px] font-bold text-[#294b68]">{EDITORIAL_STAGES[stageIndex]}</p><div className="mt-1.5 grid grid-cols-2 gap-2">
              <NumberField label="Porcentaje" suffix="%" value={stage.pct} placeholder={["100", "58", "58"][stageIndex]} onChange={(pct) => updateLine(lineIndex, { ...line, etapas: line.etapas.map((item, index) => index === stageIndex ? { ...item, pct } : item) })}/>
              <NumberField label="Clases" value={stage.clases} placeholder={["160", "139", "139"][stageIndex]} onChange={(clases) => updateLine(lineIndex, { ...line, etapas: line.etapas.map((item, index) => index === stageIndex ? { ...item, clases } : item) })}/>
            </div></div>)}</div>
          </article>)}
          <button type="button" onClick={() => setData((current) => ({ ...current, lineas: [...current.lineas, blankEditorialLine()] }))} className="inline-flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[#bfd8eb] bg-white px-2 py-2 text-[10px] font-semibold text-[#176fc8] hover:bg-[#f5faff]"><Plus size={12}/>Agregar línea</button>
        </div>
      </section>

      {/* Clases publicadas por asignatura y fase */}
      <section className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><SectionHeader title="Clases publicadas por asignatura y fase" description="Tabla con mapa de calor del dashboard. Los totales se calculan solos."/>
        <div className="p-3 sm:p-4"><div className="overflow-x-auto rounded-lg border border-[#dce7ef]">
          <table className="w-full min-w-[560px] border-collapse text-[10px]">
            <thead className="bg-[#f5f9fc] text-[#5d7285]"><tr><th className="px-2.5 py-2 text-left font-semibold">Asignatura</th>{PUBLISHED_PHASES.map((phase) => <th key={phase} className="w-[110px] px-2 py-2 text-right font-semibold">{phase}</th>)}<th className="w-[80px] px-2.5 py-2 text-right font-semibold">Total</th><th className="w-9" aria-label="Acciones"/></tr></thead>
            <tbody>
              {data.publicadas.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-[#e8eef3]">
                <td className="px-2 py-1.5"><input value={row.asignatura} placeholder="Ej. Matemáticas" onChange={(event) => updateSubject(rowIndex, { ...row, asignatura: event.target.value })} className={cellBase} aria-label={`Asignatura ${rowIndex + 1}`}/></td>
                {row.valores.map((value, valueIndex) => <td key={valueIndex} className="px-2 py-1.5"><input type="number" min={0} step="any" value={value} placeholder="0" onChange={(event) => updateSubject(rowIndex, { ...row, valores: row.valores.map((item, index) => index === valueIndex ? (event.target.value === "" ? "" : Number(event.target.value)) : item) })} className={cellInput} aria-label={`${row.asignatura || `Asignatura ${rowIndex + 1}`} ${PUBLISHED_PHASES[valueIndex]}`}/></td>)}
                <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#294b68]">{row.valores.reduce<number>((sum, item) => sum + (toNumber(item) ?? 0), 0).toLocaleString("en-US")}</td>
                <td className="px-1 py-1.5 text-center"><button type="button" onClick={() => setData((current) => ({ ...current, publicadas: current.publicadas.filter((_, index) => index !== rowIndex) }))} className="rounded-md p-1 text-[#c2410c] hover:bg-[#fff1ea]" aria-label={`Eliminar ${row.asignatura || `asignatura ${rowIndex + 1}`}`}><Trash2 size={12}/></button></td>
              </tr>)}
            </tbody>
            <tfoot><tr className="border-t border-[#dce7ef] bg-[#f8fbfe] font-semibold text-[#294b68]"><td className="px-2.5 py-2">Total</td>{phaseTotals.map((total, index) => <td key={index} className="px-2.5 py-2 text-right tabular-nums">{total.toLocaleString("en-US")}</td>)}<td className="px-2.5 py-2 text-right tabular-nums">{phaseTotals.reduce((sum, value) => sum + value, 0).toLocaleString("en-US")}</td><td/></tr></tfoot>
          </table>
        </div>
        <button type="button" onClick={() => setData((current) => ({ ...current, publicadas: [...current.publicadas, blankPublishedSubject()] }))} className="mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-[#bfd8eb] bg-white px-2 py-2 text-[10px] font-semibold text-[#176fc8] hover:bg-[#f5faff]"><Plus size={12}/>Agregar asignatura</button></div>
      </section>
    </form>
    <footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push("/administracion/aprendizaje")} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer>
  </div></main>;
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return <div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><BookOpenCheck size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{title}</h2><p className="text-[9px] text-[#718799]">{description}</p></div></div>;
}
