"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { apiFetch } from "@/services/api";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const object = (value: JsonValue): value is { [key: string]: JsonValue } => value !== null && typeof value === "object" && !Array.isArray(value);
const emptyValues = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(emptyValues);
  if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyValues(child)]));
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  if (typeof value === "string") return "";
  return null;
};

const fallbackQualityData: JsonValue = {
  kpis: { auditados: 0, universo: 0, cobertura: 0, cumplimiento: 0, hallazgos: 0, hallazgosMayor: 0, hallazgosMenor: 0, observaciones: 0, grupos: 0 },
  auditadosPorGrupo: [],
  cumplimientoPorGrupo: [],
  cumplimientoPorProceso: [],
  hallazgosCriticos: [],
};

const labels: Record<string, string> = {
  kpis: "Estado de las auditorías",
  auditadosPorGrupo: "Centros escolares auditados por grupo",
  cumplimientoPorGrupo: "Cumplimiento global por grupo",
  cumplimientoPorProceso: "Cumplimiento promedio por proceso",
  hallazgosCriticos: "Diagnóstico de hallazgos",
  auditados: "Auditados",
  universo: "Universo",
  cobertura: "Cobertura",
  cumplimiento: "Cumplimiento",
  hallazgos: "Hallazgos",
  hallazgosMayor: "Hallazgos mayor",
  hallazgosMenor: "Hallazgos menor",
  observaciones: "Observaciones",
  grupos: "Grupos",
  name: "Nombre",
  value: "Porcentaje",
  total: "Universo",
  title: "Título",
  process: "Proceso",
  description: "Descripción",
  impact: "Impacto",
};

const humanize = (key: string) => labels[key] ?? key.replace(/_/g, " ").replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const sectionOrder = ["kpis", "auditadosPorGrupo", "cumplimientoPorGrupo", "cumplimientoPorProceso", "hallazgosCriticos"];
const sectionDescriptions: Record<string, string> = {
  kpis: "Todos los bloques · indicadores principales del módulo.",
  auditadosPorGrupo: "Auditados respecto al universo de cada grupo.",
  cumplimientoPorGrupo: "Porcentaje promedio de cumplimiento.",
  cumplimientoPorProceso: "Comparación de los procesos evaluados.",
  hallazgosCriticos: "Hallazgos críticos identificados en los centros auditados.",
};
const orderedEntries = (value: { [key: string]: JsonValue }) => [
  ...sectionOrder.filter((key) => key in value).map((key) => [key, value[key]] as [string, JsonValue]),
  ...Object.entries(value).filter(([key]) => !sectionOrder.includes(key)),
];
const withFindingTitleDefaults = (value: JsonValue): JsonValue => {
  if (!object(value) || !Array.isArray(value.hallazgosCriticos)) return value;
  return {
    ...value,
    hallazgosCriticos: value.hallazgosCriticos.map((item, index) => object(item) && !item.title
      ? { ...item, title: `Hallazgo crítico ${index + 1}` }
      : item),
  };
};
const templateFor = (fieldKey: string, current?: JsonValue): JsonValue => {
  if (current !== undefined) return clone(current);
  if (fieldKey === "auditadosPorGrupo") return { name: "", auditados: 0, total: 0 };
  if (fieldKey === "cumplimientoPorGrupo" || fieldKey === "cumplimientoPorProceso") return { name: "", value: 0 };
  if (fieldKey === "hallazgosCriticos") return { title: "", process: "", description: "", impact: 0 };
  return "";
};

function Primitive({ label, value, onChange }: { label: string; value: string | number | boolean | null; onChange: (value: JsonValue) => void }) {
  const percentage = ["Porcentaje", "Cobertura", "Cumplimiento", "Impacto"].includes(label);
  const numeric = typeof value === "number" || value === null || percentage;
  const multiline = typeof value === "string" && /descripción|hallazgo/i.test(label);
  const style = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
  if (typeof value === "boolean") return <label className="flex items-center gap-2 text-[10px] font-semibold text-[#5d7285]"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)}/>{label}</label>;
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}{multiline ? <textarea rows={2} className={style} value={value} onChange={(event) => onChange(event.target.value)}/> : <input className={style} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} value={value ?? ""} onChange={(event) => onChange(numeric ? event.target.value === "" ? null : Number(event.target.value) : event.target.value)}/>}</label>;
}

function ArrayField({ fieldKey, label, value, onChange }: { fieldKey: string; label: string; value: JsonValue[]; onChange: (value: JsonValue) => void }) {
  const template = useRef<JsonValue>(templateFor(fieldKey, value[0]));
  const add = () => {
    const next = clone(template.current);
    onChange([...value, fieldKey === "hallazgosCriticos" && object(next) ? { ...next, title: `Hallazgo crítico ${value.length + 1}` } : next]);
  };

  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#294b68]">{label}</p><p className="text-[9px] text-[#8a9cab]">{value.length} registros</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={11}/>Agregar fila</button></div>{value.length === 0 ? <button type="button" onClick={add} className="w-full rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-[10px] text-[#6f8ca2]">+ Agregar el primer registro</button> : <div className="space-y-2">{value.map((item, index) => <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7"><span className="absolute left-2.5 top-2 text-[9px] font-bold text-[#688196]">Fila {index + 1}</span><button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-1.5 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar fila ${index + 1}`}><Trash2 size={12}/></button><JsonField fieldKey={fieldKey} label={`${label} ${index + 1}`} value={item} onChange={(updated) => onChange(value.map((current, itemIndex) => itemIndex === index ? updated : current))} root={object(item)}/></div>)}</div>}</div>;
}

function JsonField({ fieldKey, label, value, onChange, root = false }: { fieldKey: string; label: string; value: JsonValue; onChange: (value: JsonValue) => void; root?: boolean }) {
  if (Array.isArray(value)) return <ArrayField fieldKey={fieldKey} label={label} value={value} onChange={onChange}/>;
  if (!object(value)) return <Primitive label={label} value={value} onChange={onChange}/>;

  const fields = <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2">{Object.entries(value).map(([key, child]) => <JsonField key={key} fieldKey={key} label={humanize(key)} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })}/>)}</div>;
  if (root) return fields;
  return <details className="group col-span-full rounded-lg border border-[#d9e5ee] bg-white" open={fieldKey === "kpis"}><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68] hover:bg-[#edf5fa]">{label}<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-3">{fields}</div></details>;
}

export default function QualityManagementFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [data, setData] = useState<JsonValue>(() => clone(dashboardDatabase.gestionCalidad) as JsonValue);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (recordId) {
      apiFetch<{ record: { date: string; data: JsonValue } }>(`/dashboard/sections/gestionCalidad/${recordId}`)
        .then(({ record }) => { setDate(record.date); setData(record.data); })
        .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el registro."))
        .finally(() => setLoading(false));
      return;
    }

    apiFetch<{ records: Array<{ data: JsonValue }> }>("/dashboard/sections/gestionCalidad")
      .then(({ records }) => {
        const source = records[0]?.data ?? clone(dashboardDatabase.gestionCalidad) as JsonValue;
        setData(withFindingTitleDefaults(emptyValues(object(source) ? source : fallbackQualityData)));
      })
      .catch((cause) => {
        const source = clone(dashboardDatabase.gestionCalidad) as JsonValue;
        setData(withFindingTitleDefaults(emptyValues(object(source) ? source : fallbackQualityData)));
        setError(cause instanceof Error ? cause.message : "No fue posible preparar el formulario.");
      })
      .finally(() => setLoading(false));
  }, [recordId]);

  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;
  if (!object(data)) return null;

  const save = async () => {
    if (!date || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(recordId ? `/dashboard/sections/gestionCalidad/${recordId}` : "/dashboard/sections/gestionCalidad", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, gestionCalidad: data }) });
      router.push("/administracion/gestion-calidad");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]"><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push("/administracion/gestion-calidad")} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Gestión de Calidad</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header><form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>{orderedEntries(data).map(([key, value]) => <section key={key} className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><ShieldCheck size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{humanize(key)}</h2><p className="text-[9px] text-[#718799]">{sectionDescriptions[key] ?? "Completa la información correspondiente."}</p></div></div><div className="p-3 sm:p-4"><JsonField root fieldKey={key} label={humanize(key)} value={value} onChange={(updated) => setData({ ...data, [key]: updated })}/></div></section>)}</form><footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push("/administracion/gestion-calidad")} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer></div></main>;
}
