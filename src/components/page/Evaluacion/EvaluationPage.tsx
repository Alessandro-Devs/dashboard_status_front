"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import BarreraAplicacionCard from "./BarreraAplicacionCard";
import BlockDetailModal from "./BlockDetailModal";
import TestCard from "./TestCard";
import { hasBlockDetail, type TestType } from "./evaluationData";
import { getEvaluacion, tieneTexto } from "./evaluationViewData";
export default function EvaluationPage() {
    const [selected, setSelected] = useState<TestType | null>(null);
    const evaluacion = getEvaluacion();
    const pruebas = evaluacion.pruebas ?? {};
    const tarjetas = (["cml", "progreso"] as const).flatMap((id) => {
        const prueba = pruebas[id];
        const tieneResumen = Boolean(prueba?.centrosEscolares?.porcentaje !== null || prueba?.matricula?.porcentaje !== null) ||
            [prueba?.centrosEscolares?.aplicados, prueba?.centrosEscolares?.universo, prueba?.matricula?.aplicados, prueba?.matricula?.universo].some(tieneTexto);
        return prueba && tieneTexto(prueba.titulo) && tieneResumen ? [{ id, prueba }] : [];
    });
    return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto max-w-[1020px] px-4 pb-16 pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-[.04em]">SEGUIMIENTO DE APLICACION</h2>
        <Link href="/evaluacion/progreso" className="flex h-[30px] items-center gap-2 rounded-md border border-[#b8d2ee] bg-white px-3 text-[8px] text-[#176fc8]">
          Resultados
          <ChevronRight className="h-3 w-3"/>
        </Link>
      </div>
      <div className="mt-5 space-y-4">
        {tarjetas.length === 0 && <article className="rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-8 text-center"><p className="text-[12px] font-semibold text-[#526a80]">Sin registros de aplicacion</p><p className="mt-2 text-[10px] text-[#8b9daf]">No hay datos disponibles para las pruebas del periodo seleccionado.</p></article>}
        {tarjetas.map(({ id, prueba }) => <TestCard key={id} title={prueba.titulo} accent="blue" schoolPercentage={prueba.centrosEscolares.porcentaje ?? 0} schoolUniverse={prueba.centrosEscolares.universo} schoolApplied={prueba.centrosEscolares.aplicados} schoolPending={prueba.centrosEscolares.pendientes} enrollmentPercentage={prueba.matricula.porcentaje ?? 0} enrollmentUniverse={prueba.matricula.universo} enrollmentApplied={prueba.matricula.aplicados} enrollmentPending={prueba.matricula.pendientes} onDetail={hasBlockDetail(id) ? () => setSelected(id) : undefined}/>)}
        <BarreraAplicacionCard />
      </div>
    </div>
    {selected && <BlockDetailModal testType={selected} title={selected === "cml" ? "PRUEBA CML" : "PRUEBA PROGRESO"} onClose={() => setSelected(null)}/>}
  </main>;
}
