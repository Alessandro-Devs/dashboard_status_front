"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, GraduationCap, KeyRound, Monitor, Stethoscope, UserCheck, Users } from "lucide-react";
import { dashboardDatabase } from "@/data/dashboardDatabase";

type Step = "accesos" | "modelamientos" | "diagnosticos" | "tutoria";
type Accent = "blue" | "purple" | "orange" | "green";
const data = dashboardDatabase.tutoriaFormacion;
const tones: Record<string,string> = { blue:"bg-[#eaf3ff] text-[#1671d3]", purple:"bg-[#f2ecff] text-[#7544f4]", orange:"bg-[#fff3e6] text-[#e77b13]", green:"bg-[#eaf8ef] text-[#168642]", teal:"bg-[#e8f5f3] text-[#087f75]", slate:"bg-[#f1f4f7] text-[#263e54]" };

export default function TutoringAndTrainingPage() {
  const [step,setStep] = useState<Step>("accesos");
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-xl border border-[#d7e0e8] bg-white p-2 sm:grid-cols-2 lg:grid-cols-4">
      <StepButton index="01" label="Accesos" icon={<KeyRound className="h-4 w-4"/>} active={step==="accesos"} accent="blue" onClick={()=>setStep("accesos")}/>
      <StepButton index="02" label="Modelamientos" icon={<Monitor className="h-4 w-4"/>} active={step==="modelamientos"} accent="purple" onClick={()=>setStep("modelamientos")}/>
      <StepButton index="03" label="Diagnósticos" icon={<Stethoscope className="h-4 w-4"/>} active={step==="diagnosticos"} accent="orange" onClick={()=>setStep("diagnosticos")}/>
      <StepButton index="04" label="Tutoría virtual" icon={<BookOpen className="h-4 w-4"/>} active={step==="tutoria"} accent="green" onClick={()=>setStep("tutoria")}/>
    </div>
    {step==="accesos" && <AccessView onNext={()=>setStep("modelamientos")}/>} 
    {step==="modelamientos" && <ModelingView onBack={()=>setStep("accesos")} onNext={()=>setStep("diagnosticos")}/>} 
    {step==="diagnosticos" && <DiagnosticsView onBack={()=>setStep("modelamientos")} onNext={()=>setStep("tutoria")}/>} 
    {step==="tutoria" && <TutoringView onBack={()=>setStep("diagnosticos")}/>} 
  </div></main>;
}

function StepButton({index,label,icon,active,accent,onClick}:{index:string;label:string;icon:ReactNode;active:boolean;accent:Accent;onClick:()=>void}) {
  return <button type="button" onClick={onClick} className={`relative flex min-h-[58px] items-center gap-3 rounded-lg px-4 text-left ${active?tones[accent]:"bg-white text-[#6f8497]"}`}>
    {active&&<span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-current"/>}<span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active?"bg-white/70":"bg-[#f5f7fa]"}`}>{icon}</span><div><p className="text-[8px] font-semibold opacity-70">{index}</p><p className="mt-1 text-[11px] font-semibold text-[#213a51]">{label}</p></div>{!active&&<ChevronRight className="ml-auto h-3 w-3 text-[#d2dce5]"/>}
  </button>;
}

function AccessView({onNext}:{onNext:()=>void}) {
  const access=data.accesos;
  const cards=[
    {title:"CENTROS ESCOLARES",value:access.centros,icon:GraduationCap,tone:"slate"},
    {title:"TOTAL DOCENTES",value:access.docentes,icon:Users,tone:"blue"},
    {title:"DOCENTES CON ACCESO",value:access.docentesConAcceso,subtitle:`de ${access.docentes}`,badge:`${access.porcentajeDocentes}%`,icon:UserCheck,tone:"green"},
    {title:"TOTAL ESTUDIANTES",value:access.estudiantes,icon:GraduationCap,tone:"purple"},
    {title:"ESTUDIANTES CON ACCESO",value:access.estudiantesConAcceso,subtitle:`de ${access.estudiantes}`,badge:`${access.porcentajeEstudiantes}%`,icon:UserCheck,tone:"teal"},
  ];
  return <section className="mt-6"><SectionTitle index="01" title="Accesos" subtitle="Disponibilidad de acceso para la comunidad educativa" icon={<KeyRound className="h-4 w-4"/>} accent="blue"/><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{cards.map(({icon:Icon,...item})=><MetricCard key={item.title} icon={<Icon className="h-4 w-4"/>} {...item}/>)}</div><Card className="mt-5"><h3 className="text-[12px] font-semibold">Nivel de acceso</h3><div className="mt-6 grid gap-7 lg:grid-cols-2"><Progress label="DOCENTES" current={access.docentesConAcceso} total={access.docentes} percentage={access.porcentajeDocentes} color="#168642"/><Progress label="ESTUDIANTES" current={access.estudiantesConAcceso} total={access.estudiantes} percentage={access.porcentajeEstudiantes} color="#087f75"/></div></Card><Next onClick={onNext}>Ver Modelamientos</Next></section>;
}

function ModelingView({onBack,onNext}:{onBack:()=>void;onNext:()=>void}) {
  const model=data.modelamientos;
  return <section className="mt-6"><SectionTitle index="02" title="Modelamientos" subtitle="Seguimiento de modelamientos realizados por modalidad" icon={<Monitor className="h-4 w-4"/>} accent="purple"/><div className="mt-5 grid gap-3 md:grid-cols-3"><MetricCard title="TOTAL DOCENTES" value={model.totalDocentes} tone="blue" icon={<Users className="h-4 w-4"/>}/><MetricCard title="CLASE REGULAR + REMEDIACIÓN" value={model.claseRegularRemediacion.realizados} subtitle={`de ${model.claseRegularRemediacion.totalEsperados} esperados`} badge={`${model.claseRegularRemediacion.porcentaje}%`} tone="purple" icon={<Monitor className="h-4 w-4"/>}/><MetricCard title="TOTAL REALIZADOS" value={model.meta.realizados} subtitle={`Meta: ${model.meta.total}`} badge={`${model.meta.porcentaje}%`} tone="teal" icon={<BookOpen className="h-4 w-4"/>}/></div><div className="mt-4 grid gap-3 lg:grid-cols-2"><ProgressCard title="Solo clase regular" {...model.soloClaseRegular}/><ProgressCard title="Solo remediación" {...model.soloRemediacion}/></div><Navigation onBack={onBack} back="Accesos" onNext={onNext} next="Ver Diagnósticos"/></section>;
}

function DiagnosticsView({onBack,onNext}:{onBack:()=>void;onNext:()=>void}) {
  const diagnostic=data.diagnosticos;
  return <section className="mt-6"><SectionTitle index="03" title="Diagnósticos" subtitle="Cobertura de docentes diagnosticados" icon={<Stethoscope className="h-4 w-4"/>} accent="orange"/><div className="mt-5 grid gap-4 lg:grid-cols-[.65fr_1.35fr]"><MetricCard title="DOCENTES DIAGNOSTICADOS" value={diagnostic.docentesDiagnosticados} subtitle={`de ${diagnostic.totalDocentes} docentes`} badge={`${diagnostic.porcentaje}%`} tone="orange" icon={<UserCheck className="h-4 w-4"/>}/><Card><div className="flex items-end justify-between"><div><h3 className="text-[12px] font-semibold">Avance de diagnósticos</h3><p className="mt-1 text-[9px] text-[#8da0b5]">Docentes diagnosticados respecto al universo</p></div><strong className="text-[26px] text-[#e77b13]">{diagnostic.porcentaje}%</strong></div><Progress label="DIAGNÓSTICOS" current={diagnostic.docentesDiagnosticados} total={diagnostic.totalDocentes} percentage={diagnostic.porcentaje} color="#e77b13"/></Card></div><Navigation onBack={onBack} back="Modelamientos" onNext={onNext} next="Ver Tutoría virtual"/></section>;
}

function TutoringView({onBack}:{onBack:()=>void}) {
  const virtual=data.tutoriaVirtual;
  const rows=[...virtual.bloques1y2.map(item=>{const detail=item.cumplimiento;const percentage=detail.bloque1&&detail.bloque2?Math.round((detail.bloque1.porcentaje+detail.bloque2.porcentaje)/2):detail.porcentaje??0;return {scope:"Bloques 1 y 2",type:item.tipo,total:item.total,percentage};}),...virtual.grupos345.map(item=>({scope:"Grupos 3, 4 y 5",type:item.tipo,total:item.total,percentage:item.cumplimiento.porcentaje}))];
  return <section className="mt-6"><SectionTitle index="04" title="Tutoría virtual" subtitle="Cumplimiento de tutorías por bloque y modalidad" icon={<BookOpen className="h-4 w-4"/>} accent="green"/><div className="mt-5 grid gap-3 sm:grid-cols-2"><MetricCard title="TOTAL BLOQUES 1 Y 2" value={String(virtual.resumenBloques1y2.total)} subtitle={`B1: ${virtual.resumenBloques1y2.bloque1} · B2: ${virtual.resumenBloques1y2.bloque2}`} tone="blue" icon={<BookOpen className="h-4 w-4"/>}/><MetricCard title="TOTAL GRUPOS 3, 4 Y 5" value={String(virtual.resumenGrupos345.total)} tone="green" icon={<GraduationCap className="h-4 w-4"/>}/></div><Card className="mt-4 overflow-x-auto"><div className="min-w-[520px]"><div className="grid grid-cols-4 border-b pb-3 text-[8px] font-semibold text-[#8296a8]"><span>GRUPO</span><span>TIPO</span><span className="text-right">REALIZADOS</span><span className="text-right">CUMPLIMIENTO</span></div>{rows.map(row=><div key={`${row.scope}-${row.type}`} className="grid grid-cols-4 border-b py-3 text-[9px]"><span>{row.scope}</span><strong>{row.type}</strong><span className="text-right">{row.total}</span><strong className="text-right text-[#168642]">{row.percentage}%</strong></div>)}</div></Card><div className="mt-5"><Back onClick={onBack}>Diagnósticos</Back></div></section>;
}

function MetricCard({title,value,subtitle,badge,tone,icon}:{title:string;value:string;subtitle?:string;badge?:string;tone:string;icon:ReactNode}) { return <Card><div className="flex justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span>{badge&&<span className={`h-fit rounded-full px-2 py-1 text-[9px] font-semibold ${tones[tone]}`}>{badge}</span>}</div><p className="mt-4 text-[9px] font-medium text-[#8399b6]">{title}</p><p className="mt-3 text-[25px] font-medium leading-none">{value}</p>{subtitle&&<p className="mt-2 text-[8px] text-[#91a4b8]">{subtitle}</p>}</Card>; }
function ProgressCard({title,totalDocentes,realizados,porcentaje}:{title:string;totalDocentes:string;realizados:string;porcentaje:number}) { return <Card><h3 className="text-[12px] font-semibold">{title}</h3><Progress label="REALIZADOS" current={realizados} total={totalDocentes} percentage={porcentaje} color="#7544f4"/></Card>; }
function Progress({label,current,total,percentage,color}:{label:string;current:string;total:string;percentage:number;color:string}) { return <div className="mt-5"><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold text-[#8398b2]">{label}</p><p className="mt-2 text-[15px] font-semibold">{current} <span className="font-normal text-[#9aaac0]">de {total}</span></p></div><strong className="text-[24px]" style={{color}}>{percentage}%</strong></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{width:`${percentage}%`,backgroundColor:color}}/></div></div>; }
function SectionTitle({index,title,subtitle,icon,accent}:{index:string;title:string;subtitle:string;icon:ReactNode;accent:Accent}) { return <div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[accent]}`}>{icon}</span><div><div className="flex items-center gap-2"><span className={`text-[9px] font-semibold ${tones[accent].split(" ")[1]}`}>{index}</span><h2 className="text-[17px] font-semibold">{title}</h2></div><p className="mt-1 text-[10px] text-[#8ca0ba]">{subtitle}</p></div></div>; }
function Card({children,className=""}:{children:ReactNode;className?:string}) { return <div className={`rounded-xl border border-[#d9e1e8] bg-white p-5 ${className}`}>{children}</div>; }
function Navigation({onBack,back,onNext,next}:{onBack:()=>void;back:string;onNext:()=>void;next:string}) { return <div className="mt-5 flex justify-between"><Back onClick={onBack}>{back}</Back><Next onClick={onNext}>{next}</Next></div>; }
function Next({children,onClick}:{children:ReactNode;onClick:()=>void}) { return <div className="mt-5 flex justify-end"><button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg bg-[#087f75] px-4 text-[10px] font-semibold text-white">{children}<ChevronRight className="h-4 w-4"/></button></div>; }
function Back({children,onClick}:{children:ReactNode;onClick:()=>void}) { return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg border border-[#d4dde6] bg-white px-4 text-[10px] text-[#587087]"><ChevronLeft className="h-4 w-4"/>{children}</button>; }
