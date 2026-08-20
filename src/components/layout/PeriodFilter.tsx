"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronDown } from "lucide-react";

type PeriodFilterProps =
  | { date: string; onApply: (date: string) => void }
  | { startDate: string; endDate: string; onApply: (startDate: string, endDate: string) => void };

export default function PeriodFilter(props: PeriodFilterProps) {
  const date = "date" in props ? props.date : props.endDate;
  const [open, setOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(date);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return <div ref={ref} className="relative ml-auto shrink-0">
    <label className="mb-1 block text-[8px] font-semibold uppercase tracking-wide text-[#b8cada]">Fecha de corte</label>
    <button type="button" aria-expanded={open} onClick={() => { setDraftDate(date); setOpen((value) => !value); }} className="flex h-[29px] w-[152px] items-center gap-2 rounded-sm border border-[#496176] bg-[#152f44] px-2.5 text-[9px] font-medium text-white"><CalendarDays size={12} className="text-[#9fb4c5]" /><span className="flex-1 truncate text-left">{formatDate(date)}</span><ChevronDown size={11} className={`transition ${open ? "rotate-180" : ""}`} /></button>
    {open && <div className="absolute right-0 top-[42px] z-50 w-[230px] rounded-md border border-[#d8e0e9] bg-white p-3 text-[#50657a] shadow-[0_10px_25px_rgba(0,0,0,.18)]">
      <p className="mb-3 text-[8px] font-semibold uppercase tracking-wide text-[#7d91a8]">Consultar fecha</p>
      <DateField label="Fecha de corte" value={draftDate} onChange={setDraftDate} />
      <button type="button" onClick={() => { if ("date" in props) props.onApply(draftDate); else props.onApply(draftDate, draftDate); setOpen(false); }} className="mt-3 h-[29px] w-full rounded-sm bg-[#17263a] text-[8px] font-semibold text-white hover:bg-[#0d1b2d]">Consultar datos</button>
    </div>}
  </div>;
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block text-[8px] font-medium">{label}<input type="date" value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-[30px] w-full rounded-sm border border-[#d5dee7] bg-white px-2 text-[9px] outline-none focus:border-[#2680eb]" /></label>;
}

function formatDate(value: string) { const [year, month, day] = value.split("-"); return `${day}/${month}/${year}`; }
