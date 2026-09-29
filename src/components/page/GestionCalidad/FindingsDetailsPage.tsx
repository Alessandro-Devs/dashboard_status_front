"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDashboardData } from "@/stores/DashboardDataContext";
import CustomHtmlRenderer from "./CustomHtmlRenderer";
import { getCustomHtml } from "./qualityData";

export default function FindingsDetailsPage() {
  const router = useRouter();
  const { isLoading } = useDashboardData();
  const html = getCustomHtml();

  return <main className="min-h-screen bg-[#f4f7fb] px-4 py-5 text-[#223b53] sm:px-6"><div className="mx-auto max-w-[1080px]"><div className="mb-5 flex items-center justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[.1em] text-[#71869a]">Gestión de Calidad</p><h1 className="mt-1 text-[17px] font-bold text-[#20394e]">Detalle de hallazgos</h1></div><button type="button" onClick={() => router.push("/#gestion-calidad")} className="inline-flex items-center gap-1.5 rounded-md border border-[#d8e0e8] bg-white px-2.5 py-1.5 text-[10px] font-semibold text-[#667b90] transition hover:bg-[#f8fafc]"><ArrowLeft size={13}/>Volver</button></div>{isLoading ? <div className="rounded-xl border border-[#d9e1e8] bg-white p-8 text-center text-[11px] text-[#71869a]">Cargando detalles...</div> : html ? <section className="w-full overflow-hidden"><CustomHtmlRenderer html={html}/></section> : <div className="rounded-xl border border-dashed border-[#cbd6e0] bg-white p-8 text-center text-[11px] text-[#71869a]">No hay detalles registrados para esta fecha.</div>}</div></main>;
}
