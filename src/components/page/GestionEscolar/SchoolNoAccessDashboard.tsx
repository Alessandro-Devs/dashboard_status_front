"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Headphones, PhoneCall, ShieldAlert, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardDatabase } from "@/data/dashboardDatabase";

const noAccessData = dashboardDatabase.gestionEscolar.noAccesos.evolucion;
const limitations = dashboardDatabase.gestionEscolar.noAccesos.limitaciones;
const icons = { users: Users, headphones: Headphones, phone: PhoneCall, check: CheckCircle2 };
const actions = dashboardDatabase.gestionEscolar.noAccesos.acciones.map(action => ({ ...action, icon: icons[action.icon as keyof typeof icons] }));

const teacherCardStyles={orange:{color:"text-[#f08a00]",iconColor:"text-[#f08a00]",iconBg:"bg-[#fff5e8]"},blue:{color:"text-[#1f6fe5]",iconColor:"text-[#1f6fe5]",iconBg:"bg-[#eef5ff]"},purple:{color:"text-[#7b4dff]",iconColor:"text-[#7b4dff]",iconBg:"bg-[#f4efff]"},green:{color:"text-[#1a8f4a]",iconColor:"text-[#1a8f4a]",iconBg:"bg-[#edf9f1]"}};
const teacherCardIcons={shield:ShieldAlert,clipboard:ClipboardList};
const teacherKpis=dashboardDatabase.gestionEscolar.noAccesos.resumen.map(item=>({...item,...teacherCardStyles[item.color as keyof typeof teacherCardStyles],icon:teacherCardIcons[item.icon as keyof typeof teacherCardIcons]}));

export default function SchoolNoAccessDashboard() {
  return <section className="bg-[#f7f9fc] px-4 py-8 text-[#14213d] sm:px-6"><div className="mx-auto max-w-[1200px]">
    <TeacherNoAccessPanel />
    <div className="mt-6 grid gap-5 border-t border-[#e0e7ef] pt-6 xl:grid-cols-[1.45fr_.75fr]">
      <article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><div><h2 className="text-[17px] font-semibold">Evolución de no accesos</h2><p className="mt-1 text-[11px] text-[#8996a8]">Seguimiento diario por clases</p></div>
        <div className="mt-6 flex flex-col gap-4">
          <PlatformEvolutionChart platform="ihfb" label="IHFB" color="#4b82ee" />
          <PlatformEvolutionChart platform="kira" label="KIRA" color="#a68af4" />
        </div>
      </article>
      <div className="space-y-5"><article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><p className="text-[10px] font-semibold uppercase text-[#8c98a9]">Plan operativo</p><h2 className="mt-2 text-[17px] font-semibold">Principales acciones</h2><div className="mt-5 space-y-3">{actions.map(action=>{const Icon=action.icon;return <div key={action.title} className="flex gap-3 rounded-[11px] bg-[#f8fafc] p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff]"><Icon className="h-4 w-4"/></span><div><p className="text-[12px] font-semibold">{action.title}</p><p className="mt-1 text-[10px] text-[#8491a3]">{action.description}</p></div></div>})}</div></article>
      <article className="rounded-[16px] border border-[#f0dfdf] bg-white p-5"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1f1]"><AlertTriangle className="h-4 w-4 text-[#db5656]"/></span><div><p className="text-[10px] font-semibold uppercase text-[#aa7d7d]">Riesgos operativos</p><h2 className="mt-1 text-[17px] font-semibold">Limitaciones</h2></div></div><div className="mt-5 space-y-3">{limitations.map((item,index)=><div key={item} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[10px]">{index+1}</span><p className="text-[11px] leading-5">{item}</p></div>)}</div></article></div>
    </div>
  </div></section>;
}

function TeacherNoAccessPanel() {
  const teacherHistory=dashboardDatabase.gestionEscolar.noAccesos.historialDocentes;
  const classHistory=dashboardDatabase.gestionEscolar.noAccesos.historialClases;
  const [selectedTeacherDate,setSelectedTeacherDate]=useState(teacherHistory[teacherHistory.length-1].fecha);
  const [selectedClassDate,setSelectedClassDate]=useState(classHistory[classHistory.length-1].fecha);
  const selectedTeacherValue=teacherHistory.find(item=>item.fecha===selectedTeacherDate)?.valor.toString()??"0";
  const selectedClassValue=classHistory.find(item=>item.fecha===selectedClassDate)?.valor.toString()??"0";
  return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-[28px] font-semibold tracking-tight text-[#22304d]">NO ACCESOS</h2>
      <Link href="/gestion-escolar/gestion-operativa" className="rounded-md border border-[#d9e0ea] bg-white px-4 py-2 text-[11px] font-medium text-[#475467] shadow-sm transition hover:border-[#2f6fec] hover:text-[#2f6fec]">Gestión operativa</Link>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{teacherKpis.map(item => {const isTeachers=item.title==="DOCENTES NO ACCESOS";const isClasses=item.title==="NÚMERO DE CLASES";return <TeacherKpiCard key={item.title} {...item} value={isTeachers?selectedTeacherValue:isClasses?selectedClassValue:item.value} dateOptions={isTeachers?teacherHistory:isClasses?classHistory:undefined} selectedDate={isTeachers?selectedTeacherDate:isClasses?selectedClassDate:undefined} onDateChange={isTeachers?setSelectedTeacherDate:isClasses?setSelectedClassDate:undefined}/>})}</div>
  </div>;
}

type TeacherCardProps = { title:string; value:string; subtitle:string; color:string; icon:React.ElementType; iconColor:string; iconBg:string; extra?:string; dateOptions?:{fecha:string;valor:number}[]; selectedDate?:string; onDateChange?:(date:string)=>void };
function TeacherKpiCard({title,value,subtitle,color,icon:Icon,iconColor,iconBg,extra,dateOptions,selectedDate,onDateChange}:TeacherCardProps) { return <div className="rounded-xl border border-[#d9e0ea] bg-white p-4 shadow-sm"><div className="mb-4 flex items-center gap-3"><div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}><Icon className={`h-4 w-4 ${iconColor}`}/></div><p className="text-[11px] font-semibold tracking-wide text-[#667085]">{title}</p></div>{dateOptions&&<div className="mb-5"><div className="mb-2 flex items-center gap-1.5 text-[8px] font-medium uppercase tracking-[.08em] text-[#98a2b3]"><CalendarDays className="h-3 w-3"/>Fecha de corte</div><div className="flex gap-1.5">{dateOptions.map(item=><button key={item.fecha} type="button" aria-pressed={selectedDate===item.fecha} onClick={()=>onDateChange?.(item.fecha)} className={`flex-1 rounded-md border px-2 py-1.5 text-[9px] font-medium transition ${selectedDate===item.fecha?"border-[#f08a00] bg-[#fff7eb] text-[#d87900]":"border-[#e1e6ec] text-[#7b8794] hover:border-[#f1b45f]"}`}>{formatShortDate(item.fecha)}</button>)}</div></div>}<div className="flex items-end gap-1"><span className={`text-[38px] font-semibold leading-none ${color}`}>{Number(value).toLocaleString("es-SV")}</span>{extra ? <span className="mb-1 text-[12px] font-semibold text-[#667085]">{extra}</span> : null}</div><p className="mt-3 text-[11px] text-[#98a2b3]">{subtitle}</p></div> }
function formatShortDate(value:string){const[,month,day]=value.split("-");const months:Record<string,string>={"01":"ENE","02":"FEB","03":"MAR","04":"ABR","05":"MAY","06":"JUN","07":"JUL","08":"AGO","09":"SEP","10":"OCT","11":"NOV","12":"DIC"};return `${day} ${months[month]}`}

function PlatformEvolutionChart({platform,label,color}:{platform:"ihfb"|"kira";label:string;color:string}) { return <div className="rounded-xl border border-[#e5eaf0] bg-[#fbfcfe] p-3"><div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#526176]"><span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor:color}}/>{label}</div><div className="h-[285px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={noAccessData} margin={{top:15,right:14,bottom:5,left:0}}><CartesianGrid vertical={false} stroke="#e7ecf2" strokeDasharray="3 3"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#56667b",fontSize:9}}/><YAxis domain={[0,4000]} ticks={[0,1000,2000,3000,4000]} axisLine={false} tickLine={false} width={38} tick={{fill:"#748397",fontSize:9}}/><Tooltip formatter={(value)=>[Number(value).toLocaleString(),label]}/><Line type="monotone" dataKey={platform} name={label} stroke={color} strokeWidth={3} dot={{r:3,fill:color,strokeWidth:0}} activeDot={{r:5}}/></LineChart></ResponsiveContainer></div></div> }
