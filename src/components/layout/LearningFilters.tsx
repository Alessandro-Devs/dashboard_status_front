"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
type Option = {
    id: string;
    label: string;
};
const trimesterOptions: Option[] = [{ id: "t1", label: "Trimestre 1" }, { id: "t2", label: "Trimestre 2" }, { id: "t3", label: "Trimestre 3" }, { id: "t4", label: "Trimestre 4" }];
const lineOptions: Option[] = [{ id: "ihfb", label: "IHFB" }, { id: "kira", label: "Kira" }, { id: "xai", label: "xAI" }];
export default function LearningFilters() {
    const { trimesters, setTrimesters, learningLines, setLearningLines } = useAuditFilters();
    return <div className="flex flex-wrap items-end gap-3"><MultiSelect label="TRIMESTRE" header="SELECCIONAR TRIMESTRE" options={trimesterOptions} selected={trimesters} setSelected={setTrimesters} width="w-[105px]"/><MultiSelect label="LÍNEA / APLICATIVO" header="SELECCIONAR LÍNEA / APLICATIVO" options={lineOptions} selected={learningLines} setSelected={setLearningLines} width="w-[110px]"/></div>;
}
function MultiSelect({ label, header, options, selected, setSelected, width }: {
    label: string;
    header: string;
    options: Option[];
    selected: string[];
    setSelected: (value: string[]) => void;
    width: string;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const all = selected.length === 0;
    useEffect(() => { const close = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node))
        setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
    const toggle = (id: string) => setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
    const display = all ? "Todos" : selected.length === 1 ? options.find((item) => item.id === selected[0])?.label : `${selected.length} seleccionados`;
    return <div ref={ref} className="relative"><label className="mb-1 block text-[7px] font-semibold uppercase text-[#a5b8c8]">{label}</label><button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`${width} flex h-7 items-center justify-between rounded border border-[#526a7e] bg-[#17364d] px-2 text-[8px] text-white`}><span className="truncate">{display}</span><ChevronDown className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}/></button>{open && <div className="absolute right-0 top-[39px] z-50 w-[180px] rounded-md border border-[#d8e0e8] bg-white p-2 shadow-xl"><p className="px-1 pb-2 text-[7px] font-semibold uppercase text-[#8497ab]">{header}</p><Choice label="Todos" checked={all} onClick={() => setSelected([])}/><div className="my-1 border-t"/>{options.map((option) => <Choice key={option.id} label={option.label} checked={selected.includes(option.id)} onClick={() => toggle(option.id)}/>)}</div>}</div>;
}
function Choice({ label, checked, onClick }: {
    label: string;
    checked: boolean;
    onClick: () => void;
}) { return <button type="button" role="checkbox" aria-checked={checked} onClick={onClick} className="flex w-full items-center gap-2 rounded px-1 py-1.5 text-left text-[8px] text-[#42596e] hover:bg-[#f5f8fb]"><span className={`flex h-3 w-3 items-center justify-center rounded-sm border ${checked ? "border-[#2680eb] bg-[#2680eb]" : "border-[#c7d3de]"}`}>{checked && <Check className="h-2 w-2 text-white"/>}</span>{label}</button>; }
