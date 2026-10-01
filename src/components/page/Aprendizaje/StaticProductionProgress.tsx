"use client";

import { Gauge, MonitorCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { hasXaiData, normalizeAvanceProduccion, typeColors, visibleKiraTypes, visibleXaiSubjects } from "@/lib/productionProgress";

// Avance de producción de las plataformas Kira y xAI, con el estilo del dashboard
// (mismas tarjetas de indicadores, tipografía, colores y selector que el resto de secciones).

type Platform = "kira" | "xai";
type Row = { name: string; done: number; total: number };
// Colores de estado del dashboard.
const DONE_COLOR = "#168a4c";
const PROGRESS_COLOR = "#e78316";
const EMPTY_COLOR = "#e3e9ef";

const percent = (item: Row) => (item.total > 0 ? Math.min(100, Math.floor((item.done / item.total) * 100)) : 0);
const status = (value: number) => {
  if (value >= 100) return { label: "Completo", className: "bg-[#e7f8ee] text-[#168a4c]" };
  if (value > 0) return { label: "En curso", className: "bg-[#fff4e5] text-[#c87913]" };
  return { label: "Sin iniciar", className: "bg-[#f1f3f5] text-[#8296a8]" };
};

export default function StaticProductionProgress() {
  // Datos capturados en Administración > Aprendizaje > "Avance de producción" para la fecha elegida.
  const data = normalizeAvanceProduccion((dashboardDatabase.aprendizaje as { avanceProduccion?: unknown } | undefined)?.avanceProduccion);
  const kiraTypes = visibleKiraTypes(data).map((type) => ({
    letter: type.letra,
    ...typeColors(type.index),
    audience: type.descripcion,
    rows: type.componentes.map((item): Row => ({ name: item.nombre, done: item.clasesProducidas ?? 0, total: item.clasesTotales ?? 0 })),
  }));
  const xaiSubjects = visibleXaiSubjects(data);
  const platforms = ([["kira", "KIRA"], ["xai", "xAI"]] as const).filter(([id]) => (id === "kira" ? kiraTypes.length > 0 : hasXaiData(data)));
  const [selectedPlatform, setPlatform] = useState<Platform>("kira");
  const platform: Platform = platforms.some(([id]) => id === selectedPlatform) ? selectedPlatform : platforms[0]?.[0] ?? "kira";
  // Las barras crecen desde 0 al mostrarse y al cambiar de plataforma.
  const [animated, setAnimated] = useState<Platform | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setAnimated(platform), 60);
    return () => window.clearTimeout(timer);
  }, [platform]);
  if (platforms.length === 0) return null;

  const mounted = animated === platform;
  const all = kiraTypes.flatMap((type) => type.rows.map(percent));
  const done = all.filter((value) => value >= 100).length;
  const inProgress = all.filter((value) => value > 0 && value < 100).length;
  const notStarted = all.length - done - inProgress;
  const global = all.length ? Math.round(all.reduce((sum, value) => sum + value, 0) / all.length) : 0;
  const types = kiraTypes.map((type) => {
    const values = type.rows.map(percent);
    return { ...type, avg: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0 };
  });
  const share = (count: number) => `${mounted && all.length ? (count / all.length) * 100 : 0}%`;

  return (
    <section className="mt-8 pt-7" aria-label="Avance de producción por plataforma">
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

      {platform === "kira" ? <>
        <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Avance global: ocupa toda la fila; los tipos van debajo en dos columnas (una en teléfono). */}
          <Kpi className="sm:col-span-2" compact badge={<Gauge className="h-4 w-4 text-[#1976d2]" />} badgeClass="bg-[#e8f3ff]" title="Avance global Kira">
            <div className="flex items-baseline gap-1"><span className="text-[31px] font-semibold leading-none tabular-nums text-[#1670d2]">{global}%</span></div>
            <div className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full" style={{ background: EMPTY_COLOR }}>
              <div className="transition-[width] duration-700 ease-out" style={{ width: share(done), background: DONE_COLOR }} />
              <div className="transition-[width] delay-100 duration-700 ease-out" style={{ width: share(inProgress), background: PROGRESS_COLOR }} />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[8px] text-[#8a9bb0]">
              <LegendItem color={DONE_COLOR} label="Completos" value={done} />
              <LegendItem color={PROGRESS_COLOR} label="En curso" value={inProgress} />
              <LegendItem color="#c3cfdb" label="Sin iniciar" value={notStarted} />
            </div>
          </Kpi>
          {types.map((type) => {
            const chip = status(type.avg);
            return <Kpi key={type.letter} badge={<span className="text-[11px] font-bold" style={{ color: type.accent }}>{type.letter}</span>} badgeStyle={{ background: type.tint }} title={`Tipo ${type.letter}`} aside={<Chip {...chip} />}>
              <span className="text-[31px] font-semibold leading-none tabular-nums" style={{ color: type.accent }}>{type.avg}%</span>
              {type.audience.trim() ? <p className="mt-2 text-[8px] text-[#8a9bb0]">{type.audience}</p> : null}
            </Kpi>;
          })}
        </div>

        <h3 className="mt-6 text-[10px] font-semibold uppercase tracking-[.04em] text-[#4f6a82]">Detalle por tipo y materia</h3>
        <div className="mt-3 grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          {types.map((type) => <article key={type.letter} className="min-w-0 rounded-lg border border-[#d6dfe8] bg-white p-4 shadow-[0_1px_2px_rgba(15,35,55,.02)]">
            <div className="flex items-center gap-3 border-b border-[#e6edf2] pb-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white" style={{ background: type.accent }}>{type.letter}</span>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-semibold text-[#233a4e]">Tipo {type.letter}</h4>
                {type.audience.trim() ? <p className="mt-[3px] text-[8px] text-[#91a3b7]">{type.audience}</p> : null}
              </div>
              <span className="text-[15px] font-semibold tabular-nums" style={{ color: type.accent }}>{type.avg}%</span>
            </div>
            <div className="mt-3 space-y-3">
              {type.rows.map((item) => {
                const value = percent(item);
                return <div key={item.name}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="min-w-0 text-[9px] font-semibold text-[#29445b]">{item.name}</span>
                    <span className="flex flex-none items-center gap-2">
                      <Chip {...status(value)} />
                      <span className="w-[30px] text-right text-[9px] font-semibold tabular-nums" style={{ color: value > 0 ? type.accent : "#9aabbd" }}>{value}%</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e8eef4]">
                    <div className="h-full rounded-full transition-[width] duration-700 ease-out" style={{ width: `${mounted ? value : 0}%`, background: type.accent }} />
                  </div>
                  <p className="mt-1 text-[8px] text-[#8a9bb0]"><strong className="font-semibold tabular-nums text-[#4f6a82]">{item.done} de {item.total}</strong> clases</p>
                </div>;
              })}
            </div>
          </article>)}
        </div>
      </> : <div className="mt-5 grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
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

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />{label} <strong className="font-semibold text-[#4f6a82]">{value}</strong></span>;
}
