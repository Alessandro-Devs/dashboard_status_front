"use client";

import BarreraCard from "./BarreraCard";

const mathJune = [
  { label: "15.9%", value: 15.9, color: "#e5252a" },
  { label: "25.4%", value: 25.4, color: "#f05b0b" },
  { label: "19%", value: 19, color: "#f2a312" },
  { label: "14.9%", value: 14.9, color: "#19a97a" },
  { label: "24.8%", value: 24.8, color: "#0c7f73" },
];

const mathJuly = [
  { label: "22%", value: 22, color: "#e5252a" },
  { label: "22.7%", value: 22.7, color: "#f05b0b" },
  { label: "21.4%", value: 21.4, color: "#f2a312" },
  { label: "15.1%", value: 15.1, color: "#19a97a" },
  { label: "18.8%", value: 18.8, color: "#0c7f73" },
];

const languageJune = [
  { label: "18%", value: 18, color: "#e5252a" },
  { label: "19.1%", value: 19.1, color: "#f05b0b" },
  { label: "19.3%", value: 19.3, color: "#f2a312" },
  { label: "20.1%", value: 20.1, color: "#19a97a" },
  { label: "23.5%", value: 23.5, color: "#0c7f73" },
];

const languageJuly = [
  { label: "23.7%", value: 23.7, color: "#e5252a" },
  { label: "21.5%", value: 21.5, color: "#f05b0b" },
  { label: "17.6%", value: 17.6, color: "#f2a312" },
  { label: "18.6%", value: 18.6, color: "#19a97a" },
  { label: "18.6%", value: 18.6, color: "#0c7f73" },
];

type Segment = { label: string; value: number; color: string };

export default function EvaluationComparison() {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <AverageCard title="PROMEDIO MATEMÁTICA" value="50" variation="-2.7" />
        <AverageCard title="PROMEDIO LENGUA" value="49.7" variation="-2.9" />
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ComparisonCard title="Matemática - Comparativa por Niveles" june={mathJune} july={mathJuly} />
        <ComparisonCard title="Lengua - Comparativa por Niveles" june={languageJune} july={languageJuly} />
      </div>
      <BarreraCard />
    </section>
  );
}

function AverageCard({ title, value, variation }: { title: string; value: string; variation: string }) {
  return (
    <div className="rounded-[9px] border border-[#dce3ea] bg-white p-5">
      <p className="text-[11px] font-semibold uppercase text-[#6b7f92] sm:text-xs">{title}</p>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[25px] font-semibold text-[#263d52] sm:text-[26px]">{value}</span>
        <span className="rounded bg-[#fff0d7] px-2 py-1 text-[10px] font-semibold text-[#dd8d15]">Medio</span>
      </div>
      <p className="mt-2 text-[10px] text-[#5d7083] sm:text-[11px]">
        <span className="font-semibold text-[#e04444]">↘ {variation}</span> vs Junio
      </p>
    </div>
  );
}

function ComparisonCard({ title, june, july }: { title: string; june: Segment[]; july: Segment[] }) {
  return (
    <section className="rounded-[8px] border border-[#dce4ec] bg-white p-4">
      <h3 className="text-[13px] font-semibold text-[#334b60] sm:text-sm">{title}</h3>
      <p className="mt-1 text-[10px] text-[#8a9daf] sm:text-[11px]">Porcentaje de estudiantes en cada nivel</p>
      <div className="mt-4 rounded-[7px] border border-[#e1e7ed] bg-[#fbfcfd] px-3 py-3">
        <StackedRow label="Junio" data={june} />
        <div className="my-3 border-t border-[#edf1f4]" />
        <StackedRow label="Julio" data={july} />
        <div className="mt-3 flex items-center justify-between pl-[42px] text-[7px] text-[#667b8e] sm:pl-[49px] sm:text-[8px]">
          <span>CRÍTICO (0-35)</span><span>EXCELENTE (66-100)</span>
        </div>
      </div>
    </section>
  );
}

function StackedRow({ label, data }: { label: string; data: Segment[] }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="w-[34px] shrink-0 text-[9px] font-medium text-[#62778b] sm:w-[37px] sm:text-[10px]">{label}</span>
      <div className="flex h-[25px] flex-1 overflow-hidden rounded-[3px] sm:h-[28px]">
        {data.map((segment, index) => (
          <div key={`${label}-${index}`} className="flex h-full items-center justify-center text-[7px] font-semibold text-white sm:text-[8px]" style={{ width: `${segment.value}%`, backgroundColor: segment.color }}>
            {segment.label}
          </div>
        ))}
      </div>
    </div>
  );
}
