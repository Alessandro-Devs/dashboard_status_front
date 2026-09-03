"use client";
import BarreraCard from "./BarreraCard";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { formatoNumero, getEvaluacion, tieneNumero } from "./evaluationViewData";

const colors = ["#e5252a", "#f05b0b", "#f2a312", "#19a97a", "#0c7f73"];
const segments = (values: number[]) => values.map((value, index) => ({ value, color: colors[index % colors.length] }));

export default function EvaluationComparison() {
    useDashboardData();
    const data = getEvaluacion().comparativasPorMateria ?? {};
    const promedios = Object.entries(data).filter(([, item]) => tieneNumero(item.promedio));
    const comparativas = Object.entries(data).filter(([, item]) => item.porcentajesJunio.length || item.porcentajesJulio.length);
    return <section className="space-y-4">
    {promedios.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2">{promedios.map(([materia, item]) => <Average key={materia} title={`PROMEDIO ${materia.toUpperCase()}`} value={item.promedio as number} variation={item.variacionRespectoJunio}/>)}</div>}
    {comparativas.length > 0 && <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">{comparativas.map(([materia, item]) => <Comparison key={materia} title={`${materia[0].toUpperCase() + materia.slice(1)} - Comparativa por niveles`} june={item.porcentajesJunio} july={item.porcentajesJulio}/>)}</div>}
    {promedios.length === 0 && comparativas.length === 0 && <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center"><p className="text-[12px] font-semibold text-[#526a80]">Sin resultados comparativos</p><p className="mt-2 text-[10px] text-[#8b9daf]">No hay comparativas por materia disponibles para este periodo.</p></article>}
    <BarreraCard />
  </section>;
}

function Average({ title, value, variation }: {
    title: string;
    value: number;
    variation: number | null;
}) {
    return <article className="rounded-[9px] border border-[#dce3ea] bg-white p-5"><p className="text-[11px] font-semibold uppercase text-[#6b7f92]">{title}</p><div className="mt-3 flex items-center gap-2"><strong className="text-[25px] text-[#263d52]">{formatoNumero(value)}</strong><span className="rounded bg-[#fff0d7] px-2 py-1 text-[10px] font-semibold text-[#dd8d15]">Medio</span></div>{tieneNumero(variation) && <p className="mt-2 text-[10px] text-[#e04444]">↘ {formatoNumero(variation)} vs Junio</p>}</article>;
}

function Comparison({ title, june, july }: {
    title: string;
    june: number[];
    july: number[];
}) {
    return <article className="rounded-[8px] border border-[#dce4ec] bg-white p-4"><h3 className="text-[13px] font-semibold text-[#334b60]">{title}</h3><p className="mt-1 text-[10px] text-[#8a9daf]">Porcentaje de estudiantes en cada nivel</p><div className="mt-4 rounded-[7px] border bg-[#fbfcfd] p-3"><Row label="Junio" values={june}/><div className="my-3 border-t"/><Row label="Julio" values={july}/><div className="mt-3 flex justify-between pl-[42px] text-[7px] text-[#667b8e]"><span>CRÍTICO (0-35)</span><span>EXCELENTE (66-100)</span></div></div></article>;
}

function Row({ label, values }: {
    label: string;
    values: number[];
}) {
    return <div className="flex items-center gap-2"><span className="w-[34px] text-[9px]">{label}</span><div className="flex h-[25px] flex-1 overflow-hidden rounded">{segments(values).map((item, index) => <div key={index} className="flex items-center justify-center text-[7px] font-semibold text-white" style={{ width: `${Math.min(Math.max(item.value, 0), 100)}%`, background: item.color }}>{formatoNumero(item.value)}%</div>)}</div></div>;
}
