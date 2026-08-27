"use client";
import { useState, type ReactNode } from "react";
import { BadgeCheck, BookOpen, ChevronLeft, ChevronRight, ClipboardCheck, GraduationCap, Handshake, KeyRound, Monitor, Stethoscope, UserCheck, UserRoundCheck, Users } from "lucide-react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { sortDescendingByNumber } from "@/lib/sortByPercentage";
type Step = "accesos" | "modelamientos" | "diagnosticos" | "acompanamientos";
type Accent = "blue" | "purple" | "orange" | "green" | "teal";
const data = dashboardDatabase.tutoriaFormacion;
const tones: Record<string, string> = { blue: "bg-[#eaf3ff] text-[#1671d3]", purple: "bg-[#f2ecff] text-[#7544f4]", orange: "bg-[#fff3e6] text-[#e77b13]", green: "bg-[#eaf8ef] text-[#168642]", teal: "bg-[#e8f5f3] text-[#087f75]", slate: "bg-[#f1f4f7] text-[#263e54]" };
export default function TutoringAndTrainingPage() {
    const [step, setStep] = useState<Step>("accesos");
    return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-xl border border-[#d7e0e8] bg-white p-2 sm:grid-cols-2 lg:grid-cols-4">
      <StepButton index="01" label="Accesos" icon={<KeyRound className="h-4 w-4"/>} active={step === "accesos"} accent="blue" onClick={() => setStep("accesos")}/>
      <StepButton index="02" label="Modelamientos" icon={<Monitor className="h-4 w-4"/>} active={step === "modelamientos"} accent="purple" onClick={() => setStep("modelamientos")}/>
      <StepButton index="03" label="Diagnósticos" icon={<Stethoscope className="h-4 w-4"/>} active={step === "diagnosticos"} accent="orange" onClick={() => setStep("diagnosticos")}/>
      <StepButton index="04" label="Acompañamientos" icon={<Handshake className="h-4 w-4"/>} active={step === "acompanamientos"} accent="teal" onClick={() => setStep("acompanamientos")}/>
    </div>
    {step === "accesos" && <AccessView onNext={() => setStep("modelamientos")}/>}
    {step === "modelamientos" && <ModelingView onBack={() => setStep("accesos")} onNext={() => setStep("diagnosticos")}/>}
    {step === "diagnosticos" && <DiagnosticsView onBack={() => setStep("modelamientos")} onNext={() => setStep("acompanamientos")}/>}
    {step === "acompanamientos" && <AcompanamientosView onBack={() => setStep("diagnosticos")}/>}
    <div className="mt-6"><TutoriaVirtual /></div>
  </div></main>;
}
function StepButton({ index, label, icon, active, accent, onClick }: {
    index: string;
    label: string;
    icon: ReactNode;
    active: boolean;
    accent: Accent;
    onClick: () => void;
}) {
    return <button type="button" onClick={onClick} className={`relative flex min-h-[58px] items-center gap-3 rounded-lg px-4 text-left ${active ? tones[accent] : "bg-white text-[#6f8497]"}`}>
    {active && <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-current"/>}<span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-white/70" : "bg-[#f5f7fa]"}`}>{icon}</span><div><p className="text-[8px] font-semibold opacity-70">{index}</p><p className="mt-1 text-[11px] font-semibold text-[#213a51]">{label}</p></div>{!active && <ChevronRight className="ml-auto h-3 w-3 text-[#d2dce5]"/>}
  </button>;
}
function AccessView({ onNext }: {
    onNext: () => void;
}) {
    const access = data.accesos;
    const cards = sortDescendingByNumber([
        { title: "CENTROS ESCOLARES", value: access.centros, icon: GraduationCap, tone: "slate" },
        { title: "TOTAL DOCENTES", value: access.docentes, icon: Users, tone: "blue" },
        { title: "DOCENTES CON ACCESO", value: access.docentesConAcceso, subtitle: `de ${access.docentes}`, badge: `${access.porcentajeDocentes}%`, icon: UserCheck, tone: "green", percentage: access.porcentajeDocentes },
        { title: "TOTAL ESTUDIANTES", value: access.estudiantes, icon: GraduationCap, tone: "purple" },
        { title: "ESTUDIANTES CON ACCESO", value: access.estudiantesConAcceso, subtitle: `de ${access.estudiantes}`, badge: `${access.porcentajeEstudiantes}%`, icon: UserCheck, tone: "teal", percentage: access.porcentajeEstudiantes },
    ], (item) => item.percentage ?? -1);
    const progressItems = sortDescendingByNumber([
        { label: "DOCENTES", current: access.docentesConAcceso, total: access.docentes, percentage: access.porcentajeDocentes, color: "#168642" },
        { label: "ESTUDIANTES", current: access.estudiantesConAcceso, total: access.estudiantes, percentage: access.porcentajeEstudiantes, color: "#087f75" },
    ], (item) => item.percentage);
    return <section className="mt-6"><SectionTitle index="01" title="Accesos" subtitle="Disponibilidad de acceso para la comunidad educativa" icon={<KeyRound className="h-4 w-4"/>} accent="blue"/><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(({ icon: Icon, ...item }) => <MetricCard key={item.title} icon={<Icon className="h-4 w-4"/>} {...item}/>)}</div><Card className="mt-5"><h3 className="text-[12px] font-semibold">Nivel de acceso</h3><div className="mt-6 grid gap-7 lg:grid-cols-2">{progressItems.map((item) => <Progress key={item.label} {...item}/>)}</div></Card><div className="mt-5 flex justify-end"><Next onClick={onNext}>Ver Modelamientos</Next></div></section>;
}
function ModelingView({ onBack, onNext }: {
    onBack: () => void;
    onNext: () => void;
}) {
    const model = data.modelamientos;
    const regular = Number(model.soloClaseRegular.realizados);
    const remediation = Number(model.soloRemediacion.realizados);
    const distributionTotal = regular + remediation;
    const regularPercentage = distributionTotal > 0 ? Math.round((regular / distributionTotal) * 100) : 0;
    const remediationPercentage = distributionTotal > 0 ? 100 - regularPercentage : 0;
    return <section className="mt-6"><ModelamientosSection model={model} regularPercentage={regularPercentage} remediationPercentage={remediationPercentage}/><Navigation onBack={onBack} back="Accesos" onNext={onNext} next="Ver Diagnósticos"/></section>;
}
type ModelingData = typeof data.modelamientos;
function ModelamientosSection({ model, regularPercentage, remediationPercentage }: {
    model: ModelingData;
    regularPercentage: number;
    remediationPercentage: number;
}) {
    const distributionCards = sortDescendingByNumber([
        { title: "Clase regular", value: model.soloClaseRegular.realizados, percentage: regularPercentage, color: "blue" as const },
        { title: "Remediación", value: model.soloRemediacion.realizados, percentage: remediationPercentage, color: "orange" as const },
    ], (item) => item.percentage);
    return <section className="w-full bg-[#f5f8fc] p-1 text-[#17324a]"><div className="w-full"><div className="mb-4 flex items-start gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f2ecff]"><Monitor className="h-4 w-4 text-[#7544f4]"/></div><div><div className="flex items-center gap-2"><span className="text-[9px] font-semibold text-[#7544f4]">02</span><h2 className="text-[18px] font-semibold leading-none text-[#243c52]">Modelamientos</h2></div><p className="mt-1 text-[8px] text-[#8fa1b5]">Seguimiento de modelamientos realizados y distribución por tipo</p></div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><ModelingMetricCard title="TOTAL DOCENTES" value={model.totalDocentes} subtitle="Docentes considerados" icon={<Users className="h-4 w-4"/>} accent="blue"/><ModelingMetricCard title="MODELAMIENTOS REALIZADOS" value={model.meta.realizados} subtitle="Total acumulado del período" icon={<Monitor className="h-4 w-4"/>} accent="purple"/><ModelingMetricCard title="CLASE REGULAR + REMEDIACIÓN" value={model.claseRegularRemediacion.realizados} subtitle="Composición del total realizado" icon={<BookOpen className="h-4 w-4"/>} accent="green" tinted/></div><div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">{distributionCards.map((item) => <ModelingDistributionCard key={item.title} {...item}/>)}</div><div className="mt-3 rounded-[10px] border border-[#d9e1e8] bg-white px-5 py-4"><div className="flex items-start justify-between"><div><h3 className="text-[10px] font-semibold text-[#29445a]">Meta de modelamientos</h3><p className="mt-1 text-[7px] text-[#8da0b5]">Avance respecto a la meta establecida</p></div><div className="text-right"><p className="text-[22px] font-semibold leading-none text-[#7544f4]">{model.meta.realizados} <span className="text-[11px] font-normal text-[#91a2b5]">/ {model.meta.total}</span></p><p className="mt-2 text-[7px] text-[#8da0b5]">{model.meta.porcentaje}% de la meta</p></div></div><div className="mt-4 h-[10px] overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#7544f4]" style={{ width: `${model.meta.porcentaje}%` }}/></div></div></div></section>;
}
function ModelingMetricCard({ title, value, subtitle, icon, accent, tinted = false }: {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    accent: "blue" | "purple" | "green";
    tinted?: boolean;
}) { const config = { blue: { iconBg: "bg-[#eaf3ff]", iconColor: "text-[#176dcc]", valueColor: "text-[#17324a]", border: "border-[#d9e1e8]", background: "bg-white" }, purple: { iconBg: "bg-[#f2ecff]", iconColor: "text-[#7544f4]", valueColor: "text-[#7544f4]", border: "border-[#ddceff]", background: "bg-white" }, green: { iconBg: "bg-[#e8f5f3]", iconColor: "text-[#087f75]", valueColor: "text-[#087f75]", border: "border-[#b8deda]", background: tinted ? "bg-[#f5faf9]" : "bg-white" } }[accent]; return <article className={`min-h-[130px] rounded-[10px] border p-4 ${config.border} ${config.background}`}><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${config.iconBg} ${config.iconColor}`}>{icon}</span><p className="text-[8px] font-semibold uppercase tracking-[0.05em] text-[#8397b0]">{title}</p></div><p className={`mt-5 text-[26px] font-medium leading-none ${config.valueColor}`}>{value}</p><p className="mt-3 text-[7px] text-[#8fa1b5]">{subtitle}</p></article>; }
function ModelingDistributionCard({ title, value, percentage, color }: {
    title: string;
    value: string;
    percentage: number;
    color: "blue" | "orange";
}) { const config = { blue: { value: "text-[#126fd0]", bar: "bg-[#176dcc]" }, orange: { value: "text-[#f05b0b]", bar: "bg-[#f05b0b]" } }[color]; return <article className="rounded-[10px] border border-[#d9e1e8] bg-white px-4 py-4"><div className="flex items-start justify-between"><div><h3 className="text-[9px] font-semibold text-[#29445a]">{title}</h3><p className="mt-1 text-[7px] text-[#8fa1b5]">Del total de modelamientos</p></div><div className="text-right"><p className={`text-[18px] font-semibold leading-none ${config.value}`}>{value}</p><p className="mt-2 text-[7px] text-[#74889b]">{percentage}%</p></div></div><div className="mt-4 h-[8px] overflow-hidden rounded-full bg-[#edf1f5]"><div className={`h-full rounded-full ${config.bar}`} style={{ width: `${percentage}%` }}/></div></article>; }
function DiagnosticsView({ onBack, onNext }: {
    onBack: () => void;
    onNext: () => void;
}) {
    const diagnostic = data.diagnosticos;
    const toNumber = (value: string) => Number(value.replace(/[^\d.-]/g, ""));
    const pending = (toNumber(diagnostic.totalDocentes) - toNumber(diagnostic.docentesDiagnosticados)).toLocaleString("es-SV");
    return <section className="mt-6"><DiagnosticoSection diagnostic={diagnostic} pending={pending}/><Navigation onBack={onBack} back="Modelamientos" onNext={onNext} next="Ver Acompañamientos"/></section>;
}
type DiagnosticData = typeof data.diagnosticos;
function DiagnosticoSection({ diagnostic, pending }: {
    diagnostic: DiagnosticData;
    pending: string;
}) { return <section className="w-full bg-[#f5f8fc] p-1 text-[#17324a]"><div className="mb-4 flex items-start gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff1e8]"><ClipboardCheck className="h-4 w-4 text-[#f05b0b]"/></div><div><div className="flex items-center gap-2"><span className="text-[9px] font-semibold text-[#f05b0b]">03</span><h2 className="text-[18px] font-semibold leading-none text-[#243c52]">Diagnóstico</h2></div><p className="mt-1 text-[8px] text-[#8fa1b5]">Seguimiento de la aplicación y avance del proceso diagnóstico</p></div></div><div className="grid grid-cols-1 gap-3 md:grid-cols-3"><DiagnosticMetricCard title="DOCENTES CONSIDERADOS" value={diagnostic.totalDocentes} subtitle="Universo de diagnóstico" icon={<Users className="h-4 w-4"/>} type="blue"/><DiagnosticMetricCard title="DIAGNÓSTICOS REALIZADOS" value={diagnostic.docentesDiagnosticados} subtitle="Acumulado a la fecha" icon={<ClipboardCheck className="h-4 w-4"/>} type="orange"/><DiagnosticMetricCard title="PENDIENTES" value={pending} subtitle="Para completar la meta" icon={<Users className="h-4 w-4"/>} type="red"/></div><div className="mt-4 rounded-[10px] border border-[#d9e1e8] bg-white px-5 py-5"><div className="flex items-start justify-between"><div><h3 className="text-[10px] font-semibold text-[#29445a]">Avance del diagnóstico</h3><p className="mt-1 text-[7px] text-[#8fa1b5]">Diagnósticos realizados respecto al universo definido</p></div><div className="text-right"><p className="text-[22px] font-semibold leading-none text-[#f05b0b]">{diagnostic.porcentaje}%</p><p className="mt-2 text-[7px] text-[#8fa1b5]">{diagnostic.docentesDiagnosticados} de {diagnostic.totalDocentes}</p></div></div><div className="mt-4 h-[10px] overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full bg-[#f05b0b]" style={{ width: `${diagnostic.porcentaje}%` }}/></div></div></section>; }
function DiagnosticMetricCard({ title, value, subtitle, icon, type }: {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    type: "blue" | "orange" | "red";
}) { const config = { blue: { iconBg: "bg-[#eaf3ff]", iconColor: "text-[#176dcc]", valueColor: "text-[#17324a]", border: "border-[#d9e1e8]" }, orange: { iconBg: "bg-[#fff1e8]", iconColor: "text-[#f05b0b]", valueColor: "text-[#f05b0b]", border: "border-[#ffcbb3]" }, red: { iconBg: "bg-[#fff0f0]", iconColor: "text-[#ef2d2d]", valueColor: "text-[#ef2d2d]", border: "border-[#ffcaca]" } }[type]; return <article className={`min-h-[145px] rounded-[10px] border bg-white p-4 ${config.border}`}><span className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${config.iconBg} ${config.iconColor}`}>{icon}</span><p className="mt-5 text-[8px] font-medium uppercase tracking-[0.05em] text-[#8397b0]">{title}</p><p className={`mt-3 text-[26px] font-medium leading-none ${config.valueColor}`}>{value}</p><p className="mt-3 text-[7px] text-[#8fa1b5]">{subtitle}</p></article>; }
type TutoringRow = {
    block: string;
    invited: number;
    attended: number;
    percentage: number;
};
type TutoringGroup = {
    title: string;
    percentage: number;
    accent: "blue" | "purple" | "orange";
    rows: TutoringRow[];
};
function TutoriaVirtual() {
    const tutoringData = sortDescendingByNumber(data.tutoriaVirtual as TutoringGroup[], (group) => group.percentage);
    return <section className="w-full rounded-[14px] border border-[#d8e0e8] bg-[#f8fafc] p-5"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#e8f5f3]"><BookOpen className="h-4 w-4 text-[#087f75]"/></span><div><div className="flex items-center gap-2"><span className="text-[8px] font-semibold uppercase text-[#087f75]">VIRTUAL</span><h2 className="text-[14px] font-semibold text-[#20394f]">Tutoría virtual</h2></div><p className="mt-1 text-[8px] text-[#8da0b5]">Seguimiento de convocatoria y asistencia a sesiones de tutoría virtual</p></div></div><div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-3">{tutoringData.map((group) => <TutoringCard key={group.title} {...group}/>)}</div></section>;
}
function TutoringCard({ title, percentage, accent, rows }: TutoringGroup) {
    const styles = { blue: { iconBg: "bg-[#eaf3ff]", icon: "text-[#176dcc]", value: "text-[#176dcc]", badge: "bg-[#eaf3ff] text-[#176dcc]", attended: "text-[#176dcc]" }, purple: { iconBg: "bg-[#f2ecff]", icon: "text-[#7b3ff2]", value: "text-[#7b3ff2]", badge: "bg-[#f2ecff] text-[#7b3ff2]", attended: "text-[#7b3ff2]" }, orange: { iconBg: "bg-[#fff1e8]", icon: "text-[#f05b13]", value: "text-[#f05b13]", badge: "bg-[#fff1e8] text-[#f05b13]", attended: "text-[#f05b13]" } }[accent];
    const sortedRows = sortDescendingByNumber(rows, (row) => row.percentage);
    return <article className="overflow-hidden rounded-[10px] border border-[#dce3ea] bg-white"><div className="flex items-start justify-between border-b border-[#e2e8ee] px-4 py-4"><div className="flex items-center gap-3"><span className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${styles.iconBg}`}><UserRoundCheck className={`h-4 w-4 ${styles.icon}`}/></span><div><h3 className="text-[11px] font-semibold text-[#29445a]">{title}</h3><p className="mt-1 text-[7px] text-[#8da0b5]">Asistencia por bloque</p></div></div><div className="text-right"><p className={`text-[21px] font-semibold leading-none ${styles.value}`}>{percentage}%</p><p className="mt-2 text-[6px] font-medium uppercase tracking-[0.05em] text-[#879ab0]">ASISTENCIA TOTAL</p></div></div><div className="p-3"><div className="grid grid-cols-[0.7fr_1fr_1fr_0.8fr] gap-2 px-2 py-2"><span className="text-[6px] font-semibold uppercase text-[#8296b0]">BLOQUE</span><span className="text-right text-[6px] font-semibold uppercase text-[#8296b0]">CONVOCADOS</span><span className="text-right text-[6px] font-semibold uppercase text-[#8296b0]">ASISTIERON</span><span className="text-right text-[6px] font-semibold uppercase text-[#8296b0]">ASISTENCIA</span></div><div className="space-y-1">{sortedRows.map((row) => <div key={row.block} className="grid min-h-[46px] grid-cols-[0.7fr_1fr_1fr_0.8fr] items-center gap-2 rounded-[8px] bg-[#f6f8fa] px-2"><span className="text-[9px] font-semibold text-[#29445a]">{row.block}</span><span className="text-right text-[8px] text-[#465d72]">{row.invited}</span><span className={`text-right text-[8px] font-medium ${styles.attended}`}>{row.attended}</span><div className="text-right"><span className={`inline-flex min-w-[34px] justify-center rounded-full px-2 py-1 text-[7px] font-semibold ${styles.badge}`}>{row.percentage}%</span></div></div>)}</div></div></article>;
}
function AcompanamientosView({ onBack }: {
    onBack: () => void;
}) {
    const acompanamientos = data.acompanamientos ?? { realizados: "0", estado: "En seguimiento" };
    return <section className="mt-6"><SectionTitle index="05" title="Acompañamientos" subtitle="Seguimiento acumulado de acompañamientos realizados a docentes" icon={<Handshake className="h-4 w-4"/>} accent="teal"/><div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[2fr_1fr]"><div className="rounded-xl border border-[#b9ddd7] bg-white px-5 py-4"><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef8f6]"><Handshake className="h-4 w-4 text-[#0b7a75]"/></div><div><p className="text-[10px] font-semibold uppercase tracking-[.06em] text-[#91a2b5]">ACOMPAÑAMIENTOS REALIZADOS</p><p className="mt-1 text-[10px] text-[#9aacbf]">Acumulado a la fecha</p></div></div><p className="pr-2 text-right text-[44px] font-medium leading-none text-[#0b7a75]">{acompanamientos.realizados}</p></div></div><div className="rounded-xl border border-[#b9ddd7] bg-white px-5 py-4"><div className="flex items-start gap-4"><div className="mt-1 flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eef8f6]"><BadgeCheck className="h-4 w-4 text-[#198754]"/></div><div><p className="text-[10px] font-semibold uppercase tracking-[.06em] text-[#91a2b5]">ESTADO</p><p className="mt-5 text-[18px] font-semibold text-[#17324a]">{acompanamientos.estado}</p><p className="mt-2 text-[10px] text-[#9aacbf]">Indicador acumulado del proceso</p></div></div></div></div><div className="mt-5"><Back onClick={onBack}>Diagnósticos</Back></div></section>;
}
function MetricCard({ title, value, subtitle, badge, tone, icon }: {
    title: string;
    value: string;
    subtitle?: string;
    badge?: string;
    tone: string;
    icon: ReactNode;
}) { return <Card><div className="flex justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>{badge && <span className={`h-fit rounded-full px-2 py-1 text-[9px] font-semibold ${tones[tone]}`}>{badge}</span>}</div><p className="mt-4 text-[9px] font-medium text-[#8399b6]">{title}</p><p className="mt-3 text-[25px] font-medium leading-none">{value}</p>{subtitle && <p className="mt-2 text-[8px] text-[#91a4b8]">{subtitle}</p>}</Card>; }
function Progress({ label, current, total, percentage, color }: {
    label: string;
    current: string;
    total: string;
    percentage: number;
    color: string;
}) { return <div className="mt-5"><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold text-[#8398b2]">{label}</p><p className="mt-2 text-[15px] font-semibold">{current} <span className="font-normal text-[#9aaac0]">de {total}</span></p></div><strong className="text-[24px]" style={{ color }}>{percentage}%</strong></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }}/></div></div>; }
function SectionTitle({ index, title, subtitle, icon, accent }: {
    index: string;
    title: string;
    subtitle: string;
    icon: ReactNode;
    accent: Accent;
}) { return <div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[accent]}`}>{icon}</span><div><div className="flex items-center gap-2"><span className={`text-[9px] font-semibold ${tones[accent].split(" ")[1]}`}>{index}</span><h2 className="text-[17px] font-semibold">{title}</h2></div><p className="mt-1 text-[10px] text-[#8ca0ba]">{subtitle}</p></div></div>; }
function Card({ children, className = "" }: {
    children: ReactNode;
    className?: string;
}) { return <div className={`rounded-xl border border-[#d9e1e8] bg-white p-5 ${className}`}>{children}</div>; }
function Navigation({ onBack, back, onNext, next }: {
    onBack: () => void;
    back: string;
    onNext: () => void;
    next: string;
}) { return <div className="mt-5 flex items-center justify-between"><Back onClick={onBack}>{back}</Back><Next onClick={onNext}>{next}</Next></div>; }
function Next({ children, onClick }: {
    children: ReactNode;
    onClick: () => void;
}) { return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg border border-[#d4dde6] bg-white px-4 text-[10px] text-[#587087]">{children}<ChevronRight className="h-4 w-4"/></button>; }
function Back({ children, onClick }: {
    children: ReactNode;
    onClick: () => void;
}) { return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg border border-[#d4dde6] bg-white px-4 text-[10px] text-[#587087]"><ChevronLeft className="h-4 w-4"/>{children}</button>; }
