"use client";
import { useState, type ReactNode } from "react";
import { BookOpenCheck, BriefcaseBusiness, CheckSquare, GraduationCap, TrendingUp, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";
import { useDashboardData } from "@/stores/DashboardDataContext";
import BackToSchoolSection from "./BackToSchoolSection";
import CampaignsNerdsPanel from "./CampaignsNerdsPanel";
const formatFormationTooltip = (_value: unknown, _name: unknown, item: { payload?: { percentage?: number } }) => [`${item.payload?.percentage ?? 0}%`, "% de cumplimiento"];
type MainTab = "observaciones" | "formacion" | "campanas";
type FormationGroup = {
    name: string;
    value?: number;
    total?: number;
    percentage: number;
    realizados?: number;
};
type BlockData = {
    block: string;
    activeDirectors: number;
    observations: number;
    observationsTarget: number;
    observationsPercentage: number;
    feedback: number;
    feedbackTarget: number;
    feedbackPercentage: number;
};
type ObservationSummary = {
    directoresActivos: string;
    porcentajeDirectoresActivos?: string | number;
    observacionesRealizadas: string;
    porcentajeObservacionesRealizadas?: string | number;
    retroalimentacionesRealizadas: string;
    porcentajeRetroalimentacionesRealizadas?: string | number;
};
type LegacyObservationBlock = {
    block?: string;
    label?: string;
    activeDirectors?: number;
    observations?: number;
    observationsTarget?: number;
    observationsPercentage?: number;
    feedback?: number;
    feedbackTarget?: number;
    feedbackPercentage?: number;
};
function toNumber(value: unknown) {
    return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
function formatPercentage(value: string | number | undefined) {
    if (value === undefined || value === "") return "0%";
    return String(value).endsWith("%") ? String(value) : `${value}%`;
}
function normalizeFormationGroup(item: FormationGroup) {
    return {
        name: item.name,
        value: toNumber(item.value) || toNumber(item.realizados),
        percentage: toNumber(item.percentage),
        total: toNumber(item.total),
    };
}
function sortFormationByBlock<T extends { name: string }>(items: T[]) {
    return [...items].sort((first, second) => {
        const firstNumber = Number(first.name.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
        const secondNumber = Number(second.name.match(/\d+/)?.[0] ?? Number.MAX_SAFE_INTEGER);
        return firstNumber - secondNumber || first.name.localeCompare(second.name);
    });
}
function formationScale(items: Array<{ value?: number }>) {
    const max = Math.max(0, ...items.map((item) => toNumber(item.value)));
    const step = Math.max(10, Math.ceil(max / 4 / 10) * 10);
    const top = Math.max(step * 4, Math.ceil(max / step) * step);
    return { domain: [0, top] as [number, number], ticks: [0, step, step * 2, step * 3, top] };
}
function normalizeBlock(item: LegacyObservationBlock): BlockData | null {
    const block = typeof item.block === "string" && item.block.trim().length > 0 ? item.block : typeof item.label === "string" && item.label.trim().length > 0 ? item.label : "";
    if (!block)
        return null;
    return {
        block,
        activeDirectors: toNumber(item.activeDirectors),
        observations: toNumber(item.observations),
        observationsTarget: toNumber(item.observationsTarget),
        observationsPercentage: toNumber(item.observationsPercentage),
        feedback: toNumber(item.feedback),
        feedbackTarget: toNumber(item.feedbackTarget),
        feedbackPercentage: toNumber(item.feedbackPercentage),
    };
}
function resolveObservationBlocks() {
    const gestionEscolar = dashboardDatabase.gestionEscolar as {
        observacionesPorBloque?: LegacyObservationBlock[];
        gestionOperativa?: {
            observaciones?: {
                bloques?: LegacyObservationBlock[];
            };
        };
    };
    const currentBlocks = gestionEscolar.gestionOperativa?.observaciones?.bloques;
    const legacyBlocks = gestionEscolar.observacionesPorBloque;
    const source = Array.isArray(currentBlocks) && currentBlocks.length > 0 ? currentBlocks : Array.isArray(legacyBlocks) ? legacyBlocks : [];
    return source.map(normalizeBlock).filter((item): item is BlockData => item !== null);
}
function resolveObservationSummary(blocks: BlockData[]) {
    const resumen = (dashboardDatabase.gestionEscolar.gestionOperativa as {
        observaciones?: {
            resumen?: Partial<ObservationSummary>;
        };
    })?.observaciones?.resumen;
    return {
        directoresActivos: resumen?.directoresActivos ?? String(blocks.reduce((sum, item) => sum + item.activeDirectors, 0)),
        porcentajeDirectoresActivos: resumen?.porcentajeDirectoresActivos,
        observacionesRealizadas: resumen?.observacionesRealizadas ?? String(blocks.reduce((sum, item) => sum + item.observations, 0)),
        porcentajeObservacionesRealizadas: resumen?.porcentajeObservacionesRealizadas,
        retroalimentacionesRealizadas: resumen?.retroalimentacionesRealizadas ?? String(blocks.reduce((sum, item) => sum + item.feedback, 0)),
        porcentajeRetroalimentacionesRealizadas: resumen?.porcentajeRetroalimentacionesRealizadas,
    };
}
export default function OperationalManagementPageCurrent() {
    useDashboardData();
    const [mainTab, setMainTab] = useState<MainTab>("observaciones");
    const operationalData = dashboardDatabase.gestionEscolar.gestionOperativa as {
        formacion: {
            participantes: string;
            secciones: string;
            grupos: FormationGroup[];
        };
    };
    const formationByBlock = sortFormationByBlock((operationalData.formacion?.grupos ?? []).map(normalizeFormationGroup));
    const formationAxis = formationScale(formationByBlock);
    const observationBlocks = sortDescendingByNumber(resolveObservationBlocks(), (item) => Math.max(item.observationsPercentage, item.feedbackPercentage));
    const observationSummary = resolveObservationSummary(observationBlocks);
    return <main className="min-h-screen bg-[#f4f7fb] px-4 py-5 text-[#223b53] sm:px-6"><div className="mx-auto max-w-[1280px]">
    <div className="flex items-start justify-between gap-4"><div><h1 className="text-[18px] font-semibold tracking-[.04em] text-[#27435c]">GESTION OPERATIVA</h1></div><BackToSchoolSection className="rounded-lg border border-[#d8e0e8] bg-white px-4 py-2 text-[10px] text-[#667b90] transition hover:bg-[#f8fafc]">← Volver</BackToSchoolSection></div>
    <div className="mt-5 flex flex-wrap gap-2"><TabButton active={mainTab === "observaciones"} onClick={() => setMainTab("observaciones")}>Observaciones de clases</TabButton><TabButton active={mainTab === "formacion"} onClick={() => setMainTab("formacion")}>Formacion de directores</TabButton><TabButton compact active={mainTab === "campanas"} onClick={() => setMainTab("campanas")}>Campañas</TabButton></div>
    {mainTab === "campanas" ? <CampaignsNerdsPanel /> : mainTab === "formacion" ? <>
      <div className="mt-8 flex items-start justify-between"><div><h2 className="text-[16px] font-semibold tracking-[.04em] text-[#29455f]">FORMACION DE DIRECTORES</h2></div><GraduationCap className="h-4 w-4 text-[#8ba0b6]"/></div>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"><MetricCard title="DIRECTORES PARTICIPANTES" value={operationalData.formacion?.participantes ?? "0"} subtitle="Total de registros de formacion" color="blue" icon={<Users className="h-4 w-4"/>}/><MetricCard title="SECCIONES" value={operationalData.formacion?.secciones ?? "0"} subtitle="Total de secciones registradas" color="purple" icon={<BookOpenCheck className="h-4 w-4"/>}/></div>
      <div className="mt-4 rounded-xl border border-[#d9e1e8] bg-white p-5"><h3 className="text-[13px] font-semibold text-[#29455f]">Formacion por bloque</h3><p className="mt-1 text-[10px] text-[#8ea1b5]">Directores participantes y porcentaje de cumplimiento por grupo</p><div className="mt-4 h-[280px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={formationByBlock} margin={{ top: 28, right: 10, left: 0, bottom: 0 }} barCategoryGap="30%"><CartesianGrid vertical={false} stroke="#e8edf3" strokeDasharray="3 3"/><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#60778d", fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8da0b5", fontSize: 11 }} domain={formationAxis.domain} ticks={formationAxis.ticks}/><Tooltip cursor={{ fill: "rgba(36,109,193,.05)" }} formatter={formatFormationTooltip} contentStyle={{ borderRadius: 10, border: "1px solid #d9e1e8", boxShadow: "0 6px 20px rgba(15,23,42,.08)", fontSize: 12 }}/><Bar dataKey="value" name="Participantes" radius={[4, 4, 0, 0]} barSize={28}>{formationByBlock.map((item, index) => <Cell key={`formation-cell-${index}`} fill="#246dc1"/>)}<LabelList dataKey="value" position="top" formatter={(value: unknown) => Number(value).toLocaleString("es-SV")} fill="#52687c" fontSize={10}/></Bar></BarChart></ResponsiveContainer></div></div>
    </> : <ObservationsPanel observationSummary={observationSummary} observationBlocks={observationBlocks}/>}
  </div></main>;
}
function ObservationsPanel({ observationSummary, observationBlocks }: {
    observationSummary: ObservationSummary;
    observationBlocks: BlockData[];
}) { return <section className="mt-8"><div><h2 className="text-[15px] font-semibold tracking-[.04em] text-[#29455f]">OBSERVACIONES DE CLASES</h2></div><div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3"><TopMetric icon={<BriefcaseBusiness className="h-4 w-4"/>} title="DIRECTORES ACTIVOS" value={observationSummary.directoresActivos} percentage={formatPercentage(observationSummary.porcentajeDirectoresActivos)} description="Total de directores activos" color="blue"/><TopMetric icon={<CheckSquare className="h-4 w-4"/>} title="OBSERVACIONES REALIZADAS" value={observationSummary.observacionesRealizadas} percentage={formatPercentage(observationSummary.porcentajeObservacionesRealizadas)} description="Total de clases observadas" color="green"/><TopMetric icon={<TrendingUp className="h-4 w-4"/>} title="RETROALIMENTACIONES REALIZADAS" value={observationSummary.retroalimentacionesRealizadas} percentage={formatPercentage(observationSummary.porcentajeRetroalimentacionesRealizadas)} description="Total de retroalimentaciones" color="purple"/></div><div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{observationBlocks.map((item) => <BlockCard key={item.block} data={item}/>)}</div></section>; }
function TabButton({ active, compact = false, onClick, children }: {
    active: boolean;
    compact?: boolean;
    onClick: () => void;
    children: ReactNode;
}) { return <button type="button" onClick={onClick} className={`rounded-lg border bg-white h-[29px] justify-center px-3 py-0 text-[10px] ${compact ? "w-auto px-2" : "w-[170px]"} font-medium transition ${active ? "border-[#1e63b7] text-[#1e63b7] shadow-sm" : "border-[#d8e0e8] text-[#5f758b]"}`}>{children}</button>; }
function MetricCard({ title, value, subtitle, color, icon }: {
    title: string;
    value: string;
    subtitle: string;
    color: "blue" | "purple";
    icon: ReactNode;
}) { const style = color === "blue" ? { bg: "bg-[#eaf3ff]", text: "text-[#176dcc]" } : { bg: "bg-[#f2ecff]", text: "text-[#7b3ff2]" }; return <div className="min-h-[124px] rounded-xl border border-[#d9e1e8] bg-white p-4"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${style.bg} ${style.text}`}>{icon}</span><span className="text-[10px] font-semibold uppercase tracking-[.06em] text-[#5f758b]">{title}</span></div><p className={`mt-5 text-[28px] font-medium leading-none ${style.text}`}>{value}</p><p className="mt-3 text-[10px] text-[#8ea1b5]">{subtitle}</p></div>; }
function TopMetric({ icon, title, value, percentage, description, color }: {
    icon: ReactNode;
    title: string;
    value: string;
    percentage: string;
    description: string;
    color: "blue" | "green" | "purple";
}) { const config = { blue: { bg: "bg-[#eaf3ff]", text: "text-[#176dcc]", hex: "#176dcc" }, green: { bg: "bg-[#eaf8ef]", text: "text-[#168642]", hex: "#168642" }, purple: { bg: "bg-[#f2ecff]", text: "text-[#7b3ff2]", hex: "#7b3ff2" } }[color]; const numericPercentage = Number(percentage.replace("%", "")); const angle = Number.isFinite(numericPercentage) ? numericPercentage * 3.6 : 0; return <div className="min-h-[142px] rounded-[10px] border border-[#d9e1e8] bg-white p-4"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-[7px] ${config.bg} ${config.text}`}>{icon}</span><span className="text-[8px] font-semibold uppercase tracking-[.05em] text-[#60778d]">{title}</span></div><div className="mt-5 flex items-center justify-between gap-4"><p className={`text-[31px] font-medium leading-none ${config.text}`}>{value}</p><span className="relative flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-full" style={{ background: `conic-gradient(${config.hex} 0deg ${angle}deg, #e9eff5 ${angle}deg 360deg)` }}><span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-white text-[13px] font-semibold" style={{ color: config.hex }}>{percentage}</span></span></div><p className="mt-3 text-[8px] text-[#8fa1b5]">{description}</p></div>; }
function BlockCard({ data }: {
    data: BlockData;
}) { return <article className="rounded-[10px] border border-[#d9e1e8] bg-white p-4"><div className="flex items-start justify-between"><div><h3 className="text-[12px] font-semibold text-[#223c52]">{data.block}</h3><p className="mt-2 text-[7px] text-[#8fa1b5]">Seguimiento semanal</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-[#edf5ff]"><BriefcaseBusiness className="h-4 w-4 text-[#176dcc]"/></span></div><div className="mt-4 flex min-h-[45px] items-center justify-between rounded-[7px] border border-[#dfe6ed] px-3"><span className="text-[7px] font-semibold uppercase tracking-[.04em] text-[#8297af]">DIRECTORES ACTIVOS</span><span className="text-[17px] font-medium text-[#126fd0]">{data.activeDirectors}</span></div><BlockProgress title="OBSERVACIONES REALIZADAS" value={data.observations} target={data.observationsTarget} percentage={data.observationsPercentage} color="#168642"/><BlockProgress title="RETROALIMENTACIONES" value={data.feedback} target={data.feedbackTarget} percentage={data.feedbackPercentage} color="#7b3ff2"/></article>; }
function BlockProgress({ title, value, target, percentage, color }: {
    title: string;
    value: number;
    target: number;
    percentage: number;
    color: string;
}) { return <div className="mt-3 rounded-[7px] border border-[#dfe6ed] px-3 py-3"><div className="flex items-start justify-between gap-3"><div><p className="text-[7px] font-semibold uppercase tracking-[.04em] text-[#8297af]">{title}</p><p className="mt-1 text-[6px] text-[#8fa1b5]">Meta: {target} / semana</p></div><span className="text-[16px] font-medium" style={{ color }}>{value}</span></div><div className="mt-3 h-[5px] overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}/></div><div className="mt-2 flex items-center justify-between"><span className="text-[6px] text-[#8fa1b5]">Avance</span><span className="text-[6px] font-medium text-[#52687c]">{percentage}%</span></div></div>; }
