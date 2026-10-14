"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Check, Flag, GraduationCap } from "lucide-react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { readDirectorsTraining, TRAINING_AXES } from "@/lib/schoolManagementExtras";

// Una sesión se considera completa al llegar al 95% de los CE.
const COMPLETA = 95;
// Colores de la pestaña Observaciones: azul, verde y morado por eje; verde = completa, azul = en curso, gris = pendiente.
const EJE_COLORS = ["#176dcc", "#168642", "#7b3ff2"];
const STATE = {
  completa: { label: "Completa", dot: "#168642", soft: "#eaf8ef", text: "#168642" },
  curso: { label: "En curso", dot: "#176dcc", soft: "#eaf3ff", text: "#176dcc" },
  pendiente: { label: "Pendiente", dot: "#b7c3d0", soft: "#edf1f5", text: "#8297af" },
};
type State = keyof typeof STATE;

const has = (value: number | null | undefined): value is number => typeof value === "number" && Number.isFinite(value);
const fmt = (value: number) => value.toLocaleString("es-SV");
const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
// Un decimal; nunca muestra 100% si no se llegó al 100.
const fmtPct = (value: number) => {
  let shown = Math.round(value * 10) / 10;
  if (value < 100 && shown >= 100) shown = 99.9;
  if (value > 0 && shown <= 0) shown = 0.1;
  return `${shown.toLocaleString("es-SV", { maximumFractionDigits: 1 })}%`;
};
// Escala de la matriz: sin iniciar (0%), en curso y completado (desde el % de COMPLETA).
const LEVELS = [
  { label: "Sin iniciar", min: -Infinity, bg: "#e5e9ee", text: "#6b7c8f" },
  { label: "En curso", min: 0.0001, bg: "#f59e0b", text: "#ffffff" },
  { label: "Completado", min: COMPLETA, bg: "#168642", text: "#ffffff" },
];
const levelOf = (value: number) => [...LEVELS].reverse().find((level) => value >= level.min) ?? LEVELS[0];
const stateOf = (value: number | null): State => (!has(value) || value <= 0 ? "pendiente" : value >= COMPLETA ? "completa" : "curso");

function StateChip({ state }: { state: State }) {
  const s = STATE[state];
  return <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[8px] font-semibold" style={{ background: s.soft, color: s.text }}><span className="h-1.5 w-1.5 rounded-full" style={{ background: s.dot }} />{s.label}</span>;
}

export default function DirectorsTrainingPanel() {
  // Tarjeta flotante al pasar el cursor por una celda de la matriz (posición fija para que no la recorte el scroll de la tabla;
  // se divide entre el zoom del body porque el CSS global lo amplía).
  const [hover, setHover] = useState<{ x: number; y: number; eje: string; ejeColor: string; n: number; formados: number; faltan: number; pct: number; label: string; color: string } | null>(null);
  // Datos capturados en el panel (Gestión operativa → Formación de directores) para la fecha de corte.
  const data = readDirectorsTraining(dashboardDatabase.gestionEscolar?.gestionOperativa?.formacionDirectores);
  if (!data) return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-[.04em] text-[#29455f]">FORMACIÓN DE DIRECTORES</h2>
      <div className="mt-5 flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d9e1e8] bg-white px-6 py-12 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#eaf3ff] text-[#176dcc]"><GraduationCap className="h-5 w-5" /></span>
        <p className="text-[12px] font-semibold text-[#29455f]">Sin datos de formación de directores</p>
        <p className="max-w-sm text-[10px] text-[#8fa1b5]">No hay información registrada para esta fecha de corte.</p>
      </div>
    </section>
  );
  const f = { ejes: TRAINING_AXES, ...data };
  // Total de CE y meta vienen del panel (o se calculan si se dejaron vacíos).
  const totalCE = f.totalCE;
  const sesiones = f.formados.map((formados, index) => {
    const value = pct(formados, totalCE);
    return { n: index + 1, formados, faltan: Math.max(0, totalCE - formados), pct: value, state: stateOf(value), ejeIndex: f.ejes.findIndex((eje) => eje.sesiones.includes(index + 1)) };
  });

  // Meta del programa: todos los CE en todas las sesiones.
  const meta = f.meta;
  const ejes = f.ejes.map((eje, index) => {
    const propias = sesiones.filter((s) => s.ejeIndex === index);
    const formados = propias.reduce((a, s) => a + s.formados, 0);
    const avance = pct(formados, totalCE * propias.length);
    const state: State = propias.every((s) => s.state === "completa") ? "completa" : formados === 0 ? "pendiente" : "curso";
    const numeros = propias.map((s) => s.n);
    return { ...eje, index, propias, formados, avance, state, faltan: Math.max(0, totalCE * propias.length - formados), rango: numeros.length > 2 ? `Sesiones ${numeros[0]} a ${numeros[numeros.length - 1]}` : `Sesiones ${numeros.join(" y ")}` };
  });

  return (
    <section className="mt-8">
      <h2 className="text-[15px] font-semibold tracking-[.04em] text-[#29455f]">FORMACIÓN DE DIRECTORES</h2>

      {/* Matriz de avance: % de CE que completaron cada sesión, agrupado por eje */}
      <div className="mt-5 rounded-[10px] border border-[#d9e1e8] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-[#29455f]">Matriz de avance</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf3ff] px-3 py-1 text-[10px] font-semibold text-[#176dcc]"><Flag className="h-3 w-3" />Meta: {fmt(meta)} participaciones</span>
        </div>
        <div className="-mx-5 mt-4 overflow-x-auto px-5">
          <table className="w-full min-w-[860px] border-separate border-spacing-y-1.5 text-[11px]">
            <thead>
              <tr className="text-[8px] font-semibold uppercase tracking-[.06em] text-[#60778d]">
                <th className="pb-1 pl-3 text-left font-semibold">Eje</th>
                {sesiones.map((s) => <th key={s.n} className="pb-1 text-center font-semibold">Sesión {s.n}</th>)}
                <th className="pb-1 text-right font-semibold">Realizadas</th>
                <th className="pb-1 text-right font-semibold">Faltan</th>
                <th className="pb-1 pr-3 text-right font-semibold">Avance</th>
              </tr>
            </thead>
            <tbody>
              {ejes.map((eje) => (
                <tr key={eje.nombre}>
                  <td className="rounded-l-[8px] bg-[#f7f9fb] py-3 pl-3 pr-2">
                    <span className="flex items-center gap-2.5"><span className="h-5 w-1 rounded-full" style={{ background: EJE_COLORS[eje.index] }} /><span className="whitespace-nowrap font-semibold text-[#223c52]">{eje.nombre}</span></span>
                  </td>
                  {sesiones.map((s) => {
                    const level = s.ejeIndex === eje.index ? levelOf(s.pct) : null;
                    return (
                      <td key={s.n} className="bg-[#f7f9fb] px-1 py-3 text-center">
                        {level ? <span className="inline-flex h-8 min-w-[64px] cursor-default items-center justify-center rounded-[7px] px-2 text-[11px] font-semibold transition hover:-translate-y-px hover:shadow-[0_4px_10px_rgba(15,35,55,.18)]" style={{ background: level.bg, color: level.text }}
                          onMouseEnter={(event) => { const r = event.currentTarget.getBoundingClientRect(); const zoom = Number.parseFloat(getComputedStyle(document.body).zoom) || 1; setHover({ x: (r.left + r.width / 2) / zoom, y: r.top / zoom, eje: eje.nombre, ejeColor: EJE_COLORS[eje.index], n: s.n, formados: s.formados, faltan: s.faltan, pct: s.pct, label: level.label, color: level.bg === "#e5e9ee" ? "#6b7c8f" : level.bg }); }}
                          onMouseLeave={() => setHover(null)}>{fmtPct(s.pct)}</span> : null}
                      </td>
                    );
                  })}
                  <td className="bg-[#f7f9fb] py-3 text-right tabular-nums text-[#29455f]">{fmt(eje.formados)}</td>
                  <td className="bg-[#f7f9fb] py-3 text-right tabular-nums text-[#29455f]">{fmt(eje.faltan)}</td>
                  <td className="rounded-r-[8px] bg-[#f7f9fb] py-3 pr-3 text-right font-semibold tabular-nums" style={{ color: EJE_COLORS[eje.index] }}>{fmtPct(eje.avance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Avance por bloque */}
      <div className="mt-4 rounded-[10px] border border-[#d9e1e8] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-[#29455f]">Avance por bloque</h3>
          </div>
          <div className="flex flex-wrap gap-2">{(Object.keys(STATE) as State[]).map((key) => <StateChip key={key} state={key} />)}</div>
        </div>
        <div className="-mx-5 mt-4 overflow-x-auto px-5">
          <table className="w-full min-w-[640px] border-separate border-spacing-y-1.5 text-[10px]">
            <thead>
              <tr className="text-[8px] font-semibold uppercase tracking-[.05em] text-[#60778d]">
                <th className="pb-1 text-left font-semibold">Bloque</th>
                {sesiones.map((s) => <th key={s.n} className="pb-1 text-center font-semibold" style={{ color: EJE_COLORS[s.ejeIndex] }}>S{s.n}</th>)}
                <th className="pb-1 pl-3 text-left font-semibold">Avance del bloque</th>
              </tr>
            </thead>
            <tbody>
              {f.bloques.map((b) => {
                const avance = b.pct.reduce<number>((total, value) => total + (has(value) ? value : 0), 0) / b.pct.length;
                return (
                  <tr key={b.nombre}>
                    <td className="rounded-l-[7px] bg-[#f7f9fb] py-2 pl-3 pr-2"><span className="block font-semibold text-[#223c52]">{b.nombre}</span><span className="text-[8px] text-[#8fa1b5]">{fmt(b.ce)} CE</span></td>
                    {b.pct.map((value, i) => {
                      const st = STATE[stateOf(value)];
                      return (
                        <td key={i} className="bg-[#f7f9fb] px-1 py-2 text-center">
                          <span className="inline-flex h-7 min-w-[46px] items-center justify-center gap-1 rounded-full px-2 text-[9px] font-semibold" style={{ background: st.soft, color: st.text }}
                            title={has(value) ? `${b.nombre} · Sesión ${i + 1}: ${value}% · faltan ${fmt(Math.round(b.ce * (1 - value / 100)))} CE` : `${b.nombre} · Sesión ${i + 1}: pendiente`}>
                            {has(value) ? <>{value >= COMPLETA ? <Check className="h-3 w-3" strokeWidth={3} /> : null}{value}%</> : "—"}
                          </span>
                        </td>
                      );
                    })}
                    <td className="rounded-r-[7px] bg-[#f7f9fb] py-2 pl-3 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-[#e3e9ef]"><div className="h-full rounded-full bg-[#176dcc]" style={{ width: `${avance}%` }} /></div>
                        <span className="w-10 text-right font-semibold text-[#29455f]">{fmtPct(avance)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {hover ? createPortal(
        <div className="pointer-events-none fixed z-50 w-[210px] -translate-x-1/2 -translate-y-full" style={{ left: hover.x, top: hover.y - 10 }}>
          <div className="rounded-[10px] border border-[#e1e8ef] bg-white p-3 shadow-[0_10px_28px_rgba(15,35,55,.16)]">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold" style={{ color: hover.ejeColor }}><span className="h-2 w-2 rounded-full" style={{ background: hover.ejeColor }} />{hover.eje}</span>
              <span className="rounded-full px-2 py-0.5 text-[8px] font-semibold" style={{ background: `${hover.color}1f`, color: hover.color }}>{hover.label}</span>
            </div>
            <p className="mt-2 text-[12px] font-semibold text-[#223c52]">Sesión {hover.n}</p>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-[20px] font-semibold leading-none" style={{ color: hover.color }}>{fmtPct(hover.pct)}</span>
              <span className="text-[9px] text-[#8fa1b5]">de los CE</span>
            </div>
            <div className="mt-2 h-[5px] overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{ width: `${hover.pct}%`, background: hover.color }} /></div>
            <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[#edf1f5] pt-2 text-[9px] text-[#60778d]">
              <span>Completaron<b className="mt-0.5 block text-[12px] font-semibold text-[#223c52]">{fmt(hover.formados)} <span className="text-[9px] font-normal text-[#8fa1b5]">/ {fmt(totalCE)}</span></b></span>
              <span className="text-right">Faltan<b className="mt-0.5 block text-[12px] font-semibold text-[#c2410c]">{fmt(hover.faltan)} CE</b></span>
            </div>
          </div>
          <span className="absolute left-1/2 top-full -mt-[6px] h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-[#e1e8ef] bg-white" />
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
