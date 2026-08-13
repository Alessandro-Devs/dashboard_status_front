"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import EvaluationProgress from "./EvaluationProgress";
import TestCard from "./TestCard";
import BarreraAplicacionCard from "./BarreraAplicacionCard";
import { dashboardDatabase } from "@/data/dashboardDatabase";

export default function EvaluationPage() {
  const [progress, setProgress] = useState(false);
  const cml = dashboardDatabase.evaluacion.pruebas.cml;

  if (progress) return <EvaluationProgress onBack={() => setProgress(false)} />;

  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto max-w-[1020px] px-4 pb-16 pt-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold tracking-[.04em]">SEGUIMIENTO DE APLICACIÓN</h2><button onClick={() => setProgress(true)} className="flex h-[30px] items-center gap-2 rounded-md border border-[#b8d2ee] bg-white px-3 text-[8px] text-[#176fc8]">Avance · Resultados · Progreso<ChevronRight className="h-3 w-3" /></button></div><div className="mt-5 space-y-4"><TestCard {...cml} accent="blue" /><BarreraAplicacionCard /></div></div></main>;
}
