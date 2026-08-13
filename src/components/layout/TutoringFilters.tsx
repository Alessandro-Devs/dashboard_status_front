"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useState } from "react";

const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const weeks = ["Todas las semanas", "Semana 1", "Semana 2", "Semana 3", "Semana 4"];

export default function TutoringFilters() {
  const [month, setMonth] = useState("Julio");
  const [week, setWeek] = useState("Todas las semanas");

  return <div className="flex flex-wrap items-end gap-3">
    <CalendarDays className="mb-[7px] hidden h-4 w-4 text-[#8fa6b8] sm:block"/>
    <Select label="Período" value={month} options={months} width="w-[115px]" onChange={setMonth}/>
    <Select value={week} options={weeks} width="w-[160px]" onChange={setWeek}/>
  </div>;
}

function Select({label,value,options,width,onChange}:{label?:string;value:string;options:string[];width:string;onChange:(value:string)=>void}) {
  return <div>
    {label ? <label className="mb-1 block text-[9px] font-semibold uppercase tracking-[.08em] text-[#738da3]">{label}</label> : <span aria-hidden="true" className="mb-1 block h-[12px]"/>}
    <div className="relative">
      <select value={value} aria-label={label??"Semana"} onChange={(event)=>onChange(event.target.value)} className={`h-[34px] ${width} appearance-none rounded-[7px] border border-[#49647a] bg-[#1c3850] px-4 pr-9 text-[12px] font-medium text-white outline-none transition hover:border-[#68849a] focus:border-[#7da4c1]`}>
        {options.map((option)=><option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white"/>
    </div>
  </div>;
}
