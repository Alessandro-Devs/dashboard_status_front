"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, ChevronLeft, ChevronRight, GraduationCap, KeyRound, Monitor, UserCheck, Users } from "lucide-react";

type Step = "accesos" | "modelamientos" | "tutoria";
type Accent = "blue" | "purple" | "green";

const accessCards = [
  { title:"CENTROS ESCOLARES", value:"754", icon:GraduationCap, tone:"slate" },
  { title:"TOTAL DOCENTES", value:"6842", icon:Users, tone:"blue" },
  { title:"DOCENTES CON ACCESO", value:"5847", subtitle:"de 6842", badge:"85%", icon:UserCheck, tone:"green" },
  { title:"TOTAL ESTUDIANTES", value:"14.160", icon:GraduationCap, tone:"purple" },
  { title:"ESTUDIANTES CON ACCESO", value:"11.842", subtitle:"de 14.160", badge:"84%", icon:UserCheck, tone:"teal" },
];

const tutorTables = [
  { title:"Clase", percentage:88, accent:"blue", rows:[["B1",145,132,91],["B2",152,139,91],["B3",141,124,88],["B4",136,117,86],["B5",148,126,85]] },
  { title:"Refuerzo", percentage:87, accent:"purple", rows:[["B1",128,116,91],["B2",136,121,89],["B3",119,101,85],["B4",124,108,87],["B5",131,112,85]] },
  { title:"Remediación", percentage:85, accent:"orange", rows:[["B1",92,83,90],["B2",97,85,88],["B3",89,73,82],["B4",91,77,85],["B5",95,78,82]] },
] as const;

const tones:Record<string,string> = {
  slate:"bg-[#f1f4f7] text-[#263e54]", blue:"bg-[#eaf3ff] text-[#1671d3]", green:"bg-[#eaf8ef] text-[#168642]",
  purple:"bg-[#f2ecff] text-[#7544f4]", teal:"bg-[#e8f5f3] text-[#087f75]",
};

export default function TutoringAndTrainingPage(){
  const [step,setStep]=useState<Step>("accesos");
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-6 sm:px-6">
    <div className="grid grid-cols-1 gap-2 overflow-hidden rounded-xl border border-[#d7e0e8] bg-white p-2 sm:grid-cols-3">
      <StepButton index="01" label="Accesos" icon={<KeyRound className="h-4 w-4"/>} active={step==="accesos"} accent="blue" onClick={()=>setStep("accesos")}/>
      <StepButton index="02" label="Modelamientos" icon={<Monitor className="h-4 w-4"/>} active={step==="modelamientos"} accent="purple" onClick={()=>setStep("modelamientos")}/>
      <StepButton index="03" label="Tutoría virtual" icon={<BookOpen className="h-4 w-4"/>} active={step==="tutoria"} accent="green" onClick={()=>setStep("tutoria")}/>
    </div>
    {step==="accesos"&&<AccessView onNext={()=>setStep("modelamientos")}/>} 
    {step==="modelamientos"&&<ModelingView onBack={()=>setStep("accesos")} onNext={()=>setStep("tutoria")}/>} 
    {step==="tutoria"&&<TutoringView onBack={()=>setStep("modelamientos")}/>} 
  </div></main>;
}

function StepButton({index,label,icon,active,accent,onClick}:{index:string;label:string;icon:ReactNode;active:boolean;accent:Accent;onClick:()=>void}){
  const config={blue:"bg-[#f0f5fd] text-[#1971d1]",purple:"bg-[#f7f3ff] text-[#7544f4]",green:"bg-[#f1f8f7] text-[#0b847a]"}[accent];
  return <button type="button" onClick={onClick} className={`relative flex min-h-[58px] items-center gap-3 rounded-lg px-4 text-left ${active?config:"bg-white text-[#6f8497]"}`}>
    {active&&<span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-current"/>}<span className={`flex h-8 w-8 items-center justify-center rounded-lg ${active?"bg-white/70":"bg-[#f5f7fa]"}`}>{icon}</span>
    <div><p className="text-[8px] font-semibold opacity-70">{index}</p><p className="mt-1 text-[11px] font-semibold text-[#213a51]">{label}</p></div>{!active&&<ChevronRight className="ml-auto h-3 w-3 text-[#d2dce5]"/>}
  </button>;
}

function AccessView({onNext}:{onNext:()=>void}){return <section className="mt-6"><SectionTitle index="01" title="Accesos" subtitle="Disponibilidad y utilización de las plataformas por la comunidad educativa" icon={<KeyRound className="h-4 w-4"/>} accent="blue"/>
  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">{accessCards.map(({icon:Icon,...item})=><article key={item.title} className="min-h-[150px] rounded-xl border border-[#d9e1e8] bg-white p-4"><div className="flex justify-between"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[item.tone]}`}><Icon className="h-4 w-4"/></span>{item.badge&&<span className="h-fit rounded-full bg-[#eef8f1] px-2 py-1 text-[9px] font-semibold text-[#168642]">{item.badge}</span>}</div><p className="mt-4 text-[9px] font-medium text-[#8399b6]">{item.title}</p><p className="mt-3 text-[25px] font-medium leading-none text-[#14283e]">{item.value}</p>{item.subtitle&&<p className="mt-2 text-[8px] text-[#91a4b8]">{item.subtitle}</p>}</article>)}</div>
  <Card className="mt-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-[12px] font-semibold">Nivel de acceso</h3><p className="mt-1 text-[9px] text-[#8da0b5]">Proporción con acceso habilitado</p></div><span className="text-[9px] text-[#8da0b5]">754 centros escolares</span></div><div className="mt-6 grid gap-7 lg:grid-cols-2"><Progress label="DOCENTES" current="5847" total="6842" percentage={85} tone="green"/><Progress label="ESTUDIANTES" current="11.842" total="14.160" percentage={84} tone="teal"/></div></Card>
  <div className="mt-5 flex justify-end"><Action onClick={onNext} tone="purple">Ver Modelamientos</Action></div></section>}

function Progress({label,current,total,percentage,tone}:{label:string;current:string;total:string;percentage:number;tone:"green"|"teal"}){const color=tone==="green"?"#168642":"#087f75";return <div><div className="flex items-end justify-between"><div><p className="text-[9px] font-semibold text-[#8398b2]">{label}</p><p className="mt-2 text-[15px] font-semibold">{current} <span className="font-normal text-[#9aaac0]">de {total}</span></p></div><strong className="text-[24px]" style={{color}}>{percentage}%</strong></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{width:`${percentage}%`,backgroundColor:color}}/></div></div>}

function ModelingView({onBack,onNext}:{onBack:()=>void;onNext:()=>void}){return <section className="mt-6"><SectionTitle index="02" title="Modelamientos" subtitle="Seguimiento de modelamientos realizados y distribución por tipo" icon={<Monitor className="h-4 w-4"/>} accent="purple"/>
  <div className="mt-5 grid gap-3 md:grid-cols-3"><Metric title="TOTAL DOCENTES" value="6842" subtitle="Docentes considerados" tone="blue" icon={<Users className="h-4 w-4"/>}/><Metric title="MODELAMIENTOS REALIZADOS" value="4280" subtitle="Total acumulado del período" tone="purple" icon={<Monitor className="h-4 w-4"/>}/><Metric title="CLASE REGULAR + REMEDIACIÓN" value="4280" subtitle="Composición del total realizado" tone="teal" icon={<BookOpen className="h-4 w-4"/>}/></div>
  <div className="mt-4 grid gap-3 lg:grid-cols-2"><Distribution title="Clase regular" value="2640" percentage={62} color="#1971d1"/><Distribution title="Remediación" value="1640" percentage={38} color="#f35c0a"/></div>
  <Card className="mt-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="text-[12px] font-semibold">Meta de modelamientos</h3><p className="mt-1 text-[9px] text-[#8da0b5]">Avance respecto a la meta establecida</p></div><div className="text-right"><p className="text-[23px] font-semibold text-[#7544f4]">4280 <span className="text-[14px] font-normal text-[#8da0b5]">/ 5000</span></p><p className="text-[9px] text-[#8da0b5]">86% de la meta</p></div></div><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full w-[86%] rounded-full bg-[#7544f4]"/></div></Card>
  <div className="mt-5 flex justify-between"><Back onClick={onBack}>Accesos</Back><Action onClick={onNext} tone="green">Ver Tutoría virtual</Action></div></section>}

function Metric({title,value,subtitle,tone,icon}:{title:string;value:string;subtitle:string;tone:string;icon:ReactNode}){return <Card><div className="flex items-center gap-3"><span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span><p className="text-[9px] font-medium text-[#8399b6]">{title}</p></div><p className={`mt-5 text-[26px] font-medium ${tones[tone].split(" ")[1]}`}>{value}</p><p className="mt-2 text-[9px] text-[#8da0b5]">{subtitle}</p></Card>}
function Distribution({title,value,percentage,color}:{title:string;value:string;percentage:number;color:string}){return <Card><div className="flex justify-between"><div><h3 className="text-[12px] font-semibold">{title}</h3><p className="mt-1 text-[9px] text-[#8da0b5]">Del total de modelamientos</p></div><div className="text-right"><p className="text-[22px] font-medium" style={{color}}>{value}</p><p className="text-[10px]">{percentage}%</p></div></div><div className="mt-4 h-2.5 overflow-hidden rounded-full bg-[#edf1f5]"><div className="h-full rounded-full" style={{width:`${percentage}%`,backgroundColor:color}}/></div></Card>}

function TutoringView({onBack}:{onBack:()=>void}){return <section className="mt-6"><SectionTitle index="03" title="Tutoría virtual" subtitle="Convocatoria y asistencia a sesiones de tutoría por bloque" icon={<BookOpen className="h-4 w-4"/>} accent="green"/><div className="mt-5 grid gap-4 xl:grid-cols-3">{tutorTables.map(table=><TutorTable key={table.title} {...table}/>)}</div><div className="mt-5"><Back onClick={onBack}>Modelamientos</Back></div></section>}
function TutorTable({title,percentage,accent,rows}:(typeof tutorTables)[number]){const color={blue:"#126fd0",purple:"#7544f4",orange:"#f35c0a"}[accent];return <article className="overflow-hidden rounded-xl border border-[#d9e1e8] bg-white"><div className="flex justify-between border-b border-[#e1e7ed] p-4"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f4f7]" style={{color}}><UserCheck className="h-4 w-4"/></span><div><h3 className="text-[13px] font-semibold">{title}</h3><p className="mt-1 text-[9px] text-[#8da0b5]">Asistencia por bloque</p></div></div><div className="text-right"><p className="text-[21px] font-semibold" style={{color}}>{percentage}%</p><p className="text-[7px] text-[#879bb3]">ASISTENCIA TOTAL</p></div></div><div className="overflow-x-auto p-3"><div className="min-w-[340px]"><div className="grid grid-cols-4 gap-2 px-2 pb-2 text-[8px] font-semibold text-[#8296b3]"><span>BLOQUE</span><span className="text-right">CONVOCADOS</span><span className="text-right">ASISTIERON</span><span className="text-right">ASISTENCIA</span></div>{rows.map(row=><div key={row[0]} className="mt-1 grid min-h-[44px] grid-cols-4 items-center gap-2 rounded-lg bg-[#f7f9fb] px-2 text-[10px]"><strong>{row[0]}</strong><span className="text-right">{row[1]}</span><strong className="text-right" style={{color}}>{row[2]}</strong><span className="rounded-full px-2 py-1 text-center font-semibold" style={{color,backgroundColor:`${color}12`}}>{row[3]}%</span></div>)}</div></div></article>}

function SectionTitle({index,title,subtitle,icon,accent}:{index:string;title:string;subtitle:string;icon:ReactNode;accent:Accent}){const tone=accent==="green"?"teal":accent;return <div className="flex items-center gap-3"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</span><div><div className="flex items-center gap-2"><span className={`text-[9px] font-semibold ${tones[tone].split(" ")[1]}`}>{index}</span><h2 className="text-[17px] font-semibold">{title}</h2></div><p className="mt-1 text-[10px] text-[#8ca0ba]">{subtitle}</p></div></div>}
function Card({children,className=""}:{children:ReactNode;className?:string}){return <div className={`rounded-xl border border-[#d9e1e8] bg-white p-5 ${className}`}>{children}</div>}
function Action({children,onClick,tone}:{children:ReactNode;onClick:()=>void;tone:"purple"|"green"}){return <button onClick={onClick} className={`flex h-10 items-center gap-2 rounded-lg px-4 text-[10px] font-semibold text-white ${tone==="purple"?"bg-[#7544f4]":"bg-[#087f75]"}`}>{children}<ChevronRight className="h-4 w-4"/></button>}
function Back({children,onClick}:{children:ReactNode;onClick:()=>void}){return <button onClick={onClick} className="flex h-10 items-center gap-2 rounded-lg border border-[#d4dde6] bg-white px-4 text-[10px] text-[#587087]"><ChevronLeft className="h-4 w-4"/>{children}</button>}
