"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import BlockDetailModal from "./BlockDetailModal";
import EvaluationProgress from "./EvaluationProgress";
import EvaluationSummary from "./EvaluationSummary";
import TestCard from "./TestCard";
import type { TestType } from "./evaluationData";
export default function EvaluationPage(){const[progress,setProgress]=useState(false);const[selected,setSelected]=useState<TestType|null>(null);const{startDate,endDate}=useAuditFilters();if(progress)return <EvaluationProgress onBack={()=>setProgress(false)}/>;return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="bg-[#102a42] px-4 pb-4"><div className="mx-auto max-w-[1020px]"><EvaluationSummary/></div></div><div className="mx-auto max-w-[1020px] px-4 pb-16 pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold tracking-[.04em]">SEGUIMIENTO DE APLICACIÓN</h2><p className="mt-1 text-[8px] text-[#8fa1b5]">{startDate} → {endDate}</p></div><button onClick={()=>setProgress(true)} className="flex h-[30px] items-center gap-2 rounded-md border border-[#b8d2ee] bg-white px-3 text-[8px] text-[#176fc8]">Avance · Resultados · Progreso<ChevronRight className="h-3 w-3"/></button></div><div className="mt-5 space-y-4"><TestCard title="Prueba CML" accent="blue" schoolPercentage={81} schoolApplied="612" schoolPending="142" enrollmentPercentage={77} enrollmentApplied="10,842" enrollmentPending="3318" onDetail={()=>setSelected("cml")}/><TestCard title="Prueba Progreso" accent="purple" schoolPercentage={76} schoolApplied="574" schoolPending="180" enrollmentPercentage={68} enrollmentApplied="9638" enrollmentPending="4522" onDetail={()=>setSelected("progreso")}/></div></div>{selected&&<BlockDetailModal title={selected==="cml"?"PRUEBA CML":"PRUEBA PROGRESO"} onClose={()=>setSelected(null)}/>}</main>;}
