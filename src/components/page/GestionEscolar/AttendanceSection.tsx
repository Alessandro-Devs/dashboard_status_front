"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import AttendanceChart from "./AttendanceChart";
import { dashboardDatabase } from "@/data/dashboardDatabase";

const cards = dashboardDatabase.gestionEscolar.asistenciaTarjetas;

export default function AttendanceSection() {
  const [type, setType] = useState<"students" | "teachers">("students");
  const { startDate, endDate, platforms } = useAuditFilters();
  const date = (value: string) => value.split("-").reverse().join("/");
  const visible = (type === "students" ? cards.slice(0, 2) : cards.slice(2)).filter(([title]) => platforms.some((platform) => title.endsWith(platform)));
  return <section className="mt-7"><div className="flex items-end justify-between gap-4"><div><h2 className="text-sm font-semibold tracking-[.03em] text-[#243e54]">ASISTENCIA</h2><p className="mt-1 text-[11px] font-medium text-[#2d4b64]">{date(startDate)} – {date(endDate)}</p><p className="mt-1 text-[8px] text-[#91a2b5]">Comportamiento diario durante el periodo seleccionado</p></div><div className="flex gap-1.5">{[["students", "Estudiantes"], ["teachers", "Docentes"]].map(([value, label]) => <button key={value} onClick={() => setType(value as "students" | "teachers")} className={`h-[27px] rounded-md border bg-white px-3 text-[8px] ${type === value ? "border-[#1671d3] text-[#1671d3]" : "border-[#d5dee7] text-[#5f7488]"}`}>{label}</button>)}</div></div><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">{visible.map(([title, value, subtitle, accent]) => <article key={title} className="min-h-[115px] rounded-lg border border-[#d7e0e8] bg-white p-4"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${accent === "blue" ? "bg-[#e9f3ff]" : "bg-[#f1ebff]"}`}><ClipboardCheck className={`h-4 w-4 ${accent === "blue" ? "text-[#1671d3]" : "text-[#7548f4]"}`} /></span><h3 className="text-[8px] font-semibold uppercase text-[#587086]">{title}</h3></div><p className={`mt-4 text-[25px] font-medium ${accent === "blue" ? "text-[#1671d3]" : "text-[#7548f4]"}`}>{value}</p><p className="mt-3 text-[8px] text-[#92a3b5]">{subtitle}</p></article>)}</div><AttendanceChart /></section>;
}
