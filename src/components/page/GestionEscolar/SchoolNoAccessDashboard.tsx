"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Headphones, icons as lucideIcons, PhoneCall, TrendingUp, Users, type LucideIcon } from "lucide-react";
import { CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { useDashboardData } from "@/stores/DashboardDataContext";
<<<<<<< Updated upstream
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
    const ihfb = normalizeNumericValue(row.ihfb ?? row.IHFB);
    const kira = normalizeNumericValue(row.kira ?? row.KIRA);
    if (ihfb === undefined && kira === undefined)
        return null;
    return { day, ihfb, kira };
}
function normalizeSeriesShape(source: Record<string, unknown>) {
    const rows = new Map<string, EvolutionRow>();
    for (const platform of ["ihfb", "kira"] as const satisfies PlatformKey[]) {
        const rawPoints = source[platform] ?? source[platform.toUpperCase()];
        if (!Array.isArray(rawPoints))
            continue;
        for (const point of rawPoints) {
            if (typeof point !== "object" || point === null || Array.isArray(point))
                continue;
            const rowPoint = point as Record<string, unknown>;
            const day = normalizeDayLabel(rowPoint.day ?? rowPoint.fecha ?? rowPoint.date ?? rowPoint.dia ?? rowPoint.label);
            const value = normalizeNumericValue(rowPoint.value ?? rowPoint.valor ?? rowPoint[platform] ?? rowPoint[platform.toUpperCase()]);
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
=======
>>>>>>> Stashed changes

type HistoryItem = { fecha: string; valor: number; porcentaje?: number };
type EvolutionRow = { day: string; ihfb?: number; kira?: number };
type Platform = "ihfb" | "kira";
type Action = { title: string; description: string; icon: string };
const icons = { users: Users, headphones: Headphones, phone: PhoneCall, check: CheckCircle2 };
const noAccess = () => dashboardDatabase.gestionEscolar?.noAccesos;

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") { const parsed = Number(value.replace(/,/g, "").trim()); return Number.isFinite(parsed) ? parsed : undefined; }
  return undefined;
}
function hasMeaningfulData(value: unknown): boolean {
  if (value === null || value === undefined || value === "" || value === 0 || value === false) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasMeaningfulData);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasMeaningfulData);
  return true;
}
function teacherHistory(value: unknown) {
  if (Array.isArray(value)) return { universoDocentes: undefined, registros: value as HistoryItem[] };
  if (!value || typeof value !== "object") return { universoDocentes: undefined, registros: [] as HistoryItem[] };
  const history = value as Record<string, unknown>;
  return { universoDocentes: numberValue(history.universoDocentes), registros: Array.isArray(history.registros) ? history.registros as HistoryItem[] : [] };
}
function label(value: unknown) { return typeof value === "string" && value.trim() ? value.trim() : undefined; }
function evolution(source: unknown): EvolutionRow[] {
  if (Array.isArray(source)) return source.flatMap((item) => { if (!item || typeof item !== "object" || Array.isArray(item)) return []; const row = item as Record<string, unknown>; const day = label(row.day ?? row.fecha ?? row.date ?? row.dia ?? row.label); const ihfb = numberValue(row.ihfb ?? row.IHFB ?? row.ihfbValor ?? row.valorIhfb ?? row.noAccesosIhfb); const kira = numberValue(row.kira ?? row.KIRA ?? row.kiraValor ?? row.valorKira ?? row.noAccesosKira); return day && (ihfb !== undefined || kira !== undefined) ? [{ day, ihfb, kira }] : []; });
  if (!source || typeof source !== "object") return [];
  const value = source as Record<string, unknown>; const labels = (value.labels ?? value.dias ?? value.fechas ?? value.fechasCorte); const labelList = Array.isArray(labels) ? labels : []; const rows = new Map<string, EvolutionRow>();
  ([("ihfb"), ("kira")] as Platform[]).forEach((platform) => { const points = value[platform] ?? value[platform.toUpperCase()]; if (!Array.isArray(points)) return; points.forEach((point, index) => { const objectPoint = point && typeof point === "object" && !Array.isArray(point) ? point as Record<string, unknown> : null; const day = label(objectPoint?.day ?? objectPoint?.fecha ?? objectPoint?.date ?? objectPoint?.dia ?? objectPoint?.label ?? labelList[index] ?? String(index + 1)); const current = numberValue(objectPoint ? objectPoint.value ?? objectPoint.valor ?? objectPoint[platform] ?? objectPoint[platform.toUpperCase()] : point); if (day && current !== undefined) rows.set(day, { ...(rows.get(day) ?? { day }), [platform]: current }); }); });
  return Array.from(rows.values());
}

export default function SchoolNoAccessDashboard() {
  const { snapshotDate } = useDashboardData(); const data = noAccess(); if (!data) return null;
  const actions = (Array.isArray(data.acciones) ? data.acciones : []).map((item) => { const action = item as Action; return { ...action, icon: (lucideIcons as Record<string, LucideIcon>)[action.icon] ?? icons[action.icon as keyof typeof icons] ?? Users }; });
  const limitations = Array.isArray(data.limitaciones) ? data.limitaciones : [];
  return <section className="bg-[#f7f9fc] px-4 py-8 text-[#14213d] sm:px-6"><div className="mx-auto w-full max-w-[1020px]"><TeacherNoAccessPanel /><WeeklyNoAccessCards /><div className="mt-6 grid gap-5 border-t border-[#e0e7ef] pt-6 xl:grid-cols-[1.45fr_.75fr]"><article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-[17px] font-semibold">Evolución de no accesos</h2><p className="mt-1 text-[11px] text-[#8996a8]">Seguimiento diario por clases</p></div><TrendingUp className="h-4 w-4 text-[#8ea4ba]" /></div><div className="mt-6 flex flex-col gap-4"><PlatformChart data={evolution(data.evolucion)} platform="ihfb" label="IHFB" color="#4b82ee" compact={snapshotDate === "2026-08-13"} /><PlatformChart data={evolution(data.evolucion)} platform="kira" label="KIRA" color="#a68af4" compact={snapshotDate === "2026-08-13"} /></div></article><div className="space-y-5"><article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><p className="text-[10px] font-semibold uppercase text-[#8c98a9]">Plan operativo</p><h2 className="mt-2 text-[17px] font-semibold">Principales acciones</h2><div className="mt-5 space-y-3">{actions.map((action, index) => { const Icon = action.icon; return <div key={`${action.title}-${index}`} className="flex gap-3 rounded-[11px] bg-[#f8fafc] p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff]"><Icon className="h-4 w-4" /></span><div><p className="text-[12px] font-semibold">{action.title}</p><p className="mt-1 text-[10px] text-[#8491a3]">{action.description}</p></div></div>; })}</div></article><article className="rounded-[16px] border border-[#f0dfdf] bg-white p-5"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1f1]"><AlertTriangle className="h-4 w-4 text-[#db5656]" /></span><div><p className="text-[10px] font-semibold uppercase text-[#aa7d7d]">Riesgos operativos</p><h2 className="mt-1 text-[17px] font-semibold">Limitaciones</h2></div></div><div className="mt-5 space-y-3">{limitations.map((item, index) => <div key={`${item}-${index}`} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[10px]">{index + 1}</span><p className="text-[11px] leading-5">{item}</p></div>)}</div></article></div></div></div></section>;
}

function TeacherNoAccessPanel() { const data = noAccess(); const teachers = teacherHistory(data?.historialDocentes); const classes = Array.isArray(data?.historialClases) ? data.historialClases as HistoryItem[] : []; const hasTeachers = hasMeaningfulData(teachers.registros); const hasClasses = hasMeaningfulData(classes); if (!hasTeachers && !hasClasses) return null; return <div><div className="mb-4 flex flex-wrap items-center justify-between gap-4"><h2 className="text-sm font-semibold tracking-[.04em] text-[#20394e]">NO ACCESOS DIARIOS</h2><Link href="/gestion-escolar/gestion-operativa" className="rounded-md border border-[#d9e0ea] bg-white px-4 py-2 text-[11px] font-medium text-[#475467] shadow-sm transition hover:border-[#2f6fec] hover:text-[#2f6fec]">Gestión operativa</Link></div><div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{hasTeachers && <HistoryChart title="DOCENTES NO ACCESOS DIARIOS" subtitle={teachers.universoDocentes ? `Universo de docentes: ${teachers.universoDocentes.toLocaleString("es-SV")}` : ""} data={teachers.registros} color="#1f6fe5" />}{hasClasses && <HistoryChart title="NÚMERO DE CLASES DIARIO" subtitle="" data={classes} color="#7b4dff" />}</div></div>; }

function WeeklyNoAccessCards() { const school = dashboardDatabase.gestionEscolar; const weekly = school?.noAccesosSemanal as Record<string, unknown> | undefined; const motives = Array.isArray(school?.motivosCriticos) ? school.motivosCriticos : []; const showWeekly = hasMeaningfulData(weekly); const motiveData = motives.flatMap((item) => { if (!item || typeof item !== "object" || Array.isArray(item)) return []; const row = item as Record<string, unknown>; const name = typeof row.motivo === "string" ? row.motivo : ""; const value = numberValue(row.porcentaje); const real = numberValue(row.datoReal); return name && value !== undefined && real !== undefined ? [{ name, value, real }] : []; }).sort((first, second) => second.real - first.real).slice(0, 5); const showMotives = motiveData.length > 0; if (!showWeekly && !showMotives) return null; const colors = ["#1f6fe5", "#7b4dff", "#f08a00", "#1a8f4a", "#db5656"]; return <section className="mt-6">{showWeekly && <><h2 className="mb-4 text-sm font-semibold tracking-[.04em] text-[#20394e]">NO ACCESOS SEMANAL</h2><div className="grid grid-cols-1 gap-4 md:grid-cols-2"><article className="rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#526176]">Docentes sin acceso</p><p className="mt-3 text-3xl font-semibold text-[#1f6fe5]">{Number(weekly?.docentesSinAcceso ?? 0).toLocaleString("es-SV")}</p><p className="mt-2 text-[9px] text-[#98a2b3]">Dato semanal</p></article><article className="rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><p className="text-[10px] font-semibold uppercase tracking-wide text-[#526176]">Número de clases</p><p className="mt-3 text-3xl font-semibold text-[#7b4dff]">{Number(weekly?.numeroDeClases ?? 0).toLocaleString("es-SV")}</p><p className="mt-2 text-[9px] text-[#98a2b3]">Dato semanal</p></article></div></>}{showMotives && <><div className="mt-6"><h2 className="text-sm font-semibold tracking-[.04em] text-[#20394e]">MOTIVOS</h2></div><article className="mt-3 rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><p className="text-[9px] text-[#98a2b3]">CRÍTICOS</p><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_280px]"><div className="h-[280px]"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={motiveData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="80%" outerRadius="100%" cornerRadius="50%" paddingAngle={5} label={{ position: "inside", fill: "#fff", fontSize: 10, fontWeight: 700, formatter: (value: number) => `${value}%` }} stroke="none">{motiveData.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(_value, _name, item) => [Number(item?.payload?.real).toLocaleString("es-SV"), item?.payload?.name ?? "Motivo"]} /></PieChart></ResponsiveContainer></div><div className="flex flex-col justify-center gap-3 text-[11px] text-[#526176]">{motiveData.map((item, index) => <div key={item.name} className="flex items-center gap-3"><span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} /><span className="min-w-0 flex-1">{item.name}</span><span className="font-semibold">{item.real.toLocaleString("es-SV")}</span></div>)}</div></div></article></>}</section>; }

function dateLabel(value: string) { const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/); const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]; const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]; if (match) { const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])); return `${weekdays[date.getDay()].replace(/^./, (letter) => letter.toUpperCase())} ${match[3]}, ${months[Number(match[2]) - 1]}`; } const longDate = value.match(/^([A-Za-zÁÉÍÓÚáéíóúñÑ]+),?\s*(\d{1,2})\s+de\s+([A-Za-zÁÉÍÓÚáéíóúñÑ]+)/i); if (longDate) return `${longDate[1].replace(/^./, (letter) => letter.toUpperCase())} ${longDate[2]}, ${longDate[3].toLowerCase()}`; return value; }
function dailyDateLabel(value: string) { const match = value.match(/^(\\d{4})-(\\d{2})-(\\d{2})$/); const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]; return match ? `${Number(match[3])} ${months[Number(match[2]) - 1]}` : value; }; function fullDateLabel(value: string) { const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (match) { const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])); return new Intl.DateTimeFormat("es-SV", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(date).replace(",", ""); } return value; }
function HistoryChart({ title, subtitle, data, color }: { title: string; subtitle: string; data: HistoryItem[]; color: string }) { const showPercentage = title.includes("DOCENTES"); const chartData = data.map((item) => ({ ...item, porcentaje: item.porcentaje ?? (showPercentage ? undefined : item.valor) })); return <article className="rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="text-[10px] font-semibold tracking-wide text-[#526176]">{title}</h3><p className="mt-1 text-[9px] text-[#98a2b3]">{subtitle}</p></div><span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: color }} /></div><div className="mt-4 h-[245px]">{chartData.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 28, left: 0 }}><CartesianGrid vertical={false} stroke="#e7ecf2" strokeDasharray="3 3" /><XAxis dataKey="fecha" tickFormatter={dailyDateLabel} axisLine={false} tickLine={false} interval={0} angle={-35} textAnchor="end" height={48} tick={{ fill: "#56667b", fontSize: 8 }} /><YAxis domain={showPercentage ? [0, 100] : undefined} ticks={showPercentage ? [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] : undefined} interval={0} tickFormatter={showPercentage ? (value) => `${value}%` : undefined} axisLine={false} tickLine={false} width={34} tick={{ fill: "#748397", fontSize: 8 }} /><Tooltip content={({ active, payload, label: tooltipLabel }) => { if (!active || !payload?.length) return null; const point = payload[0].payload as HistoryItem; return <div className="rounded-md border border-[#d9e0ea] bg-white px-2.5 py-2 shadow-md"><p className="text-[9px] text-[#526176]">{fullDateLabel(String(tooltipLabel))}</p><p className="mt-1 text-[10px] font-semibold text-[#20394e]">{Number(point.valor).toLocaleString("es-SV")}</p>{showPercentage && point.porcentaje !== undefined && <p className="mt-1 text-[10px] font-semibold text-[#1f6fe5]">{point.porcentaje}%</p>}</div>; }} contentStyle={{ fontSize: 10 }} /><Line type="monotone" dataKey={showPercentage ? "porcentaje" : "valor"} stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer> : <div className="flex h-full items-center justify-center text-[9px] text-[#98a2b3]">Sin datos disponibles</div>}</div></article>; }

function PlatformChart({ data, platform, label, color, compact }: { data: EvolutionRow[]; platform: Platform; label: string; color: string; compact?: boolean }) { return <div className="rounded-xl border border-[#e5eaf0] bg-[#fbfcfe] p-3"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#526176]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{label}</div><div className="h-[285px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 15, right: 18, bottom: compact ? 5 : 48, left: 8 }}><CartesianGrid vertical={false} stroke="#e7ecf2" strokeDasharray="3 3" /><XAxis dataKey="day" tickFormatter={dateLabel} axisLine={false} tickLine={false} interval={compact ? undefined : 0} padding={{ left: 42, right: 20 }} height={compact ? undefined : 56} angle={compact ? undefined : -25} textAnchor={compact ? undefined : "end"} tick={{ fill: "#56667b", fontSize: 8 }} /><YAxis domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} axisLine={false} tickLine={false} width={38} tick={{ fill: "#748397", fontSize: 8 }} /><Tooltip formatter={(value) => [Number(value).toLocaleString(), label]} /><Line type="monotone" dataKey={platform} name={label} stroke={color} strokeWidth={3} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 5 }} /></LineChart></ResponsiveContainer></div></div>; }
