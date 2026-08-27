"use client";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Headphones, icons as lucideIcons, PhoneCall, ShieldAlert, Users, type LucideIcon } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { useDashboardData } from "@/stores/DashboardDataContext";
type NoAccessHistoryItem = {
    fecha: string;
    valor: number;
};
type NoAccessAction = {
    title: string;
    description: string;
    icon: string;
};
type NoAccessSummaryItem = {
    title: string;
    value: string;
    subtitle: string;
    color: keyof typeof teacherCardStyles;
    icon: keyof typeof teacherCardIcons;
};
type PlatformKey = "ihfb" | "kira";
type EvolutionRow = {
    day: string;
    ihfb?: number;
    kira?: number;
};
const icons = { users: Users, headphones: Headphones, phone: PhoneCall, check: CheckCircle2 };
const teacherCardStyles = {
    orange: { color: "text-[#f08a00]", iconColor: "text-[#f08a00]", iconBg: "bg-[#fff5e8]" },
    blue: { color: "text-[#1f6fe5]", iconColor: "text-[#1f6fe5]", iconBg: "bg-[#eef5ff]" },
    purple: { color: "text-[#7b4dff]", iconColor: "text-[#7b4dff]", iconBg: "bg-[#f4efff]" },
    green: { color: "text-[#1a8f4a]", iconColor: "text-[#1a8f4a]", iconBg: "bg-[#edf9f1]" },
};
const teacherCardIcons = { shield: ShieldAlert, clipboard: ClipboardList };
function getNoAccessData() {
    return dashboardDatabase.gestionEscolar?.noAccesos;
}
function normalizeNumericValue(value: unknown) {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string") {
        const parsed = Number(value.replace(/,/g, "").trim());
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}
function normalizeDayLabel(value: unknown) {
    return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}
function normalizeRowShape(item: unknown): EvolutionRow | null {
    if (typeof item !== "object" || item === null || Array.isArray(item))
        return null;
    const row = item as Record<string, unknown>;
    const day = normalizeDayLabel(row.day ?? row.fecha ?? row.date ?? row.dia ?? row.label);
    if (!day)
        return null;
    const ihfb = normalizeNumericValue(row.ihfb ?? row.IHFB ?? row.ihfbValor ?? row.valorIhfb ?? row.noAccesosIhfb);
    const kira = normalizeNumericValue(row.kira ?? row.KIRA ?? row.kiraValor ?? row.valorKira ?? row.noAccesosKira);
    if (ihfb === undefined && kira === undefined)
        return null;
    return { day, ihfb, kira };
}
function normalizeSeriesShape(source: Record<string, unknown>) {
    const rows = new Map<string, EvolutionRow>();
    const labels = source.labels ?? source.dias ?? source.fechas ?? source.fechasCorte;
    const labelList = Array.isArray(labels) ? labels : [];
    for (const platform of ["ihfb", "kira"] as const satisfies PlatformKey[]) {
        const rawPoints = source[platform] ?? source[platform.toUpperCase()];
        if (!Array.isArray(rawPoints))
            continue;
        for (const [index, point] of rawPoints.entries()) {
            const rowPoint = typeof point === "object" && point !== null && !Array.isArray(point) ? point as Record<string, unknown> : null;
            const day = normalizeDayLabel(rowPoint?.day ?? rowPoint?.fecha ?? rowPoint?.date ?? rowPoint?.dia ?? rowPoint?.label ?? labelList[index] ?? String(index + 1));
            const value = normalizeNumericValue(rowPoint ? rowPoint.value ?? rowPoint.valor ?? rowPoint[platform] ?? rowPoint[platform.toUpperCase()] : point);
            if (!day || value === undefined)
                continue;
            const row = rows.get(day) ?? { day };
            row[platform] = value;
            rows.set(day, row);
        }
    }
    return Array.from(rows.values());
}
function getNoAccessEvolution(source: unknown): EvolutionRow[] {
    if (Array.isArray(source)) {
        return source
            .map((item) => normalizeRowShape(item))
            .filter((item): item is EvolutionRow => item !== null);
    }
    if (typeof source === "object" && source !== null) {
        return normalizeSeriesShape(source as Record<string, unknown>);
    }
    return [];
}
function normalizeSummaryTitle(value: string) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
function buildStyledCard(item: NoAccessSummaryItem) {
    return {
        ...item,
        ...teacherCardStyles[item.color] ?? teacherCardStyles.orange,
        icon: teacherCardIcons[item.icon] ?? ShieldAlert,
    };
}
function createHistoryCard(type: "teacher" | "class", value: string) {
    if (type === "teacher") {
        return {
            ...buildStyledCard({
                title: "DOCENTES NO ACCESOS",
                value,
                subtitle: "Historial de docentes sin acceso",
                color: "blue",
                icon: "shield",
            }),
            value,
        };
    }
    return {
        ...buildStyledCard({
            title: "NÚMERO DE CLASES",
            value,
            subtitle: "Historial de clases registradas",
            color: "purple",
            icon: "clipboard",
        }),
        value,
    };
}
export default function SchoolNoAccessDashboard() {
    const { snapshotDate } = useDashboardData();
    const noAccess = getNoAccessData();
    if (!noAccess)
        return null;
    const preserveAugust13Design = snapshotDate === "2026-08-13";
    const noAccessData = getNoAccessEvolution(noAccess.evolucion);
    const limitations = Array.isArray(noAccess.limitaciones) ? noAccess.limitaciones : [];
    const actions = (Array.isArray(noAccess.acciones) ? noAccess.acciones : []).map((action) => ({
        ...(action as NoAccessAction),
        icon: (lucideIcons as Record<string, LucideIcon>)[(action as NoAccessAction).icon] ?? icons[(action as NoAccessAction).icon as keyof typeof icons] ?? Users,
    }));
    return <section className="bg-[#f7f9fc] px-4 py-8 text-[#14213d] sm:px-6"><div className="mx-auto w-full max-w-[1020px]">
    <TeacherNoAccessPanel />
    <div className="mt-6 grid gap-5 border-t border-[#e0e7ef] pt-6 xl:grid-cols-[1.45fr_.75fr]">
      <article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><div><h2 className="text-[17px] font-semibold">Evolución de no accesos</h2><p className="mt-1 text-[11px] text-[#8996a8]">Seguimiento diario por clases</p></div>
        <div className="mt-6 flex flex-col gap-4">
          <PlatformEvolutionChart data={noAccessData} platform="ihfb" label="IHFB" color="#4b82ee" preserveAugust13Design={preserveAugust13Design}/>
          <PlatformEvolutionChart data={noAccessData} platform="kira" label="KIRA" color="#a68af4" preserveAugust13Design={preserveAugust13Design}/>
        </div>
      </article>
      <div className="space-y-5"><article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><p className="text-[10px] font-semibold uppercase text-[#8c98a9]">Plan operativo</p><h2 className="mt-2 text-[17px] font-semibold">Principales acciones</h2><div className="mt-5 space-y-3">{actions.map((action, index) => { const Icon = action.icon; return <div key={`${action.title}-${index}`} className="flex gap-3 rounded-[11px] bg-[#f8fafc] p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff]"><Icon className="h-4 w-4"/></span><div><p className="text-[12px] font-semibold">{action.title}</p><p className="mt-1 text-[10px] text-[#8491a3]">{action.description}</p></div></div>; })}</div></article>
      <article className="rounded-[16px] border border-[#f0dfdf] bg-white p-5"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1f1]"><AlertTriangle className="h-4 w-4 text-[#db5656]"/></span><div><p className="text-[10px] font-semibold uppercase text-[#aa7d7d]">Riesgos operativos</p><h2 className="mt-1 text-[17px] font-semibold">Limitaciones</h2></div></div><div className="mt-5 space-y-3">{limitations.map((item, index) => <div key={`${item}-${index}`} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[10px]">{index + 1}</span><p className="text-[11px] leading-5">{item}</p></div>)}</div></article></div>
    </div>
  </div></section>;
}
function TeacherNoAccessPanel() {
    const { snapshotDate } = useDashboardData();
    const noAccess = getNoAccessData();
    const teacherHistory = Array.isArray(noAccess?.historialDocentes) ? noAccess.historialDocentes as NoAccessHistoryItem[] : [];
    const classHistory = Array.isArray(noAccess?.historialClases) ? noAccess.historialClases as NoAccessHistoryItem[] : [];
    const summary = Array.isArray(noAccess?.resumen) ? noAccess.resumen as NoAccessSummaryItem[] : [];
    const teacherDefaultDate = teacherHistory.at(-1)?.fecha ?? "";
    const classDefaultDate = classHistory.at(-1)?.fecha ?? "";
    const [selectedTeacherDate, setSelectedTeacherDate] = useState(teacherDefaultDate);
    const [selectedClassDate, setSelectedClassDate] = useState(classDefaultDate);
    const applyAugust20Fix = snapshotDate === "2026-08-20";
    const effectiveTeacherDate = applyAugust20Fix ? (selectedTeacherDate || teacherDefaultDate) : selectedTeacherDate;
    const effectiveClassDate = applyAugust20Fix ? (selectedClassDate || classDefaultDate) : selectedClassDate;
    const teacherKpis = summary.map(buildStyledCard);
    const selectedTeacherValue = teacherHistory.find((item) => item.fecha === effectiveTeacherDate)?.valor.toString() ?? teacherHistory.at(-1)?.valor.toString() ?? "0";
    const selectedClassValue = classHistory.find((item) => item.fecha === effectiveClassDate)?.valor.toString() ?? classHistory.at(-1)?.valor.toString() ?? "0";
    const teacherCard = teacherKpis.find((item) => normalizeSummaryTitle(item.title).includes("docente")) ?? (teacherHistory.length > 0 ? createHistoryCard("teacher", selectedTeacherValue) : null);
    const classCard = teacherKpis.find((item) => normalizeSummaryTitle(item.title).includes("clase")) ?? (classHistory.length > 0 ? createHistoryCard("class", selectedClassValue) : null);
    const otherCards = teacherKpis.filter((item) => !normalizeSummaryTitle(item.title).includes("docente") && !normalizeSummaryTitle(item.title).includes("clase"));
    return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-[28px] font-semibold tracking-tight text-[#22304d]">NO ACCESOS</h2>
      <Link href="/gestion-escolar/gestion-operativa" className="rounded-md border border-[#d9e0ea] bg-white px-4 py-2 text-[11px] font-medium text-[#475467] shadow-sm transition hover:border-[#2f6fec] hover:text-[#2f6fec]">Gestión operativa</Link>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <>
        {teacherCard && <TeacherKpiCard key={teacherCard.title} {...teacherCard} value={selectedTeacherValue} dateOptions={teacherHistory} selectedDate={effectiveTeacherDate} onDateChange={setSelectedTeacherDate}/>}
        {classCard && <TeacherKpiCard key={classCard.title} {...classCard} value={selectedClassValue} dateOptions={classHistory} selectedDate={effectiveClassDate} onDateChange={setSelectedClassDate}/>}
        {otherCards.map((item) => <TeacherKpiCard key={item.title} {...item}/>)}
      </>
    </div>
  </div>;
}
type TeacherCardProps = {
    title: string;
    value: string;
    subtitle: string;
    color: string;
    icon: React.ElementType;
    iconColor: string;
    iconBg: string;
    extra?: string;
    dateOptions?: NoAccessHistoryItem[];
    selectedDate?: string;
    onDateChange?: (date: string) => void;
};
function TeacherKpiCard({ title, value, subtitle, color, icon: Icon, iconColor, iconBg, extra, dateOptions, selectedDate, onDateChange }: TeacherCardProps) { return <div className="rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}><Icon className={`h-4 w-4 ${iconColor}`}/></div><p className="text-[11px] font-semibold tracking-wide text-[#667085]">{title}</p></div>{dateOptions && dateOptions.length > 0 && <div className="mb-5"><div className="mb-2 flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[.08em] text-[#98a2b3]"><CalendarDays className="h-3 w-3"/>Fecha de corte</div><div className="flex gap-1.5">{dateOptions.map((item) => <button key={item.fecha} type="button" aria-pressed={selectedDate === item.fecha} onClick={() => onDateChange?.(item.fecha)} className={`flex-1 rounded-md border px-2 py-1.5 text-[9px] font-medium transition ${selectedDate === item.fecha ? "border-[#f08a00] bg-[#fff7eb] text-[#d87900]" : "border-[#e1e6ec] text-[#7b8794] hover:border-[#f1b45f]"}`}>{formatShortDate(item.fecha)}</button>)}</div></div>}<div className="flex items-end gap-1"><span className={`text-[38px] font-semibold leading-none ${color}`}>{Number(value).toLocaleString("es-SV")}</span>{extra ? <span className="mb-1 text-[12px] font-semibold text-[#667085]">{extra}</span> : null}</div><p className="mt-3 text-[11px] text-[#98a2b3]">{subtitle}</p></div>; }
function formatShortDate(value: string) { const [, month, day] = value.split("-"); const months: Record<string, string> = { "01": "ENE", "02": "FEB", "03": "MAR", "04": "ABR", "05": "MAY", "06": "JUN", "07": "JUL", "08": "AGO", "09": "SEP", "10": "OCT", "11": "NOV", "12": "DIC" }; return `${day} ${months[month]}`; }
function formatChartDayLabel(value: string) {
    const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        const [, , month, day] = isoMatch;
        const months: Record<string, string> = { "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun", "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic" };
        return `${day} ${months[month]}`;
    }
    const longDateMatch = value.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+),\s*(\d{1,2})\s+de\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)(?:\s+de\s+\d{4})?$/i);
    if (longDateMatch) {
        const [, weekday, day, month] = longDateMatch;
        const shortWeekday = weekday.slice(0, 3);
        const shortMonth = month.slice(0, 3);
        return `${shortWeekday} ${day} ${shortMonth}`;
    }
    return value;
}
function PlatformEvolutionChart({ data, platform, label, color, preserveAugust13Design }: {
    data: Array<{
        day: string;
        ihfb?: number;
        kira?: number;
    }>;
    platform: "ihfb" | "kira";
    label: string;
    color: string;
    preserveAugust13Design?: boolean;
}) { return <div className="rounded-xl border border-[#e5eaf0] bg-[#fbfcfe] p-3"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#526176]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }}/>{label}</div><div className="h-[285px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={preserveAugust13Design ? { top: 15, right: 14, bottom: 5, left: 0 } : { top: 15, right: 14, bottom: 26, left: 0 }}><CartesianGrid vertical={false} stroke="#e7ecf2" strokeDasharray="3 3"/><XAxis dataKey="day" tickFormatter={preserveAugust13Design ? undefined : formatChartDayLabel} axisLine={false} tickLine={false} interval={preserveAugust13Design ? undefined : 0} minTickGap={preserveAugust13Design ? undefined : 0} height={preserveAugust13Design ? undefined : 42} angle={preserveAugust13Design ? undefined : -35} textAnchor={preserveAugust13Design ? undefined : "end"} tick={{ fill: "#56667b", fontSize: 9 }}/><YAxis domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} axisLine={false} tickLine={false} width={38} tick={{ fill: "#748397", fontSize: 9 }}/><Tooltip labelFormatter={preserveAugust13Design ? undefined : (value) => String(value)} formatter={(value) => [Number(value).toLocaleString(), label]}/><Line type="monotone" dataKey={platform} name={label} stroke={color} strokeWidth={3} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }}/></LineChart></ResponsiveContainer></div></div>; }

