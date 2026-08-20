"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BarreraAplicacionCard from "./BarreraAplicacionCard";
import BlockDetailModal from "./BlockDetailModal";
import TestCard from "./TestCard";
import type { TestType } from "./evaluationData";
import { getEvaluacion, tieneTexto } from "./evaluationViewData";

export default function EvaluationPage() {
  const [selected, setSelected] = useState<TestType | null>(null);
  const pruebas = getEvaluacion().pruebas ?? {};
  const detalle=getEvaluacion().detallePorBloque;
  const tieneDetalle=Boolean(detalle?.centrosEscolares.length||detalle?.matricula.length);
  const tarjetas = (["cml","progreso"] as const).flatMap((id) => { const prueba=pruebas[id]; return prueba&&tieneTexto(prueba.titulo)?[{id,prueba}]:[]; });
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto max-w-[1020px] px-4 pb-16 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-semibold tracking-[.04em]">SEGUIMIENTO DE APLICACIÓN</h2><Link href="/evaluacion/progreso" className="flex h-[30px] items-center gap-2 rounded-md border border-[#b8d2ee] bg-white px-3 text-[8px] text-[#176fc8]">Avance · Resultados · Progreso<ChevronRight className="h-3 w-3" /></Link></div>
      <div className="mt-5 space-y-4">
        {tarjetas.map(({id,prueba})=><TestCard key={id} title={prueba.titulo} accent={id==="cml"?"blue":"purple"} schoolPercentage={prueba.centrosEscolares.porcentaje??0} schoolUniverse={prueba.centrosEscolares.universo} schoolApplied={prueba.centrosEscolares.aplicados} schoolPending={prueba.centrosEscolares.pendientes} enrollmentPercentage={prueba.matricula.porcentaje??0} enrollmentUniverse={prueba.matricula.universo} enrollmentApplied={prueba.matricula.aplicados} enrollmentPending={prueba.matricula.pendientes} onDetail={tieneDetalle?()=>setSelected(id):undefined} />)}
        <BarreraAplicacionCard />
      </div>
    </div>
    {selected && <BlockDetailModal title={selected === "cml" ? "PRUEBA CML" : "PRUEBA PROGRESO"} onClose={() => setSelected(null)} />}
  </main>;
}
