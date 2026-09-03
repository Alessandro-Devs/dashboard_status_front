"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BarChart3, ChevronDown, ClipboardCheck, Gauge, Layers3, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import { evaluationHiddenDefaults, evaluationTemplate } from "./evaluationTemplate";

type JsonValue = string | number | null | JsonValue[] | { [key: string]: JsonValue };
const sections: Record<string, string> = { pruebas: "Pruebas", detallePorBloque: "Detalle por bloque", nivelesDesempeno: "Niveles de desempeño", distribucionPorBloqueMateriaNiveles: "Distribución por bloque" };
const sectionDescriptions: Record<string, string> = {
  pruebas: "Resumen general de aplicación para CML y Progreso.",
  detallePorBloque: "Desglose de matrícula y centros escolares por bloque.",
  nivelesDesempeno: "Rangos utilizados para clasificar los resultados.",
  distribucionPorBloqueMateriaNiveles: "Resultados de Lengua y Matemática por nivel de desempeño.",
};
sections.resultadosPorMes = "Resultados por mes";
sections.promediosGenerales = "Promedios generales por prueba";
sectionDescriptions.resultadosPorMes = "Resultados mensuales de Matemática y Lengua por nivel de desempeño.";
sectionDescriptions.promediosGenerales = "Promedios generales de Lenguaje y Matemática para CML y Progreso.";
const sectionStyles: Record<string, { accent: string; icon: typeof ClipboardCheck }> = {
  pruebas: { accent: "bg-[#eaf4ff] text-[#176fc8]", icon: ClipboardCheck },
  detallePorBloque: { accent: "bg-[#edf8f3] text-[#25845e]", icon: Layers3 },
  nivelesDesempeno: { accent: "bg-[#fff7e7] text-[#b87616]", icon: Gauge },
  distribucionPorBloqueMateriaNiveles: { accent: "bg-[#f2efff] text-[#7457bd]", icon: BarChart3 },
};
sectionStyles.resultadosPorMes = { accent: "bg-[#edf8f3] text-[#25845e]", icon: BarChart3 };
sectionStyles.promediosGenerales = { accent: "bg-[#eaf8ff] text-[#19749b]", icon: BarChart3 };
const labels: Record<string, string> = { cml: "CML", progreso: "Progreso", fundamentos: "Fundamentos", resumen: "Resumen", matricula: "Matrícula", centrosEscolares: "Centros escolares", titulo: "Título", universo: "Universo", aplicados: "Aplicados", pendientes: "Pendientes", porcentaje: "Porcentaje", promedioLengua: "Promedio de Lenguaje", promedioMatematica: "Promedio de Matemática", materiaSeleccionadaPorDefecto: "Materia seleccionada por defecto", materiasDisponibles: "Materias disponibles", composicionDelUniverso: "Composición del universo", trayectoriaDeResultados: "Trayectoria de resultados", etapas: "Etapas", resumenPorNivel: "Resumen por nivel", lecturaPrincipal: "Lectura principal", descripcionLectura: "Descripción de la lectura", nivelesDeDesempeno: "Niveles de desempeño", distribucionPorcentualDeLosFlujos: "Distribución porcentual de los flujos", porcentajesJulio: "Porcentajes de julio", porcentajesJunio: "Porcentajes de junio", variacionRespectoJunio: "Variación respecto a junio", programados: "Programados", aplicaciones: "Aplicaciones", barrera: "Barrera", etiqueta: "Etiqueta", entrada: "Entrada", incidencias: "Incidencias", lengua: "Lengua", matematica: "Matemática", bloque: "Bloque", materia: "Materia", subgrupo: "Subgrupo", transiciones: "Transiciones", totalCe: "Total CE", valores: "Valores", de: "De", hacia: "Hacia", rango: "Rango", nombre: "Nombre", nivel: "Nivel", estatus: "Estatus", promedio: "Promedio" };
const humanize = (key: string) => {
  const levelField = key.match(/^nivel(\d+)(data|percent)$/);
  if (levelField) return `Nivel ${levelField[1]} · ${levelField[2] === "data" ? "Cantidad" : "Porcentaje"}`;
  return labels[key] ?? key.replace(/_/g, " ").replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());
};
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
const monthOrder = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const monthPosition = (value: string) => { const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); return monthOrder.indexOf(normalized); };
const isObject = (value: JsonValue): value is { [key: string]: JsonValue } => value !== null && typeof value === "object" && !Array.isArray(value);
const hasMonthlyRows = (value: JsonValue | undefined) => value !== undefined && isObject(value) && Object.values(value).some((blocks) => Array.isArray(blocks) && blocks.some((block) => isObject(block) && Object.entries(block).some(([key, fieldValue]) => /^nivel\d+data$/.test(key) && Number(fieldValue) > 0)));
const orderedEntries = (value: { [key: string]: JsonValue }) => Object.entries(value).sort(([left], [right]) => {
  const leftLevel = left.match(/^nivel(\d+)(data|percent)$/);
  const rightLevel = right.match(/^nivel(\d+)(data|percent)$/);
  if (!leftLevel && !rightLevel) return 0;
  if (!leftLevel) return -1;
  if (!rightLevel) return 1;
  const levelDifference = Number(leftLevel[1]) - Number(rightLevel[1]);
  if (levelDifference !== 0) return levelDifference;
  return leftLevel[2] === "data" ? -1 : 1;
});
const distributionEntries = (value: { [key: string]: JsonValue }) => Object.entries(value).sort(([left], [right]) => {
  if (left === "resumen") return -1;
  if (right === "resumen") return 1;
  return 0;
});
const calculateDistributionPercentages = (value: JsonValue): JsonValue => {
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([subject, rows]) => [subject, Array.isArray(rows) ? rows.map((row) => {
    if (!isObject(row)) return row;
    const universe = typeof row.universo === "number" ? row.universo : Number(row.universo) || 0;
    const calculated = { ...row };
    Object.entries(row).forEach(([field, amount]) => {
      const match = field.match(/^nivel(\d+)data$/);
      if (!match) return;
      const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
      calculated[`nivel${match[1]}percent`] = universe > 0 ? Math.round((numericAmount / universe) * 1000) / 10 : 0;
    });
    return calculated;
  }) : rows]));
};
const ensureDistributionAverages = (value: JsonValue): JsonValue => {
  if (!isObject(value)) return value;
  return { resumen: { promedioLengua: 0, promedioMatematica: 0 }, ...value };
};
const calculateMonthlyPercentages = (value: JsonValue): JsonValue => {
  if (!isObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([month, blocks]) => [month, Array.isArray(blocks) ? blocks.map((block) => {
    if (!isObject(block)) return block;
    const universe = typeof block.universo === "number" ? block.universo : Number(block.universo) || 0;
    const calculated: { [key: string]: JsonValue } = { promedioMatematica: 0, promedioLengua: 0, ...block };
    Object.entries(calculated).forEach(([field, amount]) => {
      const match = field.match(/^nivel(\d+)data$/);
      if (!match) return;
      const numericAmount = typeof amount === "number" ? amount : Number(amount) || 0;
      calculated[`nivel${match[1]}percent`] = universe > 0 ? Math.round((numericAmount / universe) * 1000) / 10 : 0;
    });
    return calculated;
  }) : blocks]));
};
const parseAmount = (value: JsonValue) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = value.replace(/[^\d.-]/g, "");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};
const formatCalculatedPending = (source: JsonValue, pending: number): JsonValue => typeof source === "number" ? pending : String(pending);
const emptyCalculatedPending = (source: JsonValue): JsonValue => typeof source === "number" || source === null ? null : "";
const calculateApplicationPercentages = (value: JsonValue): JsonValue => {
  if (Array.isArray(value)) return value.map(calculateApplicationPercentages);
  if (!isObject(value)) return value;

  const calculated = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, calculateApplicationPercentages(child)]));
  if (!("universo" in calculated) || !("aplicados" in calculated) || !("pendientes" in calculated) || !("porcentaje" in calculated)) return calculated;

  const universe = parseAmount(calculated.universo);
  const applied = parseAmount(calculated.aplicados);
  if (universe === null || applied === null || universe <= 0) return { ...calculated, pendientes: emptyCalculatedPending(calculated.pendientes), porcentaje: null };

  const pending = Math.max(universe - applied, 0);
  return {
    ...calculated,
    pendientes: formatCalculatedPending(calculated.pendientes, pending),
    porcentaje: Math.round((applied / universe) * 1000) / 10,
  };
};

function Primitive({ label, value, onChange }: { label: string; value: string | number | null; onChange: (value: JsonValue) => void }) {
  const numeric = typeof value === "number" || value === null;
  const percentage = /porcentaje$/i.test(label.trim());
  const calculated = percentage || /^pendientes$/i.test(label.trim());
  const multiline = !numeric && /descripción|barrera|incidencia/i.test(label);
  const style = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none transition focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
  return <label className="block min-w-0 text-[10px] font-semibold text-[#5d7285]">{label}{multiline ? <textarea rows={2} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={style}/> : <div className="relative"><input type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} readOnly={calculated} value={value ?? ""} placeholder={value === null ? "Sin dato" : undefined} onChange={(e) => onChange(numeric ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)} className={`${style} ${calculated ? "cursor-default bg-[#f3f7fa] text-[#547086]" : ""} ${percentage ? "pr-6" : ""}`}/>{percentage && <span className="pointer-events-none absolute bottom-1.5 right-2 text-[10px] font-medium text-[#8297a8]">%</span>}</div>}</label>;
}

function ArrayEditor({ label, values, onChange, depth, template }: { label: string; values: JsonValue[]; onChange: (value: JsonValue) => void; depth: number; template?: JsonValue }) {
  const itemTemplate = useRef<JsonValue>(template ?? (values[0] === undefined ? "" : clone(values[0])));
  const matrix = values.length > 0 && values.every((v) => Array.isArray(v) && v.every((cell) => typeof cell === "number"));
  if (matrix) return <div className="col-span-full"><p className="mb-1 text-[10px] font-semibold text-[#5d7285]">{label}</p><div className="overflow-x-auto rounded-lg border border-[#dce7ef]"><table className="w-full"><tbody>{values.map((row, ri) => <tr key={ri}>{(row as JsonValue[]).map((cell, ci) => <td key={ci} className="border border-[#e3ebf2] p-0.5"><input aria-label={`${label} ${ri + 1}, ${ci + 1}`} type="number" value={String(cell)} onChange={(e) => { const next = clone(values); (next[ri] as JsonValue[])[ci] = Number(e.target.value); onChange(next); }} className="w-14 rounded px-1.5 py-1 text-center text-[11px] outline-none focus:bg-[#eef7ff]"/></td>)}</tr>)}</tbody></table></div></div>;
  const add = () => onChange([...values, clone(itemTemplate.current)]);
  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#294b68]">{label}</p><p className="text-[9px] text-[#8a9cab]">{values.length} {values.length === 1 ? "registro" : "registros"}</p></div><button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8] shadow-sm transition hover:bg-[#edf7ff]"><Plus size={11}/>Agregar fila</button></div>{values.length === 0 ? <button type="button" onClick={add} className="w-full rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-center text-[10px] font-medium text-[#6f8ca2] transition hover:border-[#79add4] hover:bg-[#f7fbff]">+ Agregar el primer registro</button> : <div className="space-y-2">{values.map((item, index) => <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7 shadow-[0_1px_3px_rgba(27,58,87,.03)]"><span className="absolute left-2.5 top-2 rounded bg-[#eef5fa] px-1.5 py-0.5 text-[9px] font-bold text-[#688196]">Fila {index + 1}</span><button type="button" title="Eliminar fila" aria-label={`Eliminar ${label} ${index + 1}`} onClick={() => onChange(values.filter((_, i) => i !== index))} className="absolute right-1.5 top-1.5 rounded p-1 text-[#c85a5a] transition hover:bg-red-50"><Trash2 size={12}/></button><ValueEditor label={`${label} ${index + 1}`} value={item} onChange={(updated) => onChange(values.map((v, i) => i === index ? updated : v))} depth={isObject(item) ? 0 : depth + 1}/></div>)}</div>}</div>;
}

function getMonthlySeed(value: JsonValue | undefined): JsonValue | undefined {
  if (value === undefined || !isObject(value)) return undefined;
  for (const [subject, rows] of Object.entries(value)) {
    if (!Array.isArray(rows)) continue;
    const row = rows.find((item) => isObject(item));
    if (row === undefined || !isObject(row)) continue;
    return { ...row, materia: subject, subgrupo: "" };
  }
  return undefined;
}

function MonthlyResultsEditor({ value, onChange, template }: { value: JsonValue; onChange: (value: JsonValue) => void; template?: JsonValue }) {
  if (!isObject(value)) return <ValueEditor label="Resultados por mes" value={value} onChange={onChange}/>;
  const existingTemplate = Object.values(value).flatMap((blocks) => Array.isArray(blocks) ? blocks : []).find((block) => isObject(block) && Object.entries(block).some(([key, fieldValue]) => /^nivel\d+(data|percent)$/.test(key) && typeof fieldValue === "number" && fieldValue > 0)) ?? template;
  return <div className="col-span-full space-y-2">
    {Object.entries(value).sort(([left], [right]) => (monthPosition(left) < 0 ? 99 : monthPosition(left)) - (monthPosition(right) < 0 ? 99 : monthPosition(right))).map(([month, blocks], index) => {
      const rows = Array.isArray(blocks) ? blocks : [];
      return <details key={month} open={index === 0} className="group rounded-lg border border-[#d9e5ee] bg-white transition open:shadow-[0_2px_8px_rgba(27,58,87,.04)]">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2.5 text-[11px] font-bold text-[#294b68] transition hover:bg-[#edf5fa]">
          <span>{month}<span className="ml-2 text-[9px] font-medium text-[#8a9cab]">{rows.length} {rows.length === 1 ? "bloque" : "bloques"}</span></span>
          <ChevronDown size={13} className="transition group-open:rotate-180" />
        </summary>
        <div className="border-t border-[#e6edf2] p-3">
          <ArrayEditor label={`Bloques de ${month}`} values={rows} onChange={(updated) => onChange({ ...value, [month]: updated })} depth={1} template={existingTemplate}/>
        </div>
      </details>;
    })}
  </div>;
}

function ValueEditor({ label, value, onChange, depth = 0, prioritizeResumen = false }: { label: string; value: JsonValue; onChange: (value: JsonValue) => void; depth?: number; prioritizeResumen?: boolean }) {
  if (Array.isArray(value)) return <ArrayEditor label={label} values={value} onChange={onChange} depth={depth}/>;
  if (!isObject(value)) return <Primitive label={label} value={value} onChange={onChange}/>;
  const entries = prioritizeResumen && depth === 0 ? distributionEntries(value) : orderedEntries(value);
  const content = <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">{entries.map(([key, child]) => <ValueEditor key={key} label={humanize(key)} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })} depth={depth + 1}/>)}</div>;
  if (depth < 1) return content;
  return <details className="group col-span-full rounded-lg border border-[#d9e5ee] bg-white transition open:shadow-[0_2px_8px_rgba(27,58,87,.04)]"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68] transition hover:bg-[#edf5fa]">{label}<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-3">{Object.keys(value).length ? content : <p className="text-[10px] text-[#8295a5]">Esta sección no contiene campos configurados.</p>}</div></details>;
}

export default function EvaluationFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [data, setData] = useState<JsonValue>(() => clone(evaluationTemplate) as JsonValue);
  const [snapshotDate, setSnapshotDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [loadingRecord, setLoadingRecord] = useState(Boolean(recordId));
  const [hiddenData, setHiddenData] = useState<Record<string, JsonValue>>(() => clone(evaluationHiddenDefaults) as Record<string, JsonValue>);
  useEffect(() => {
    if (!recordId) {
      apiFetch<{ records: Array<{ data?: { evaluacion?: Record<string, JsonValue> } }> }>("/dashboard/snapshots")
        .then(({ records }) => {
          const previous = records.find((record) => hasMonthlyRows(record.data?.evaluacion?.resultadosPorMes));
          const monthlyResults = previous?.data?.evaluacion?.resultadosPorMes;
          if (monthlyResults === undefined) return;
          setData((current) => isObject(current) ? { ...current, resultadosPorMes: calculateMonthlyPercentages(clone(monthlyResults)) } : current);
        })
        .catch(() => undefined);
      return;
    }
    apiFetch<{ record: { date: string; data: { evaluacion: Record<string, JsonValue> } } }>(`/dashboard/snapshots/${recordId}`)
      .then(({ record }) => {
        const evaluation = record.data.evaluacion;
        setSnapshotDate(record.date);
        setData({
          pruebas: evaluation.pruebas ?? clone(evaluationTemplate.pruebas) as JsonValue,
          detallePorBloque: evaluation.detallePorBloque ?? clone(evaluationTemplate.detallePorBloque) as JsonValue,
          nivelesDesempeno: evaluation.nivelesDesempeno ?? clone(evaluationTemplate.nivelesDesempeno) as JsonValue,
          distribucionPorBloqueMateriaNiveles: ensureDistributionAverages(evaluation.distribucionPorBloqueMateriaNiveles ?? clone(evaluationTemplate.distribucionPorBloqueMateriaNiveles) as JsonValue),
          promediosGenerales: evaluation.promediosGenerales ?? clone(evaluationTemplate.promediosGenerales) as JsonValue,
          resultadosPorMes: calculateMonthlyPercentages(evaluation.resultadosPorMes ?? clone(evaluationTemplate.resultadosPorMes) as JsonValue),
        });
        setHiddenData({
          vistaResultados: evaluation.vistaResultados ?? clone(evaluationHiddenDefaults.vistaResultados) as JsonValue,
          sankeysSeparados: evaluation.sankeysSeparados ?? {},
          comparativasPorMateria: evaluation.comparativasPorMateria ?? clone(evaluationHiddenDefaults.comparativasPorMateria) as JsonValue,
          seguimientoAplicacionCml: evaluation.seguimientoAplicacionCml ?? clone(evaluationHiddenDefaults.seguimientoAplicacionCml) as JsonValue,
          actualizacionPortalResultados: evaluation.actualizacionPortalResultados ?? clone(evaluationHiddenDefaults.actualizacionPortalResultados) as JsonValue,
        });
      })
      .catch((cause) => setSaveError(cause instanceof Error ? cause.message : "No fue posible cargar el registro."))
      .finally(() => setLoadingRecord(false));
  }, [recordId]);
  if (!isObject(data)) return null;
  const updateSection = (key: string, updated: JsonValue) => {
    if (key === "pruebas" || key === "detallePorBloque") {
      setData({ ...data, [key]: calculateApplicationPercentages(updated) });
      return;
    }
    if (key === "resultadosPorMes") {
      setData({ ...data, [key]: calculateMonthlyPercentages(updated) });
      return;
    }
    if (key === "distribucionPorBloqueMateriaNiveles") {
      setData({ ...data, [key]: calculateDistributionPercentages(updated) });
      return;
    }
    if (key !== "nivelesDesempeno" || !Array.isArray(updated)) {
      setData({ ...data, [key]: updated });
      return;
    }

    const previousLevels = Array.isArray(data.nivelesDesempeno) ? data.nivelesDesempeno : [];
    const previousIds = previousLevels.flatMap((item) => isObject(item) && typeof item.nivel === "number" ? [item.nivel] : []);
    const used = new Set<number>();
    let nextId = Math.max(0, ...previousIds) + 1;
    const normalizedLevels = updated.map((item) => {
      if (!isObject(item)) return item;
      let id = typeof item.nivel === "number" ? item.nivel : nextId++;
      if (used.has(id)) id = nextId++;
      used.add(id);
      return { ...item, nivel: id };
    });
    const currentIds = normalizedLevels.flatMap((item) => isObject(item) && typeof item.nivel === "number" ? [item.nivel] : []);
    const removedIds = previousIds.filter((id) => !currentIds.includes(id));
    const addedIds = currentIds.filter((id) => !previousIds.includes(id));
    const distribution = isObject(data.distribucionPorBloqueMateriaNiveles) ? data.distribucionPorBloqueMateriaNiveles : {};
    const syncedDistribution = Object.fromEntries(Object.entries(distribution).map(([subject, rows]) => [subject, Array.isArray(rows) ? rows.map((row) => {
      if (!isObject(row)) return row;
      const synced = { ...row };
      removedIds.forEach((id) => { delete synced[`nivel${id}data`]; delete synced[`nivel${id}percent`]; });
      addedIds.forEach((id) => { synced[`nivel${id}data`] = 0; synced[`nivel${id}percent`] = 0; });
      return synced;
    }) : rows]));
    setData({ ...data, nivelesDesempeno: normalizedLevels, distribucionPorBloqueMateriaNiveles: calculateDistributionPercentages(syncedDistribution) });
  };
  const saveEvaluation = async () => {
    if (!snapshotDate || saving) return;
    setSaving(true);
    setSaveError("");
    try {
      const evaluacion = {
        pruebas: data.pruebas,
        vistaResultados: hiddenData.vistaResultados,
        detallePorBloque: data.detallePorBloque,
        nivelesDesempeno: data.nivelesDesempeno,
        resultadosPorMes: data.resultadosPorMes,
        sankeysSeparados: hiddenData.sankeysSeparados,
        comparativasPorMateria: data.comparativasPorMateria ?? hiddenData.comparativasPorMateria,
        promediosGenerales: data.promediosGenerales,
        seguimientoAplicacionCml: hiddenData.seguimientoAplicacionCml,
        actualizacionPortalResultados: hiddenData.actualizacionPortalResultados,
        distribucionPorBloqueMateriaNiveles: data.distribucionPorBloqueMateriaNiveles,
      };
      await apiFetch(recordId ? `/dashboard/snapshots/${recordId}` : "/dashboard/snapshots", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: snapshotDate }, evaluacion }) });
      router.push("/administracion/evaluacion");
    } catch (cause) {
      setSaveError(cause instanceof Error ? cause.message : "No fue posible guardar el registro.");
    } finally {
      setSaving(false);
    }
  };
  if (loadingRecord) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;
  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]">
    <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-[0_2px_8px_rgba(27,58,87,.05)] backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push('/administracion/evaluacion')} aria-label="Volver a Evaluación" className="rounded-md p-1.5 text-[#61788c] transition hover:bg-[#edf4f9]"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Evaluación</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]"><span>Fecha</span><input type="date" required value={snapshotDate} onChange={(event) => setSnapshotDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] bg-white px-2.5 text-[11px] font-medium text-[#294b68] outline-none transition focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]"/></label></header>
    <form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>{Object.entries(data).map(([key, value]) => { const config = sectionStyles[key]; const Icon = config.icon; return <section key={key} className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-[0_2px_8px_rgba(27,58,87,.03)]"><div className="flex items-center gap-3 border-b border-[#e4ecf2] px-3 py-2.5 sm:px-4"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.accent}`}><Icon size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{sections[key]}</h2><p className="text-[9px] leading-4 text-[#718799]">{sectionDescriptions[key]}</p></div></div><div className="p-3 sm:p-4">{key === "resultadosPorMes" ? <MonthlyResultsEditor value={value} template={getMonthlySeed(data.distribucionPorBloqueMateriaNiveles)} onChange={(updated) => updateSection(key, updated)}/> : <ValueEditor label={sections[key]} value={value} onChange={(updated) => updateSection(key, updated)} prioritizeResumen={key === "distribucionPorBloqueMateriaNiveles"}/>}</div></section>; })}</form>
    <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5 sm:px-5"><div><button type="button" onClick={() => { setData(clone(evaluationTemplate) as JsonValue); setSnapshotDate(""); setSaveError(""); }} className="text-[10px] font-semibold text-[#60798e] hover:text-[#176fc8]">Restablecer formulario</button>{saveError && <p className="mt-1 text-[10px] font-medium text-red-600">{saveError}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push('/administracion/evaluacion')} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={saveEvaluation} disabled={!snapshotDate || saving} title={!snapshotDate ? "Selecciona una fecha" : undefined} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-[#1262b2] disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer>
  </div></main>;
}
