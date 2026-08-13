"use client";

import { AlertTriangle, CheckCircle2, Headphones, PhoneCall, Users } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const noAccessData = [
  { day: "Viernes 7", ihfb: 1442, kira: 3612 },
  { day: "Lunes 10", ihfb: 1084, kira: 1911 },
  { day: "Martes 11", ihfb: 1062, kira: 1853 },
];
const actions = [
  { title: "Campaña para Directores", description: "Comunicación y seguimiento dirigido a directores.", icon: Users },
  { title: "Campaña para Docentes", description: "Contacto directo para promover y recuperar accesos.", icon: Headphones },
  { title: "Llamadas a Directores", description: "Call Center y registro de incidencias en SDP.", icon: PhoneCall },
  { title: "Monitoreo diario del TGE", description: "Seguimiento diario del comportamiento de accesos.", icon: CheckCircle2 },
  { title: "Formación para Directores", description: "Acompañamiento y orientación a equipos directivos.", icon: Users },
];
const limitations = [
  "Centros escolares con internet no funcional o sin internet.",
  "Requerimiento de personal técnico en la coordinación.",
  "Rotación y movilidad de docentes en centros escolares.",
];

export default function SchoolNoAccessDashboard() {
  const first = noAccessData[0];
  const last = noAccessData[noAccessData.length - 1];
  const kiraReduction = first.kira - last.kira;
  const totalInitial = first.ihfb + first.kira;
  const totalCurrent = last.ihfb + last.kira;
  const totalReduction = totalInitial - totalCurrent;
  const reductionPercentage = ((totalReduction / totalInitial) * 100).toFixed(1);

  return <section className="bg-[#f7f9fc] px-4 py-8 text-[#14213d] sm:px-6"><div className="mx-auto max-w-[1200px]">
    <div className="mb-6"><p className="text-[11px] font-semibold uppercase tracking-[.12em] text-[#74849a]">Gestión Escolar</p><h1 className="mt-2 text-[24px] font-semibold text-[#20295e] sm:text-[28px]">Seguimiento de No Accesos</h1></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="No accesos iniciales" value={totalInitial.toLocaleString()} description="Viernes 7" accent="neutral"/><MetricCard label="No accesos actuales" value={totalCurrent.toLocaleString()} description="Martes 11" accent="blue"/><MetricCard label="Reducción total" value={totalReduction.toLocaleString()} description={`${reductionPercentage}% menos no accesos`} accent="green"/><MetricCard label="Mayor reducción" value={kiraReduction.toLocaleString()} description="Registros KIRA recuperados" accent="purple"/></div>
    <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.75fr]">
      <article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="text-[17px] font-semibold">Evolución de no accesos</h2><p className="mt-1 text-[11px] text-[#8996a8]">Comparativo diario entre las plataformas IHFB y KIRA</p></div><div className="flex gap-5 text-[11px]"><LegendDot color="bg-[#4b82ee]" label="IHFB"/><LegendDot color="bg-[#a68af4]" label="KIRA"/></div></div>
        <div className="mt-6 h-[340px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={noAccessData} margin={{ top:15,right:25,bottom:5,left:5 }}><CartesianGrid vertical={false} stroke="#e7ecf2" strokeDasharray="3 3"/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill:"#56667b",fontSize:11}}/><YAxis domain={[0,4000]} ticks={[0,1000,2000,3000,4000]} axisLine={false} tickLine={false} tick={{fill:"#748397",fontSize:10}}/><Tooltip formatter={(value,name)=>[Number(value).toLocaleString(),String(name).toUpperCase()]}/><Line type="monotone" dataKey="ihfb" name="IHFB" stroke="#4b82ee" strokeWidth={3}/><Line type="monotone" dataKey="kira" name="KIRA" stroke="#a68af4" strokeWidth={3}/></LineChart></ResponsiveContainer></div>
      </article>
      <div className="space-y-5"><article className="rounded-[16px] border border-[#e0e7ef] bg-white p-5"><p className="text-[10px] font-semibold uppercase text-[#8c98a9]">Plan operativo</p><h2 className="mt-2 text-[17px] font-semibold">Principales acciones</h2><div className="mt-5 space-y-3">{actions.map(action=>{const Icon=action.icon;return <div key={action.title} className="flex gap-3 rounded-[11px] bg-[#f8fafc] p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#edf3ff]"><Icon className="h-4 w-4"/></span><div><p className="text-[12px] font-semibold">{action.title}</p><p className="mt-1 text-[10px] text-[#8491a3]">{action.description}</p></div></div>})}</div></article>
      <article className="rounded-[16px] border border-[#f0dfdf] bg-white p-5"><div className="flex gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff1f1]"><AlertTriangle className="h-4 w-4 text-[#db5656]"/></span><div><p className="text-[10px] font-semibold uppercase text-[#aa7d7d]">Riesgos operativos</p><h2 className="mt-1 text-[17px] font-semibold">Limitaciones</h2></div></div><div className="mt-5 space-y-3">{limitations.map((item,index)=><div key={item} className="flex items-start gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1f1] text-[10px]">{index+1}</span><p className="text-[11px] leading-5">{item}</p></div>)}</div></article></div>
    </div>
  </div></section>;
}

function MetricCard({label,value,description,accent}:{label:string;value:string;description:string;accent:"neutral"|"blue"|"green"|"purple"}) { const style={neutral:"bg-[#f8fafc] text-[#24324c]",blue:"bg-[#f2f6ff] text-[#356fc7]",green:"bg-[#f1f8f4] text-[#168642]",purple:"bg-[#f6f2ff] text-[#7652d6]"}[accent]; return <div className={`rounded-[14px] border border-[#e0e7ef] p-4 ${style}`}><p className="text-[9px] font-semibold uppercase opacity-70">{label}</p><p className="mt-3 text-[24px] font-semibold">{value}</p><p className="mt-1 text-[10px] text-[#8b97a8]">{description}</p></div> }
function LegendDot({color,label}:{color:string;label:string}) { return <span className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${color}`}/>{label}</span> }
