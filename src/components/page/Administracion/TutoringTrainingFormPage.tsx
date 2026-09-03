"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, GraduationCap, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { apiFetch } from "@/services/api";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const object = (value: JsonValue): value is { [key: string]: JsonValue } => value !== null && typeof value === "object" && !Array.isArray(value);
const emptyValues = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(emptyValues);
  if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, emptyValues(child)]));
  if (typeof value === "number") return "";
  if (typeof value === "boolean") return false;
  if (typeof value === "string") return "";
  return null;
};

<<<<<<< Updated upstream
=======
const fixedTutoringTitles = ["Clase regular", "Remediación", "Refuerzo"];
const tutoringAccents = ["blue", "purple", "orange"];
const withoutPercentages = (value: JsonValue): JsonValue => value;
const attendancePercentage = (row: JsonValue) => {
  if (!object(row)) return "";
  const invited = Number(row.invited);
  const attended = Number(row.attended);
  if (!Number.isFinite(invited) || !Number.isFinite(attended) || invited <= 0) return "";
  return Math.round((attended / invited) * 10000) / 100;
};
const derivedPercentage = (section: JsonValue, numeratorKey: string, denominatorKey: string) => {
  if (!object(section)) return "";
  const numerator = Number(String(section[numeratorKey] ?? "").replace(/,/g, ""));
  const denominator = Number(String(section[denominatorKey] ?? "").replace(/,/g, ""));
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return "";
  return Math.round((numerator / denominator) * 10000) / 100;
};
const withDerivedPercentage = (section: JsonValue, numeratorKey: string, denominatorKey: string) => object(section)
  ? { ...section, porcentaje: derivedPercentage(section, numeratorKey, denominatorKey) }
  : section;

>>>>>>> Stashed changes
const fallbackData: JsonValue = {
  accesos: { centros: "0", docentes: "0", docentesConAcceso: "0", porcentajeDocentes: 0, estudiantes: "0", estudiantesConAcceso: "0", porcentajeEstudiantes: 0 },
  modelamientos: {
    totalDocentes: "0",
    claseRegularRemediacion: { totalEsperados: "0", realizados: "0", porcentaje: 0 },
    soloClaseRegular: { totalDocentes: "0", realizados: "0", porcentaje: 0 },
    soloRemediacion: { totalDocentes: "0", realizados: "0", porcentaje: 0 },
    meta: { total: "0", realizados: "0", porcentaje: 0 },
  },
  diagnosticos: { docentesDiagnosticados: "0", totalDocentes: "0", porcentaje: 0 },
  acompanamientos: { realizados: "0", estado: "En seguimiento" },
  tutoriaVirtual: [],
};

const labels: Record<string, string> = {
  accesos: "Accesos",
  modelamientos: "Modelamientos",
  diagnosticos: "Diagnóstico",
  acompanamientos: "Acompañamientos",
  tutoriaVirtual: "Tutoría virtual",
  centros: "Centros escolares",
  docentes: "Total docentes",
  docentesConAcceso: "Docentes con acceso",
  porcentajeDocentes: "Porcentaje docentes",
  estudiantes: "Total estudiantes",
  estudiantesConAcceso: "Estudiantes con acceso",
  porcentajeEstudiantes: "Porcentaje estudiantes",
  totalDocentes: "Total docentes",
  claseRegularRemediacion: "Clase regular + remediación",
  soloClaseRegular: "Clase regular",
  soloRemediacion: "Remediación",
  totalEsperados: "Total esperados",
  realizados: "Realizados",
  porcentaje: "Porcentaje",
  meta: "Meta de modelamientos",
  docentesDiagnosticados: "Diagnósticos realizados",
  realizadosAcompanamientos: "Acompañamientos realizados",
  estado: "Estado",
  title: "Título",
  accent: "Color",
  rows: "Asistencia por bloque",
  block: "Bloque",
  invited: "Convocados",
  attended: "Asistieron",
  percentage: "% de logro",
};

const sectionOrder = ["accesos", "modelamientos", "diagnosticos", "acompanamientos", "tutoriaVirtual"];
const sectionDescriptions: Record<string, string> = {
  accesos: "Disponibilidad de acceso para la comunidad educativa.",
  modelamientos: "Seguimiento de modelamientos realizados y distribución por tipo.",
  diagnosticos: "Seguimiento de la aplicación y avance del proceso diagnóstico.",
  acompanamientos: "Seguimiento acumulado de acompañamientos realizados a docentes.",
  tutoriaVirtual: "Seguimiento de convocatoria y asistencia a sesiones de tutoría virtual.",
};

const humanize = (key: string) => labels[key] ?? key.replace(/_/g, " ").replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const isCalculatedPercentage = (label: string) => /porcentaje|% de logro/i.test(label);
const examplePlaceholder = (label: string, numeric: boolean) => label === "% de logro" ? "Se calcula automáticamente" : numeric ? `Ej. ${label.includes("Porcentaje") ? "85" : "100"}` : `Ej. ${label}`;
const orderedEntries = (value: { [key: string]: JsonValue }) => [
  ...sectionOrder.filter((key) => key in value).map((key) => [key, value[key]] as [string, JsonValue]),
  ...Object.entries(value).filter(([key]) => !sectionOrder.includes(key)),
];
<<<<<<< Updated upstream
const normalizeShape = (value: JsonValue): JsonValue => object(value) ? { ...(clone(fallbackData) as { [key: string]: JsonValue }), ...value } : clone(fallbackData);
const templateFor = (fieldKey: string, current?: JsonValue): JsonValue => {
  if (current !== undefined) return clone(current);
  if (fieldKey === "tutoriaVirtual") return { title: "", percentage: 0, accent: "blue", rows: [] };
  if (fieldKey === "rows") return { block: "", invited: 0, attended: 0, percentage: 0 };
  return "";
};

function Primitive({ label, value, onChange }: { label: string; value: string | number | boolean | null; onChange: (value: JsonValue) => void }) {
  const numeric = typeof value === "number" || value === null || /porcentaje|convocados|asistieron/i.test(label);
  const style = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
  if (typeof value === "boolean") return <label className="flex items-center gap-2 text-[10px] font-semibold text-[#5d7285]"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)}/>{label}</label>;
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}<input className={style} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} value={value ?? ""} onChange={(event) => onChange(numeric ? event.target.value === "" ? null : Number(event.target.value) : event.target.value)}/></label>;
=======
const percentageLastEntries = (value: { [key: string]: JsonValue }) => {
  const entries = Object.entries(value);
  return [...entries.filter(([key]) => !/porcentaje|percentage/i.test(key)), ...entries.filter(([key]) => /porcentaje|percentage/i.test(key))];
};
const accessFieldOrder = ["centros", "docentes", "docentesConAcceso", "estudiantes", "estudiantesConAcceso", "porcentajeDocentes", "porcentajeEstudiantes"];
const orderedAccessEntries = (value: { [key: string]: JsonValue }) => [
  ...accessFieldOrder.filter((key) => key in value).map((key) => [key, value[key]] as [string, JsonValue]),
  ...Object.entries(value).filter(([key]) => !accessFieldOrder.includes(key)),
];
const modelingFieldOrder = ["totalDocentes", "claseRegularRemediacion", "soloClaseRegular", "soloRemediacion", "meta"];
const orderedModelingEntries = (value: { [key: string]: JsonValue }) => [
  ...modelingFieldOrder.filter((key) => key in value).map((key) => [key, value[key]] as [string, JsonValue]),
  ...Object.entries(value).filter(([key]) => !modelingFieldOrder.includes(key)),
];
const normalizeShape = (value: JsonValue): JsonValue => {
  const normalized = object(value) ? { ...(clone(fallbackData) as { [key: string]: JsonValue }), ...value } : clone(fallbackData) as { [key: string]: JsonValue };
  normalized.accesos = object(normalized.accesos) ? {
    ...normalized.accesos,
    porcentajeDocentes: derivedPercentage(normalized.accesos, "docentesConAcceso", "docentes"),
    porcentajeEstudiantes: derivedPercentage(normalized.accesos, "estudiantesConAcceso", "estudiantes"),
  } : normalized.accesos;
  if (object(normalized.modelamientos)) {
    normalized.modelamientos = {
      ...normalized.modelamientos,
      claseRegularRemediacion: withDerivedPercentage(normalized.modelamientos.claseRegularRemediacion, "realizados", "totalEsperados"),
      soloClaseRegular: withDerivedPercentage(normalized.modelamientos.soloClaseRegular, "realizados", "totalDocentes"),
      soloRemediacion: withDerivedPercentage(normalized.modelamientos.soloRemediacion, "realizados", "totalDocentes"),
      meta: withDerivedPercentage(normalized.modelamientos.meta, "realizados", "total"),
    };
  }
  normalized.diagnosticos = withDerivedPercentage(normalized.diagnosticos, "docentesDiagnosticados", "totalDocentes");
  const groups = Array.isArray(normalized.tutoriaVirtual) ? normalized.tutoriaVirtual : [];
  normalized.tutoriaVirtual = fixedTutoringTitles.map((title, index) => {
    const current = object(groups[index]) ? groups[index] : {};
    const cleanCurrent = withoutPercentages(current);
    const rows = object(cleanCurrent) && Array.isArray(cleanCurrent.rows) ? cleanCurrent.rows.map((row) => object(row) ? { ...row, percentage: attendancePercentage(row) } : row) : [];
    return { ...(object(cleanCurrent) ? cleanCurrent : {}), rows, accent: tutoringAccents[index], title };
  });
  return normalized;
};
const templateFor = (fieldKey: string, current?: JsonValue): JsonValue => {
  if (current !== undefined) return clone(current);
  if (fieldKey === "tutoriaVirtual") return { title: "", accent: "blue", rows: [] };
  if (fieldKey === "rows") return { block: "", invited: "", attended: "", percentage: "" };
  return "";
};

function Primitive({ label, value, onChange, readOnly = false }: { label: string; value: string | number | boolean | null; onChange: (value: JsonValue) => void; readOnly?: boolean }) {
  const numeric = typeof value === "number" || value === null || /porcentaje|convocados|asistieron|total|realizados|meta|centros|docentes|estudiantes/i.test(label);
  const style = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
  if (typeof value === "boolean") return <label className="flex items-center gap-2 text-[10px] font-semibold text-[#5d7285]"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)}/>{label}</label>;
  return <label className={`block text-[10px] font-semibold text-[#5d7285] ${readOnly ? "cursor-not-allowed" : ""}`}>{label}<input className={`${style}${readOnly ? " cursor-not-allowed bg-[#f3f6f8] text-[#718799]" : ""}`} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} value={value ?? ""} placeholder={isCalculatedPercentage(label) ? "Se calcula automáticamente" : examplePlaceholder(label, numeric)} readOnly={readOnly} disabled={readOnly} onChange={(event) => onChange(numeric ? event.target.value === "" ? null : Number(event.target.value) : event.target.value)}/></label>;
>>>>>>> Stashed changes
}

function ArrayField({ fieldKey, label, value, onChange }: { fieldKey: string; label: string; value: JsonValue[]; onChange: (value: JsonValue) => void }) {
  const template = useRef<JsonValue>(templateFor(fieldKey, value[0]));
  const add = () => onChange([...value, clone(template.current)]);
  const itemLabel = fieldKey === "tutoriaVirtual" ? "Grupo" : fieldKey === "rows" ? "Bloque" : "Fila";

<<<<<<< Updated upstream
  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#294b68]">{label}</p><p className="text-[9px] text-[#8a9cab]">{value.length} registros</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={11}/>Agregar fila</button></div>{value.length === 0 ? <button type="button" onClick={add} className="w-full rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-[10px] text-[#6f8ca2]">+ Agregar el primer registro</button> : <div className="space-y-2">{value.map((item, index) => <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7"><span className="absolute left-2.5 top-2 text-[9px] font-bold text-[#688196]">{itemLabel} {index + 1}</span><button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-1.5 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar fila ${index + 1}`}><Trash2 size={12}/></button><JsonField fieldKey={fieldKey} label={`${label} ${index + 1}`} value={item} onChange={(updated) => onChange(value.map((current, itemIndex) => itemIndex === index ? updated : current))} root={object(item)}/></div>)}</div>}</div>;
=======
  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#294b68]">{label}</p><p className="text-[9px] text-[#8a9cab]">{value.length} registros</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={11}/>Agregar fila</button></div>{value.length === 0 ? <button type="button" onClick={add} className="w-full rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-[10px] text-[#6f8ca2]">+ Agregar el primer registro</button> : <div className="space-y-2">{value.map((item, index) => <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7"><span className="absolute left-2.5 top-2 text-[9px] font-bold text-[#688196]">{itemLabel} {index + 1}</span><button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-1.5 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar fila ${index + 1}`}><Trash2 size={12}/></button><JsonField fieldKey={fieldKey} label={`${label} ${index + 1}`} value={item} onChange={(updated) => onChange(value.map((current, itemIndex) => itemIndex === index ? (fieldKey === "rows" ? { ...(updated as { [key: string]: JsonValue }), percentage: attendancePercentage(updated) } : updated) : current))} root={object(item)} readOnlyTitle={fieldKey === "tutoriaVirtual"}/></div>)}</div>}</div>;
>>>>>>> Stashed changes
}

function JsonField({ fieldKey, label, value, onChange, root = false }: { fieldKey: string; label: string; value: JsonValue; onChange: (value: JsonValue) => void; root?: boolean }) {
  if (Array.isArray(value)) return <ArrayField fieldKey={fieldKey} label={label} value={value} onChange={onChange}/>;
<<<<<<< Updated upstream
  if (!object(value)) return <Primitive label={label} value={value} onChange={onChange}/>;

  const entries = root ? Object.entries(value) : Object.entries(value);
  const fields = <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2">{entries.map(([key, child]) => <JsonField key={key} fieldKey={key} label={humanize(key)} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })}/>)}</div>;
=======
  if (!object(value)) return <Primitive label={label} value={value} onChange={onChange} readOnly={/porcentaje|percentage/i.test(fieldKey) || (readOnlyTitle && ["title", "accent"].includes(fieldKey))}/>;

  const entries: [string, JsonValue][] = root && fieldKey === "tutoriaVirtual"
    ? ["title", "accent", "rows"].filter((key) => key in value).map((key) => [key, value[key]])
    : root && fieldKey === "accesos"
      ? orderedAccessEntries(value)
      : root && fieldKey === "modelamientos"
        ? orderedModelingEntries(value)
        : percentageLastEntries(value);
  const fields = <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2">{entries.map(([key, child]) => <JsonField key={key} fieldKey={key} label={humanize(key)} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })} readOnlyTitle={readOnlyTitle && ["title", "accent", "percentage"].includes(key)}/>)}</div>;
>>>>>>> Stashed changes
  if (root) return fields;
  return <details className="group col-span-full rounded-lg border border-[#d9e5ee] bg-white" open><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68] hover:bg-[#edf5fa]">{label}<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-3">{fields}</div></details>;
}

export default function TutoringTrainingFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [data, setData] = useState<JsonValue>(() => recordId ? normalizeShape(clone(dashboardDatabase.tutoriaFormacion) as JsonValue) : normalizeShape(emptyValues(clone(dashboardDatabase.tutoriaFormacion) as JsonValue)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (recordId) {
      apiFetch<{ record: { date: string; data: JsonValue } }>(`/dashboard/sections/tutoriaFormacion/${recordId}`)
        .then(({ record }) => { setDate(record.date); setData(normalizeShape(record.data)); })
        .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el registro."))
        .finally(() => setLoading(false));
      return;
    }

    apiFetch<{ records: Array<{ data: JsonValue }> }>("/dashboard/sections/tutoriaFormacion")
      .then(({ records }) => {
        const source = records[0]?.data ?? clone(dashboardDatabase.tutoriaFormacion) as JsonValue;
        setData(emptyValues(normalizeShape(source)));
      })
      .catch((cause) => {
        const source = clone(dashboardDatabase.tutoriaFormacion) as JsonValue;
        setData(emptyValues(normalizeShape(source)));
        setError(cause instanceof Error ? cause.message : "No fue posible preparar el formulario.");
      })
      .finally(() => setLoading(false));
  }, [recordId]);

  useEffect(() => {
    const normalized = normalizeShape(data);
    if (JSON.stringify(normalized) !== JSON.stringify(data)) queueMicrotask(() => setData(normalized));
  }, [data]);

  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;
  if (!object(data)) return null;

  const save = async () => {
    if (!date || saving) return;
    setSaving(true);
    setError("");
    try {
      await apiFetch(recordId ? `/dashboard/sections/tutoriaFormacion/${recordId}` : "/dashboard/sections/tutoriaFormacion", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, tutoriaFormacion: data }) });
      router.push("/administracion/tutoria-formacion");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]"><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push("/administracion/tutoria-formacion")} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Tutoría y Formación</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header><form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>{orderedEntries(data).map(([key, value]) => <section key={key} className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><GraduationCap size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{humanize(key)}</h2><p className="text-[9px] text-[#718799]">{sectionDescriptions[key] ?? "Completa la información correspondiente."}</p></div></div><div className="p-3 sm:p-4"><JsonField root fieldKey={key} label={humanize(key)} value={value} onChange={(updated) => setData({ ...data, [key]: updated })}/></div></section>)}</form><footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push("/administracion/tutoria-formacion")} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer></div></main>;
}
