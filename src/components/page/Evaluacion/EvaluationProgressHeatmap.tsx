"use client";

import { useMemo, useState } from "react";

const months = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const blocks = ["B1", "B2", "B3", "B4", "B5"];
const blockOptions = ["Todos", ...blocks];
const subjects = ["Lenguaje", "Matemática"];

const levels = [
  { name: "Excelente", dotColor: "#0f8b83", values: [16, 13, 12, 18, 14, 17, 19, 21, 20, 22, 24, 26], colors: ["#91c9c5", "#9bcfcb", "#a1d1ce", "#86c2bd", "#91c9c5", "#83bfba", "#79b9b4", "#72b4af", "#76b8b3", "#69aca7", "#62a7a2", "#5ba39e"] },
  { name: "Bueno", dotColor: "#20a98d", values: [27, 25, 24, 29, 26, 28, 30, 31, 29, 30, 32, 33], colors: ["#5bc1a5", "#65c5aa", "#6bc8ae", "#55bda0", "#60c2a6", "#59bea2", "#50b99c", "#4bb697", "#54ba9e", "#50b99c", "#48b495", "#43b191"] },
  { name: "Medio", dotColor: "#f3a617", values: [31, 28, 34, 30, 32, 29, 27, 26, 28, 25, 24, 23], colors: ["#f7b844", "#f9c15a", "#f5ae2f", "#f7ba49", "#f6b43c", "#f8bd50", "#f9c25b", "#f9c563", "#f9c05a", "#fac96d", "#facd78", "#fad080"] },
  { name: "Bajo", dotColor: "#ea5b0c", values: [18, 22, 20, 16, 19, 18, 16, 14, 15, 14, 12, 11], colors: ["#f7a276", "#f39262", "#f69b6d", "#f8aa82", "#f69e71", "#f7a276", "#f8aa82", "#f9b38e", "#f9af89", "#f9b38e", "#fac0a0", "#fac6aa"] },
  { name: "Crítico", dotColor: "#e32932", values: [8, 12, 10, 7, 9, 8, 8, 8, 8, 9, 8, 7], colors: ["#f3afb2", "#efa0a4", "#f1a7aa", "#f5b5b8", "#f2acaf", "#f3afb2", "#f3afb2", "#f3afb2", "#f3afb2", "#f2acaf", "#f3afb2", "#f5b5b8"] },
] as const;

const nonIntervenibleFactors = [
  { name: "Deserción", percentage: "1.0%", students: "93 estudiantes", size: "col-span-1" },
  { name: "Sobreedad", percentage: "0.5%", students: "43 estudiantes", size: "col-span-1" },
  { name: "Repitencia", percentage: "7.5%", students: "684 estudiantes", size: "col-span-1" },
  { name: "NEE", percentage: "11.9%", students: "1,078 estudiantes", size: "col-span-2" },
  { name: "Salud", percentage: "10.0%", students: "907 estudiantes", size: "col-span-2" },
  { name: "Retiro a DAI / Aula de ayuda", percentage: "2.5%", students: "228 estudiantes", size: "col-span-1" },
  { name: "Convivencia", percentage: "5.1%", students: "465 estudiantes", size: "col-span-1" },
  { name: "Factores sociales", percentage: "23.1%", students: "2,102 estudiantes", size: "col-span-2" },
] as const;
const intervenibleFactors = [
  { name: "Inasistencia cronica", percentage: "9.8%", students: "889 estudiantes", size: "col-span-2" },
  { name: "Deficiencia ensenanza previa", percentage: "10.2%", students: "927 estudiantes", size: "col-span-2" },
  { name: "Falta de dispositivos", percentage: "2.9%", students: "267 estudiantes", size: "col-span-1" },
  { name: "No conexion cronica", percentage: "8.5%", students: "776 estudiantes", size: "col-span-1" },
] as const;

export default function EvaluationProgressHeatmap() {
  const [selectedBlock, setSelectedBlock] = useState("Todos");
  const [selectedSubject, setSelectedSubject] = useState("Matemática");
  const [riskFactorsActive, setRiskFactorsActive] = useState(false);
  const chartLevels = useMemo(() => {
    const blockAdjustment = selectedBlock === "Todos" ? 0 : blocks.indexOf(selectedBlock) * 2;
    const subjectAdjustment = selectedSubject === "Matemática" ? 2 : 0;
    const visibleLevels = selectedBlock === "B1" && riskFactorsActive ? levels.filter((level) => level.name === "Bajo" || level.name === "Crítico") : levels;
    return visibleLevels.map((level, levelIndex) => ({
      ...level,
      values: level.values.map((value, monthIndex) => Math.max(0, value + blockAdjustment + subjectAdjustment - (levelIndex === 4 ? monthIndex % 2 : 0))),
    }));
  }, [riskFactorsActive, selectedBlock, selectedSubject]);

  return (
    <section className="rounded-xl border border-[#dce4ec] bg-white p-4">
      <div className="mb-4">
        <h3 className="text-[13px] font-semibold uppercase text-[#334b60]">Resultados de progreso</h3>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <FilterSelect label="Bloque" value={selectedBlock} options={blockOptions} onChange={(value) => { setSelectedBlock(value); setRiskFactorsActive(false); }} />
        <FilterSelect label="Materia" value={selectedSubject} options={subjects} onChange={setSelectedSubject} />
        {selectedBlock === "B1" ? <button type="button" aria-pressed={riskFactorsActive} onClick={() => setRiskFactorsActive((active) => !active)} className={`h-7 cursor-pointer rounded-md border px-3 text-[9px] font-semibold transition sm:ml-auto ${riskFactorsActive ? "border-[#e6a7aa] bg-[#fff1f1] text-[#d64545] hover:bg-[#ffe5e5]" : "border-[#f2c48e] bg-[#fff7ea] text-[#c87913] hover:bg-[#fff0d2]"}`}>Factores de riesgo{riskFactorsActive ? <span className="ml-2 text-sm leading-none">×</span> : null}</button> : null}
      </div>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1100px]">
          <div className="mb-3 grid items-end gap-2" style={{ gridTemplateColumns: "120px repeat(12, minmax(65px, 1fr))" }}>
            <div />
            {months.map((month) => <div key={month} className="text-center text-[12px] font-medium text-slate-500">{month}</div>)}
          </div>
          <div className="space-y-2">
            {chartLevels.map((level) => <div key={level.name} className="grid items-center gap-2" style={{ gridTemplateColumns: "120px repeat(12, minmax(65px, 1fr))" }}>
              <div className="flex items-center gap-2"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: level.dotColor }} /><span className="text-[12px] font-medium text-slate-600">{level.name}</span></div>
              {level.values.map((value, index) => <div key={`${level.name}-${index}`} className="flex h-[52px] items-center justify-center rounded-lg text-[12px] font-semibold text-white transition-transform duration-150 hover:scale-[1.03]" style={{ backgroundColor: level.colors[index] }}>{value}%</div>)}
            </div>)}
          </div>
        </div>
      </div>
      {riskFactorsActive ? <RiskFactorsTreemap /> : null}
    </section>
  );
}

function RiskFactorsTreemap() {
  const [showDetails, setShowDetails] = useState<"intervenible" | "no-intervenible" | null>(null);
  const intervenible = showDetails === "intervenible";
  const factors = intervenible ? intervenibleFactors : nonIntervenibleFactors;
  const factorColors = intervenible ? ["#b9e0d5", "#a9d8cb", "#c7e6dd", "#98cfbf"] : ["#fbd8c2", "#f9d0b7", "#f7c7a9", "#f5bf9b", "#f4b78e", "#f8cfb5", "#f6c39f", "#f2ad7e"];

  return <div className="mt-6 rounded-lg border border-[#dce4ec] bg-[#fbfcfd] p-3">
    <div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2"><h4 className="text-[10px] font-semibold uppercase tracking-[.04em] text-[#526a80]">Factores de riesgo</h4>{showDetails ? <button type="button" onClick={() => setShowDetails(null)} className="cursor-pointer text-[8px] font-semibold text-[#176fc8]">← Volver</button> : null}</div><span className="text-[8px] text-[#8a9daf]">{intervenible ? "Intervenible" : showDetails ? "No intervenible" : "Clasificación inicial"}</span></div>
    {!showDetails ? <div className="flex h-24 overflow-hidden rounded-md"><button type="button" onClick={() => setShowDetails("intervenible")} className="flex flex-[3] cursor-pointer items-center justify-center bg-[#e5f4f0] text-[10px] font-semibold text-[#08775e] transition hover:brightness-95">Intervenible</button><button type="button" onClick={() => setShowDetails("no-intervenible")} className="flex flex-[2] cursor-pointer items-center justify-center bg-[#fff0d7] text-[10px] font-semibold text-[#c87913] transition hover:brightness-95">No intervenible</button></div> : <div className="grid grid-cols-2 overflow-hidden rounded-md sm:grid-cols-4">{factors.map((factor, index) => <div key={factor.name} className={`${factor.size} flex min-h-[58px] flex-col justify-center px-2 py-1.5 text-center ${intervenible ? "text-[#08775e]" : "text-[#7b4a1d]"}`} style={{ backgroundColor: factorColors[index] }}><strong className="text-[8px] font-semibold leading-tight">{factor.name}</strong><span className="mt-1 text-[10px] font-bold">{factor.percentage}</span><small className="text-[7px]">{factor.students}</small></div>)}</div>}
  </div>;
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label className="block w-full text-[7px] font-semibold uppercase tracking-[.04em] text-[#71869a] sm:w-[130px]"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-7 w-full cursor-pointer rounded-md border border-[#d9e2eb] bg-[#fbfcfd] px-2 text-[9px] font-semibold normal-case text-[#334b60] outline-none transition focus:border-[#176fc8] focus:ring-2 focus:ring-[#eaf4ff]">{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}
