"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Plus, School, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { apiFetch } from "@/services/api";
import LucideIconPicker from "./LucideIconPicker";

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
const reorder = (value: { [key: string]: JsonValue }, order: string[]) => Object.fromEntries([
  ...order.filter((key) => key in value).map((key) => [key, value[key]] as const),
  ...Object.entries(value).filter(([key]) => !order.includes(key)),
]);
const percentageFrom = (value: JsonValue, universe: JsonValue) => {
  const current = Number(value);
  const total = Number(universe);
  return Number.isFinite(current) && Number.isFinite(total) && total > 0 ? Number(((current / total) * 100).toFixed(2)) : "";
};
const fixedCriticalMotives = [
  "Actividad institucional",
  "Asignacion incorrecta",
  "Cuenta de emergencia",
  "Cuenta DEMO",
  "Incapacidad o permiso personal",
  "No corresponde horario",
  "No responde",
  "Problema de equipo",
  "Problema de internet",
  "Problema de plataforma",
  "Problemas de energia",
  "Sin Contactar",
  "Sin justificar",
];
const normalizeCriticalMotives = (value: JsonValue): JsonValue[] => {
  const records = Array.isArray(value) ? value : [];
  return fixedCriticalMotives.map((motivo, index) => {
    const record = object(records[index]) ? records[index] : {};
    return { motivo, datoReal: record.datoReal ?? "", porcentaje: record.porcentaje ?? "" };
  });
};
const normalizeTeacherHistory = (value: JsonValue): JsonValue => {
  const history = object(value) ? value : {};
  const universe = history.universoDocentes ?? "";
  const records = Array.isArray(history.registros) ? history.registros : Array.isArray(value) ? value : [];
  return { universoDocentes: universe, registros: records.map((item) => object(item) ? { ...item, porcentaje: percentageFrom(item.valor ?? "", universe) } : item) };
};
const campaignTemplate = { nombre: "", fecha: "", tipoRespuesta: "", mensajesNoEnviados: "", mensajesEnviados: "", mensajesEntregados: "", leidos: "", respuestasRecibidas: "" };
const normalizeCampaignList = (value: JsonValue): JsonValue[] => Array.isArray(value) ? value.map((item) => object(item) ? { ...campaignTemplate, ...item } : { ...campaignTemplate }) : [];
const normalizeCampaigns = (value: JsonValue): JsonValue => {
  if (object(value)) return { directores: normalizeCampaignList(value.directores ?? []), docentes: normalizeCampaignList(value.docentes ?? []) };
  if (Array.isArray(value)) return { directores: normalizeCampaignList(value), docentes: normalizeCampaignList(value.map((item) => clone(item))) };
  return { directores: [], docentes: [] };
};
const ensureSchoolManagementFormSections = (value: JsonValue): JsonValue => {
  if (!object(value)) return value;
  const noAccess = object(value.noAccesos) ? value.noAccesos : {};
  const operational = object(value.gestionOperativa) ? value.gestionOperativa : {};
  return {
    ...value,
    noAccesos: { ...noAccess, historialDocentes: noAccess.historialDocentes ?? { universoDocentes: "", registros: [] } },
    noAccesosSemanal: value.noAccesosSemanal ?? { docentesSinAcceso: "", numeroDeClases: "" },
    motivosCriticos: value.motivosCriticos ?? [],
    gestionOperativa: { ...operational, campanasNerds: operational.campanasNerds ?? { directores: [], docentes: [] } },
  };
};
const sanitizeSchoolManagement = (value: JsonValue): JsonValue => {
  if (!object(value)) return value;
  const { kpis: _kpis, ...withoutIndicators } = value;
  const {
    actividades: _activities,
    centrosProyecto: _projectSchools,
    asistenciaTarjetas: _attendanceCards,
    asistenciaDiaria: _dailyAttendance,
    observacionesPorBloque: _blockObservations,
    ...allowedSections
  } = withoutIndicators;
  let sanitized = allowedSections;
  if ("motivosCriticos" in allowedSections) sanitized = { ...sanitized, motivosCriticos: normalizeCriticalMotives(allowedSections.motivosCriticos) };
  if (object(allowedSections.noAccesos)) {
    const { resumen: _summary, ...withoutSummary } = allowedSections.noAccesos;
    sanitized = { ...sanitized, noAccesos: reorder({ ...withoutSummary, historialDocentes: normalizeTeacherHistory(withoutSummary.historialDocentes ?? []) }, ["historialDocentes", "historialClases", "evolucion", "acciones", "limitaciones"]) };
  }
  if (object(sanitized.gestionOperativa)) {
    const operational = { ...sanitized.gestionOperativa };
    if ("campanasNerds" in operational) operational.campanasNerds = normalizeCampaigns(operational.campanasNerds ?? []);
    if (object(operational.observaciones)) {
      const observations = { ...operational.observaciones };
      if (object(observations.resumen)) {
        observations.resumen = reorder({
          porcentajeDirectoresActivos: "",
          porcentajeObservacionesRealizadas: "",
          porcentajeRetroalimentacionesRealizadas: "",
          ...observations.resumen,
        }, ["directoresActivos", "porcentajeDirectoresActivos", "observacionesRealizadas", "porcentajeObservacionesRealizadas", "retroalimentacionesRealizadas", "porcentajeRetroalimentacionesRealizadas"]);
      }
      if (Array.isArray(observations.bloques)) {
        observations.bloques = observations.bloques.map((item) => object(item) ? reorder(item, ["block", "activeDirectors", "activeDirectorsPercentage", "observations", "observationsTarget", "observationsPercentage", "feedback", "feedbackTarget", "feedbackPercentage"]) : item);
      }
      operational.observaciones = reorder(observations, ["resumen", "bloques"]);
    }
    if (object(operational.formacion)) {
      const training = { ...operational.formacion };
      if (Array.isArray(training.grupos)) {
        training.grupos = training.grupos.map((item) => object(item) ? reorder(item, ["name", "total", "realizados", "percentage"]) : item);
      }
      operational.formacion = training;
    }
    sanitized = { ...sanitized, gestionOperativa: reorder(operational, ["observaciones", "formacion"]) };
  }
  return reorder(sanitized, ["noAccesos", "noAccesosSemanal", "motivosCriticos", "gestionOperativa"]);
};
const labels: Record<string, string> = { kpis: "Indicadores", noAccesos: "No accesos", actividades: "Actividades", centrosProyecto: "Centros del proyecto", asistenciaDiaria: "Asistencia diaria", gestionOperativa: "Gestión operativa", asistenciaTarjetas: "Tarjetas de asistencia", observacionesPorBloque: "Observaciones por bloque", resumen: "Resumen", evolucion: "Evolución de no accesos", acciones: "Acciones", limitaciones: "Limitaciones", historialClases: "NÚMERO DE CLASES DIARIO", historialDocentes: "DOCENTES NO ACCESOS DIARIOS", formacion: "Formación", horariosG12: "Horarios G1 y G2", horariosG345: "Horarios G3, G4 y G5", accionesHorarios: "Acciones de horarios", accionesNoAccesos: "Acciones de no accesos", accionesObservacion: "Acciones de observación", observacion: "Observación", participantes: "Participantes", secciones: "Secciones", grupos: "Grupos", observaciones: "Observaciones", bloques: "Bloques", block: "Bloque", feedback: "Retroalimentaciones", observations: "Observaciones realizadas", feedbackTarget: "Meta de retroalimentaciones", activeDirectors: "Directores activos", feedbackPercentage: "Porcentaje de retroalimentaciones", observationsTarget: "Meta de observaciones", observationsPercentage: "Porcentaje de observaciones", activeDirectorsPercentage: "Porcentaje de directores activos", directoresActivos: "Directores activos", porcentajeDirectoresActivos: "Porcentaje Directores activos", observacionesRealizadas: "Observaciones realizadas", porcentajeObservacionesRealizadas: "Porcentaje Observaciones realizadas", retroalimentacionesRealizadas: "Retroalimentaciones realizadas", porcentajeRetroalimentacionesRealizadas: "Porcentaje Retroalimentaciones realizadas", centrosEscolares: "Centros escolares", porcentaje: "Porcentaje", percentage: "Porcentaje", descripcion: "Descripción", description: "Descripción", title: "Título", name: "Nombre", label: "Etiqueta", value: "Valor", fecha: "Fecha", day: "Día", total: "Total", realizados: "Realizados" };
const customLabels: Record<string, string> = { campanasNerds: "Campañas", noAccesosSemanal: "No accesos semanal", motivosCriticos: "Motivos", directores: "Directores", docentes: "Docentes", nombre: "Nombre", motivo: "Motivo", tipoRespuesta: "Tipo de respuesta", mensajesNoEnviados: "Mensajes no enviados", mensajesEnviados: "Mensajes enviados", mensajesEntregados: "Mensajes entregados", leidos: "Leídos", respuestasRecibidas: "Respuestas recibidas", datoReal: "Dato real" };
const humanize = (key: string) => key === "realizados" ? "Participantes" : labels[key] ?? customLabels[key] ?? key.replace(/_/g, " ").replace(/([a-z])([A-Z0-9])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
const numericFieldLabels = ["Total", "Valor", "Porcentaje", "Porcentaje Directores activos", "Porcentaje Observaciones realizadas", "Porcentaje Retroalimentaciones realizadas", "Dato real", "Tipo de respuesta", "Participantes", "Secciones", "Grupos", "Bloques", "Mensajes no enviados", "Mensajes enviados", "Mensajes entregados", "Leídos", "Respuestas recibidas", "Meta de retroalimentaciones", "Meta de observaciones", "Directores activos", "Observaciones realizadas", "Retroalimentaciones realizadas", "Centros escolares"];
const customPlaceholders: Record<string, string> = { Nombre: "Campaña Nerds 1", "Tipo de respuesta": "1", "Mensajes no enviados": "12", "Mensajes enviados": "148", "Mensajes entregados": "136", Leídos: "119", "Respuestas recibidas": "94", Motivo: "Actividad institucional", Porcentaje: "34", "Dato real": "340" };
const schoolManagementPlaceholders: Record<string, JsonValue> = { campanasNerds: { directores: [{ nombre: "Campaña Nerds 1", fecha: "2026-08-19", tipoRespuesta: 1, mensajesNoEnviados: 12, mensajesEnviados: 148, mensajesEntregados: 136, leidos: 119, respuestasRecibidas: 94 }, { nombre: "Campaña Nerds 2", fecha: "2026-08-20", tipoRespuesta: 2, mensajesNoEnviados: 8, mensajesEnviados: 172, mensajesEntregados: 164, leidos: 141, respuestasRecibidas: 108 }, { nombre: "Campaña Nerds 3", fecha: "2026-08-21", tipoRespuesta: 1, mensajesNoEnviados: 5, mensajesEnviados: 196, mensajesEntregados: 191, leidos: 166, respuestasRecibidas: 132 }], docentes: [{ nombre: "Campaña Nerds 1", fecha: "2026-08-19", tipoRespuesta: 1, mensajesNoEnviados: 9, mensajesEnviados: 132, mensajesEntregados: 124, leidos: 105, respuestasRecibidas: 82 }, { nombre: "Campaña Nerds 2", fecha: "2026-08-20", tipoRespuesta: 2, mensajesNoEnviados: 6, mensajesEnviados: 158, mensajesEntregados: 151, leidos: 128, respuestasRecibidas: 97 }, { nombre: "Campaña Nerds 3", fecha: "2026-08-21", tipoRespuesta: 1, mensajesNoEnviados: 4, mensajesEnviados: 181, mensajesEntregados: 175, leidos: 149, respuestasRecibidas: 116 }] }, noAccesosSemanal: { docentesSinAcceso: 0, numeroDeClases: 0 }, motivosCriticos: [{ motivo: "Actividad institucional", porcentaje: 34, datoReal: 340 }, { motivo: "Asignación incorrecta", porcentaje: 27, datoReal: 270 }, { motivo: "Cuenta de emergencia", porcentaje: 19, datoReal: 190 }, { motivo: "Cuenta DEMO", porcentaje: 12, datoReal: 120 }, { motivo: "Incapacidad o permiso personal", porcentaje: 8, datoReal: 80 }] };
const examplePlaceholder = (label: string, numeric: boolean) => {
  if (customPlaceholders[label]) return `Ej. ${customPlaceholders[label]}`;
  if (numeric) return `Ej. ${label.includes("Porcentaje") || label.includes("Meta") ? "85" : "100"}`;
  const examples: Record<string, string> = { Nombre: "G1", Grupo: "G1", Bloque: "Bloque 1", Título: "Seguimiento semanal", Descripción: "Describe la actividad o situación.", Observación: "Se realizó seguimiento al centro escolar.", Acción: "Realizar llamada de monitoreo." };
  return `Ej. ${examples[label] ?? humanize(label)}`;
};
const monthNumbers: Record<string, string> = { enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05", junio: "06", julio: "07", agosto: "08", septiembre: "09", octubre: "10", noviembre: "11", diciembre: "12" };
const calendarValue = (value: string) => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const match = normalized.match(/(?:\p{L}+,\s*)?(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/u);
  return match && monthNumbers[match[2]] ? `${match[3]}-${monthNumbers[match[2]]}-${match[1].padStart(2, "0")}` : "";
};
const longSpanishDate = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const formatted = new Intl.DateTimeFormat("es-SV", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(year, month - 1, day));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

function Primitive({ label, value, onChange, placeholder }: { label: string; value: string | number | boolean | null; onChange: (value: JsonValue) => void; placeholder?: string }) {
  const numeric = typeof value === "number" || value === null || numericFieldLabels.includes(label);
  const multiline = typeof value === "string" && /descripción|observación|limitación|acción/i.test(label);
  const style = "mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
  if (typeof value === "boolean") return <label className="flex items-center gap-2 text-[10px] font-semibold text-[#5d7285]"><input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)}/>{label}</label>;
  if (label === "Icon" && typeof value === "string") return <LucideIconPicker value={value} onChange={onChange}/>;
  if (label === "Fecha" && typeof value === "string") return <label className="block text-[10px] font-semibold text-[#5d7285]">Fecha<input type="date" className={style} value={value} onChange={(event) => onChange(event.target.value)}/></label>;
  if (label === "Día" && typeof value === "string") return <label className="block text-[10px] font-semibold text-[#5d7285]">Día<input type="date" className={style} value={calendarValue(value)} onChange={(event) => onChange(longSpanishDate(event.target.value))}/>{value && <span className="mt-1 block rounded bg-[#f3f7fa] px-2 py-1 text-[9px] font-medium text-[#6b8194]">Se guardará como: {value}</span>}</label>;
  return <label className="block text-[10px] font-semibold text-[#5d7285]">{label}{multiline ? <textarea rows={2} className={style} value={value} placeholder={placeholder ?? examplePlaceholder(label, false)} onChange={(event) => onChange(event.target.value)}/> : <input className={style} type={numeric ? "number" : "text"} step={numeric ? "any" : undefined} value={value ?? ""} placeholder={placeholder ?? examplePlaceholder(label, numeric)} readOnly={label === "Motivo"} onChange={(event) => onChange(numeric ? event.target.value === "" ? null : Number(event.target.value) : event.target.value)}/>}</label>;
}

function ArrayField({ label, value, onChange, fixedLength = false, columns = false }: { label: string; value: JsonValue[]; onChange: (value: JsonValue[]) => void; fixedLength?: boolean; columns?: boolean }) {
  const template = useRef<JsonValue>(value[0] === undefined ? "" : clone(value[0]));
  const add = () => onChange([...value, clone(template.current)]);
  const itemLabel = ["Ihfb", "Kira"].includes(label) ? "Día" : label === "Bloques" ? "Tarjeta" : fixedLength ? "Registro" : "Fila";
  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-2 flex items-center justify-between"><div><p className="text-[11px] font-bold text-[#294b68]">{label}</p><p className="text-[9px] text-[#8a9cab]">{value.length} registros{fixedLength ? " · estructura fija" : ""}</p></div>{!fixedLength && <button type="button" onClick={add} className="inline-flex items-center gap-1 rounded-md border border-[#bfd8eb] bg-white px-2 py-1 text-[10px] font-semibold text-[#176fc8]"><Plus size={11}/>Agregar fila</button>}</div>{value.length === 0 ? fixedLength ? <p className="rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-center text-[10px] text-[#6f8ca2]">No hay días configurados.</p> : <button type="button" onClick={add} className="w-full rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-[10px] text-[#6f8ca2]">+ Agregar el primer registro</button> : <div className={columns ? "grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3" : "space-y-2"}>{value.map((item, index) => <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7"><span className="absolute left-2.5 top-2 text-[9px] font-bold text-[#688196]">{itemLabel} {index + 1}</span>{!fixedLength && <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-1.5 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar fila ${index + 1}`}><Trash2 size={12}/></button>}<JsonField label={`${label} ${index + 1}`} value={item} onChange={(updated) => onChange(value.map((current, itemIndex) => itemIndex === index ? updated : current))} root={object(item)}/></div>)}</div>}</div>;
}

function TeacherHistoryField({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const history = normalizeTeacherHistory(value);
  if (!object(history)) return null;
  const universe = typeof history.universoDocentes === "string" || typeof history.universoDocentes === "number" ? history.universoDocentes : "";
  const records = Array.isArray(history.registros) ? history.registros : [];
  const updateHistory = (nextRecords: JsonValue[], nextUniverse = universe) => onChange({ universoDocentes: nextUniverse, registros: nextRecords.map((item) => object(item) ? { ...item, porcentaje: percentageFrom(item.valor ?? "", nextUniverse) } : item) });
  return <div className="col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><div className="mb-3"><p className="text-[11px] font-bold text-[#294b68]">DOCENTES NO ACCESOS DIARIOS</p><p className="text-[9px] text-[#8a9cab]">Ingresa el universo y los datos de cada día.</p></div><div className="mb-3 max-w-[280px]"><label className="block text-[10px] font-semibold text-[#5d7285]">Universo de docentes<input className="mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]" type="number" min="0" step="1" value={universe ?? ""} placeholder="Ej. 100" onChange={(event) => { const nextUniverse = event.target.value === "" ? "" : Number(event.target.value); updateHistory(records, nextUniverse); }}/></label></div><div className="space-y-2">{records.map((item, index) => { const record = object(item) ? item : {}; const porcentaje = percentageFrom(record.valor ?? "", universe); return <div key={index} className="relative rounded-lg border border-[#dce7ef] bg-white p-2.5 pt-7"><span className="absolute left-2.5 top-2 text-[9px] font-bold text-[#688196]">Día {index + 1}</span><button type="button" onClick={() => updateHistory(records.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-2 top-1.5 rounded p-1 text-[#c85a5a] hover:bg-red-50" aria-label={`Eliminar día ${index + 1}`}><Trash2 size={12}/></button><div className="grid grid-cols-1 gap-2 sm:grid-cols-3"><Primitive label="Fecha" value={typeof record.fecha === "string" ? record.fecha : ""} onChange={(next) => updateHistory(records.map((current, itemIndex) => itemIndex === index ? { ...record, fecha: next } : current))}/><Primitive label="Valor" value={record.valor as string | number | null ?? ""} onChange={(next) => updateHistory(records.map((current, itemIndex) => itemIndex === index ? { ...record, valor: next } : current))}/><label className="block text-[10px] font-semibold text-[#5d7285]">Porcentaje<input className="mt-0.5 w-full rounded-md border border-[#d8e4ee] bg-[#f3f7fa] px-2 py-1.5 text-[11px] text-[#243f57]" type="text" readOnly value={porcentaje === "" ? "" : `${porcentaje}%`}/></label></div></div>; })}</div>{records.length === 0 && <p className="rounded-md border border-dashed border-[#bcd3e4] bg-white py-4 text-center text-[10px] text-[#6f8ca2]">No hay días configurados.</p>}</div>;
}

function CampaignsField({ value, onChange }: { value: JsonValue; onChange: (value: JsonValue) => void }) {
  const campaigns = normalizeCampaigns(value);
  if (!object(campaigns)) return null;
  const update = (group: "directores" | "docentes", records: JsonValue[]) => onChange({ ...campaigns, [group]: records });
  return <details className="group col-span-full rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-2.5"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68]">Campañas<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-2"><p className="mb-3 text-[9px] text-[#8a9cab]">Registra las campañas para cada grupo.</p><div className="grid grid-cols-1 gap-3"><details className="w-full rounded-lg border border-[#dce7ef] bg-white"><summary className="cursor-pointer list-none px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#526b80]">Directores</summary><div className="border-t border-[#e6edf2] p-2"><ArrayField label="Directores" value={Array.isArray(campaigns.directores) ? campaigns.directores : []} onChange={(updated) => update("directores", updated)}/></div></details><details className="w-full rounded-lg border border-[#dce7ef] bg-white"><summary className="cursor-pointer list-none px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-[#526b80]">Docentes</summary><div className="border-t border-[#e6edf2] p-2"><ArrayField label="Docentes" value={Array.isArray(campaigns.docentes) ? campaigns.docentes : []} onChange={(updated) => update("docentes", updated)}/></div></details></div></div></details>;
}

function JsonField({ label, value, onChange, root = false, fixedLength = false, placeholder }: { label: string; value: JsonValue; onChange: (value: JsonValue) => void; root?: boolean; fixedLength?: boolean; placeholder?: string }) {
  if (Array.isArray(value)) {
    const arrayField = <ArrayField label={label} value={value} onChange={onChange} fixedLength={fixedLength}/>;
    if (label !== "Campañas Nerds") return arrayField;
    return <details className="group col-span-full rounded-lg border border-[#d9e5ee] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68] hover:bg-[#edf5fa]">{label}<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-3">{arrayField}</div></details>;
  }
  if (!object(value)) return <Primitive label={label} value={value} onChange={onChange} placeholder={placeholder}/>;
  const field = ([key, child]: [string, JsonValue]) => key === "historialDocentes" ? <TeacherHistoryField key={key} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })}/> : key === "campanasNerds" ? <CampaignsField key={key} value={child} onChange={(updated) => onChange({ ...value, [key]: updated })}/> : <JsonField key={key} label={humanize(key)} value={child} placeholder={label.startsWith("Grupos") && key === "name" ? "Ej. Grupo 1" : undefined} fixedLength={fixedLength || ["evolucion", "historialDocentes", "historialClases", "acciones", "limitaciones", "motivosCriticos"].includes(key)} onChange={(updated) => onChange({ ...value, [key]: updated })}/>;
  const fields = label === "Formación" ? <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2"><div className="col-span-full rounded-lg border border-[#d9e5ee] bg-white shadow-[0_2px_8px_rgba(27,58,87,.04)]"><div className="rounded-t-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68]">Resumen</div><div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2 border-t border-[#e6edf2] p-3">{["secciones", "participantes"].filter((key) => key in value).map((key) => field([key, value[key]]))}</div></div>{Object.entries(value).filter(([key]) => !["secciones", "participantes"].includes(key)).map(field)}</div> : <div className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-2">{Object.entries(value).map(field)}</div>;
  if (root) return fields;
  if (label === "Resumen") return <div className="col-span-full rounded-lg border border-[#d9e5ee] bg-white shadow-[0_2px_8px_rgba(27,58,87,.04)]"><div className="rounded-t-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68]">Resumen</div><div className="border-t border-[#e6edf2] p-3">{fields}</div></div>;
  return <details className="group col-span-full rounded-lg border border-[#d9e5ee] bg-white"><summary className="flex cursor-pointer list-none items-center justify-between rounded-lg bg-[#f5f9fc] px-3 py-2 text-[11px] font-bold text-[#294b68] hover:bg-[#edf5fa]">{label}<ChevronDown size={13} className="transition group-open:rotate-180"/></summary><div className="border-t border-[#e6edf2] p-3">{fields}</div></details>;
}

export default function SchoolManagementFormPage({ recordId }: { recordId?: number }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [data, setData] = useState<JsonValue>(() => recordId ? sanitizeSchoolManagement(clone(dashboardDatabase.gestionEscolar) as JsonValue) : sanitizeSchoolManagement(emptyValues(clone(dashboardDatabase.gestionEscolar) as JsonValue)));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (recordId) {
      apiFetch<{ record: { date: string; data: JsonValue } }>(`/dashboard/sections/gestionEscolar/${recordId}`).then(({ record }) => { setDate(record.date); setData(sanitizeSchoolManagement(ensureSchoolManagementFormSections(record.data))); }).catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar el registro.")).finally(() => setLoading(false));
      return;
    }
    apiFetch<{ records: Array<{ date: string; data: JsonValue }> }>("/dashboard/sections/gestionEscolar")
      .then(({ records }) => {
        const reference = records.find((record) => record.date === "2026-08-20")?.data;
        const placeholderSections = clone(schoolManagementPlaceholders) as { [key: string]: JsonValue };
        const { campanasNerds, ...otherPlaceholders } = placeholderSections;
        const currentSchoolData = clone(dashboardDatabase.gestionEscolar) as { [key: string]: JsonValue };
        const currentOperational = object(currentSchoolData.gestionOperativa) ? currentSchoolData.gestionOperativa : {};
        const defaults = { ...currentSchoolData, ...otherPlaceholders, gestionOperativa: { ...currentOperational, campanasNerds } };
        const referenceValue: JsonValue = reference ?? null;
        const referenceData = object(referenceValue) ? referenceValue : {};
        const referenceOperational = object(referenceData.gestionOperativa) ? referenceData.gestionOperativa : {};
        const source: JsonValue = Object.keys(referenceData).length > 0 ? { ...defaults, ...referenceData, gestionOperativa: { ...defaults.gestionOperativa, ...referenceOperational } } : defaults;
        setData(sanitizeSchoolManagement(emptyValues(source)));
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible preparar el formulario."))
      .finally(() => setLoading(false));
  }, [recordId]);
  if (loading) return <main className="min-h-screen bg-[#f3f7fb] p-8 text-center text-xs text-[#61788c]">Cargando registro...</main>;
  if (!object(data)) return null;
  const save = async () => { if (!date || saving) return; setSaving(true); setError(""); try { await apiFetch(recordId ? `/dashboard/sections/gestionEscolar/${recordId}` : "/dashboard/sections/gestionEscolar", { method: recordId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ metadata: { fechaCorte: date }, gestionEscolar: data }) }); router.push("/administracion/gestion-escolar"); } catch (cause) { setError(cause instanceof Error ? cause.message : "No fue posible guardar el registro."); } finally { setSaving(false); } };
  return <main className="min-h-screen bg-[#f3f7fb] p-3 sm:p-4 lg:p-5"><div className="mx-auto max-w-[1180px] overflow-clip rounded-xl border border-[#dce6ee] bg-[#f4f8fb] shadow-[0_6px_18px_rgba(27,58,87,.05)]"><header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-[#dce6ee] bg-white/95 px-4 py-2.5 shadow-sm backdrop-blur sm:px-5"><div className="flex items-center gap-2.5"><button type="button" onClick={() => router.push('/administracion/gestion-escolar')} className="rounded-md p-1.5 text-[#61788c] hover:bg-[#edf4f9]" aria-label="Volver"><ArrowLeft size={16}/></button><div><p className="text-[9px] font-semibold uppercase tracking-[.12em] text-[#6f8799]">{recordId ? "Editar registro" : "Nuevo registro"}</p><h1 className="text-sm font-semibold text-[#17324a]">Información de Gestión Escolar</h1></div></div><label className="flex items-center gap-2 text-[10px] font-semibold text-[#61788c]">Fecha<input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="h-8 rounded-md border border-[#d5e2eb] px-2.5 text-[11px] text-[#294b68] outline-none focus:border-[#5d9ed8]"/></label></header><form className="space-y-3 p-3 sm:p-4" onSubmit={(event) => event.preventDefault()}>{Object.entries(data).map(([key, value]) => <section key={key} className="overflow-hidden rounded-xl border border-[#dce6ee] bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-[#e4ecf2] px-4 py-2.5"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eaf4ff] text-[#176fc8]"><School size={15}/></span><div><h2 className="text-[13px] font-bold text-[#17324a]">{humanize(key)}</h2><p className="text-[9px] text-[#718799]">Completa la información correspondiente.</p></div></div><div className="p-3 sm:p-4"><JsonField root label={humanize(key)} value={value} onChange={(updated) => setData({ ...data, [key]: updated })}/></div></section>)}</form><footer className="flex items-center justify-between gap-2 border-t border-[#dce6ee] bg-white px-4 py-2.5"><div>{error && <p className="text-[10px] font-medium text-red-600">{error}</p>}</div><div className="flex gap-1.5"><button type="button" onClick={() => router.push('/administracion/gestion-escolar')} className="rounded-md border border-[#ccdbe6] px-3 py-1.5 text-[11px] font-semibold text-[#526b80]">Cancelar</button><button type="button" onClick={save} disabled={!date || saving} className="rounded-md bg-[#176fc8] px-3.5 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50">{saving ? "Guardando..." : "Guardar registro"}</button></div></footer></div></main>;
}
