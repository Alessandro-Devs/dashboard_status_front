"use client";

import { useState } from "react";

type Platform = "kira" | "xai";
const types = [
  { letter: "A", name: "TIPO A", audience: "Estudiantes con bajo rezago", color: "#059c80", subjects: [["Lenguaje", 66], ["Matematicas", 66], ["Refuerzo curricular", 66], ["Ciencia y Tecnologia", 0], ["Desarrollo del pensamiento", 0]] },
  { letter: "B", name: "TIPO B", audience: "Estudiantes con medio rezago", color: "#187ec7", subjects: [["Lenguaje", 100], ["Matematicas", 100], ["Refuerzo curricular", 100]] },
  { letter: "C", name: "TIPO C", audience: "Centros escolares multigrado", color: "#f26a0a", subjects: [["Remediacion", 10], ["Nivelacion", 0]] },
] as const;

export default function StaticProductionProgress({ date }: { date: string }) {
  const [platform, setPlatform] = useState<Platform>("kira");
  if (date !== "2026-09-24") return null;

  return (
    <section className="mt-8 pt-7" aria-label="Avance de produccion por plataforma">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="text-sm font-semibold uppercase tracking-[.04em] text-[#253d53]">Avance de produccion por tipo y materia</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">Plataforma {platform === "kira" ? "Kira" : "xAI"} · Corte: 24 de septiembre de 2026</p></div>
        <nav className="flex items-center gap-5 border-b border-[#dce6ef]" aria-label="Seleccionar plataforma">
          {([['kira', 'KIRA'], ['xai', 'xAI']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={platform === value} onClick={() => setPlatform(value)} className={`relative w-12 cursor-pointer px-0.5 pb-2.5 text-center text-[11px] font-semibold transition ${platform === value ? value === "kira" ? "text-[#059c80] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#059c80]" : "text-[#386fb8] after:absolute after:bottom-[-1px] after:left-0 after:h-0.5 after:w-full after:bg-[#386fb8]" : "text-[#8295a8] hover:text-[#526a80]"}`}>{label}</button>)}
        </nav>
      </div>

      {platform === "kira" ? <div>
        <div className="grid gap-4 md:grid-cols-3">
          {types.map((type) => <article key={type.letter} className="overflow-hidden rounded-lg border border-[#dce6ef] bg-white shadow-[0_3px_10px_rgba(26,67,110,.025)]">
            <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ backgroundColor: type.color }}><span className="grid h-9 w-9 place-items-center rounded-full bg-white text-base font-black" style={{ color: type.color }}>{type.letter}</span><div><span className="block text-[11px] font-bold">{type.name}</span><span className="mt-0.5 block text-[8px] font-medium leading-tight">{type.audience}</span></div></div>
            <div className="grid gap-3 px-4 py-4">{type.subjects.map(([subject, value]) => <div key={subject} className="grid gap-1.5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-semibold text-[#29445b]">{subject}</span><span className="text-[10px] font-bold" style={{ color: type.color }}>{value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#e3ebf2]"><div className="h-full min-w-1 rounded-full" style={{ width: `${value}%`, backgroundColor: type.color }} /></div></div>)}</div>
          </article>)}
        </div>
        <p className="mt-4 text-center text-[8px] text-[#8fa1b5]">Los porcentajes muestran el avance de produccion reportado para cada componente.</p>
      </div> : <article className="grid overflow-hidden rounded-lg border border-[#dce6ef] bg-white shadow-[0_3px_10px_rgba(26,67,110,.025)] lg:grid-cols-[190px_minmax(0,1fr)]">
        <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#2f63a8] to-[#173d78] px-5 py-5 text-center text-white lg:min-h-[280px]"><span className="grid h-16 w-16 place-items-center rounded-full bg-white text-base font-black text-[#386fb8]">xAI</span><strong className="text-sm">Desarrollo xAI</strong><span className="text-[9px] leading-tight opacity-90">Alcance actual de la plataforma</span></div>
        <div className="flex flex-col justify-center px-5 py-6 sm:px-7"><span className="mb-1 text-[9px] font-bold uppercase tracking-[.08em] text-[#386fb8]">6to grado</span><h3 className="text-lg font-semibold text-[#17324a]">Lenguaje y Matematicas</h3><p className="mt-2 max-w-[760px] text-[10px] leading-5 text-[#71869a]">La plataforma se encuentra en funcionamiento para estas dos asignaturas, con alcance actual unicamente en sexto grado.</p><span className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[#e3f6ef] px-3 py-2 text-[9px] font-bold text-[#08775e] before:h-2 before:w-2 before:rounded-full before:bg-[#10a67d]">En funcionamiento</span><div className="mt-4 grid max-w-[760px] gap-3 sm:grid-cols-2">{[['L', 'Lenguaje'], ['M', 'Matematicas']].map(([letter, subject]) => <div key={subject} className="flex min-h-[64px] items-center gap-3 rounded-md border border-[#dce6ef] bg-[#f8fbfe] px-3 py-3"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#386fb8] text-xs font-bold text-white">{letter}</span><div><strong className="block text-[10px] font-semibold text-[#29445b]">{subject}</strong><small className="text-[8px] text-[#8295a8]">6to grado</small></div></div>)}</div></div>
      </article>}
    </section>
  );
}
