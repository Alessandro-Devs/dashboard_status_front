"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/stores/DashboardDataContext";
import CustomHtmlRenderer from "./CustomHtmlRenderer";
import { getCriticalFindings, getCustomHtml, hasRenderableCustomHtml, type Finding } from "./qualityData";

export default function FindingsDetailsPage() {
  const router = useRouter();
  // Se suscribe a la carga de datos: al llegar la fecha seleccionada, la página vuelve a renderizar con sus datos.
  const { isLoading, snapshotDate } = useDashboardData();
  const findings = getCriticalFindings();
  const customHtml = hasRenderableCustomHtml() ? getCustomHtml() : "";

  return <main className="min-h-screen bg-[#f4f7fb] px-4 py-5 text-[#223b53] sm:px-6"><div className="mx-auto max-w-[1080px]"><div className="flex items-start justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#71869a]">Gestión de Calidad</p><h1 className="mt-1 text-[18px] font-semibold tracking-[.04em] text-[#27435c]">DETALLE DE HALLAZGOS</h1><p className="mt-1 text-[10px] text-[#8da0b4]">Consulta completa de los hallazgos para la mejora en la implementación.</p></div><button type="button" onClick={() => router.push("/#gestion-calidad")} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#d8e0e8] bg-white px-3 py-2 text-[10px] text-[#667b90] transition hover:bg-[#f8fafc]" aria-label="Volver a Gestión de Calidad"><ArrowLeft size={14}/>Volver</button></div>{isLoading ? <div className="mt-6 rounded-xl border border-[#d9e1e8] bg-white px-5 py-10 text-center"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[#d7e6f5] border-t-[#2f82d5]"/><p className="mt-3 text-[10px] text-[#71869a]">Cargando detalles de hallazgos...</p></div> : customHtml ? <div className="mt-6"><CustomHtmlRenderer key={snapshotDate ?? "sin-fecha"} html={customHtml}/></div> : findings.length === 0 ? <div className="mt-6 rounded-xl border border-dashed border-[#cbd6e0] bg-white px-5 py-10 text-center"><p className="text-[11px] font-semibold text-[#526a80]">No hay detalles de hallazgos registrados para esta fecha.</p></div> : <div className="mt-6 space-y-4">{findings.map((finding, index) => <FindingDetailCard key={`${finding.finding ?? "hallazgo"}-${index}`} finding={finding} index={index}/>)}</div>}</div></main>;
}

function FindingDetailCard({ finding, index }: { finding: Finding; index: number }) {
  const severity = String(finding.severity ?? "Observación");
  const severityClass = severity.toLowerCase().includes("mayor") ? "bg-[#fff0f0] text-[#d83b3b]" : severity.toLowerCase().includes("menor") ? "bg-[#fff8e8] text-[#b87900]" : "bg-[#f1f3f5] text-[#6b7280]";
  return <article className="rounded-xl border border-[#d9e1e8] bg-white p-4 shadow-[0_1px_2px_rgba(15,35,55,.02)] sm:p-5"><div className="flex items-start gap-3 border-b border-[#e6edf2] pb-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0f0]"><AlertTriangle className="h-4 w-4 text-[#ef5350]"/></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-[10px] font-bold text-[#8296a8]">#{index + 1}</span><span className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${severityClass}`}>{severity}</span></div><h2 className="mt-2 text-[14px] font-bold leading-[1.4] text-[#20394e]">{finding.finding || "Sin descripción del hallazgo"}</h2></div></div><div className="mt-4 grid gap-4 sm:grid-cols-2"><Detail label="Responsable" value={finding.leader}/><Detail label="Componente" value={finding.component}/><Detail label="Impacto" value={formatValue(finding.impact, "%")}/><Detail label="Cantidad" value={finding.count}/><Detail label="Acción" value={finding.action}/><Detail label="Acción del líder" value={finding.leaderAction}/></div></article>;
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return <div><p className="text-[9px] font-semibold uppercase tracking-[.05em] text-[#8296a8]">{label}</p><p className="mt-1 whitespace-pre-wrap text-[10px] leading-[1.5] text-[#29445a]">{value === undefined || value === null || String(value).trim() === "" ? "—" : value}</p></div>;
}

function formatValue(value: string | number | undefined, suffix: string) {
  if (value === undefined || value === null || value === "") return value;
  const text = String(value);
  return text.endsWith(suffix) ? text : `${text}${suffix}`;
}
