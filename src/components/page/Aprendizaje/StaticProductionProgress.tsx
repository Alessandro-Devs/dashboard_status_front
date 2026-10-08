"use client";

import { MonitorCheck } from "lucide-react";
import { useState } from "react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { hasXaiData, normalizeAvanceProduccion, visibleXaiSubjects } from "@/lib/productionProgress";

// Encabezado de Aprendizaje con selector KIRA / xAI: KIRA muestra las cards de materias y xAI su estado, con el estilo del dashboard
// (mismas tarjetas de indicadores, tipografía, colores y selector que el resto de secciones).

type Platform = "kira" | "xai";

export default function StaticProductionProgress({ children }: { children?: React.ReactNode }) {
  // Datos capturados en Administración > Aprendizaje > "Avance de producción" para la fecha elegida.
  const data = normalizeAvanceProduccion((dashboardDatabase.aprendizaje as { avanceProduccion?: unknown } | undefined)?.avanceProduccion);
  const xaiSubjects = visibleXaiSubjects(data);
  const platforms = ([["kira", "KIRA"], ["xai", "xAI"]] as const).filter(([id]) => (id === "kira" ? true : hasXaiData(data)));
  const [selectedPlatform, setPlatform] = useState<Platform>("kira");
  const platform: Platform = platforms.some(([id]) => id === selectedPlatform) ? selectedPlatform : platforms[0]?.[0] ?? "kira";
  return (
    <section aria-label="Avance de producción por plataforma">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[.04em] text-[#253d53]">Avance de producción por tipo y materia</h2>
        </div>
        {platforms.length > 1 ? <div role="tablist" aria-label="Seleccionar plataforma" className="grid grid-cols-2 self-start border-b" style={{ borderBottomColor: "#e3e9ef" }}>
          {platforms.map(([id, label]) => {
            const active = platform === id;
            return <button key={id} type="button" role="tab" aria-selected={active} onClick={() => setPlatform(id)} style={{ borderBottomColor: active ? "#176fc8" : "transparent" }} className={`-mb-px w-14 cursor-pointer border-b-2 pb-1.5 text-center text-[10px] font-semibold tracking-[.04em] transition-colors ${active ? "text-[#176fc8]" : "text-[#8a9bb0] hover:text-[#4f6a82]"}`}>{label}</button>;
          })}
        </div> : <span className="self-start text-[10px] font-semibold tracking-[.04em] text-[#176fc8]">{platforms[0][1]}</span>}
      </div>

      {/* KIRA muestra las cards de materias; xAI solo lo de xAI. */}
      {platform === "kira" ? children : <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {data.xai.estado.trim() ? <Kpi badge={<MonitorCheck className="h-4 w-4 text-[#168a4c]" />} badgeClass="bg-[#e7f8ee]" title="Estado de la plataforma xAI">
          <span className="flex items-center gap-2 text-[18px] font-semibold leading-none text-[#168a4c]"><span className="h-2.5 w-2.5 rounded-full bg-[#1fb45f] shadow-[0_0_0_4px_rgba(31,180,95,.18)]" />{data.xai.estado}</span>
          {data.xai.alcance.trim() ? <p className="mt-3 text-[8px] text-[#8a9bb0]">{data.xai.alcance}</p> : null}
        </Kpi> : null}
        {xaiSubjects.map((subject, index) => <Kpi key={`${subject.nombre}-${index}`} badge={<span className="text-[11px] font-bold text-[#176fc8]">{subject.nombre.trim().charAt(0).toUpperCase()}</span>} badgeClass="bg-[#e8f3ff]" title={subject.nombre} aside={<Chip label={subject.activa ? "Activa" : "Inactiva"} className={subject.activa ? "bg-[#e7f8ee] text-[#168a4c]" : "bg-[#f1f3f5] text-[#8296a8]"} />}>
          {subject.detalle.trim() ? <span className="text-[15px] font-semibold leading-none text-[#1670d2]">{subject.detalle}</span> : null}
        </Kpi>)}
      </div>}
    </section>
  );
}

// Misma estructura que KpiCard del dashboard, con un espacio opcional a la derecha.
function Kpi({ badge, badgeClass = "", badgeStyle, title, aside, className = "", compact = false, children }: { badge: React.ReactNode; badgeClass?: string; badgeStyle?: React.CSSProperties; title: string; aside?: React.ReactNode; className?: string; compact?: boolean; children: React.ReactNode }) {
  return <div className={`${compact ? "" : "min-h-[145px]"} min-w-0 rounded-lg border border-[#d7e0e9] bg-white p-4 ${className}`}>
    <div className="flex items-start gap-3">
      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${badgeClass}`} style={badgeStyle}>{badge}</span>
      <h3 className="min-w-0 flex-1 pt-1 text-[8px] font-semibold uppercase leading-[1.35] tracking-[.04em] text-[#4f6a82]">{title}</h3>
      {aside}
    </div>
    <div className="mt-4">{children}</div>
  </div>;
}

function Chip({ label, className }: { label: string; className: string }) {
  return <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-bold uppercase ${className}`}>{label}</span>;
}

