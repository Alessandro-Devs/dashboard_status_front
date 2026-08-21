"use client";

import { useEffect, useMemo, useState } from "react";
import { getBlockData, getEnrollmentData, type BlockItem, type TestType } from "./evaluationData";

type DetailMode = "centros" | "matricula";

export default function BlockDetailModal({ testType, title, onClose }:{ testType:TestType; title:string; onClose:()=>void }) {
  const [mode, setMode] = useState<DetailMode>("centros");
  const data = mode === "centros" ? getBlockData(testType) : getEnrollmentData(testType);
  const totals = useMemo(() => data.reduce((sum, item) => ({ universe: sum.universe + item.universe, applied: sum.applied + item.applied, pending: sum.pending + item.pending }), { universe: 0, applied: 0, pending: 0 }), [data]);
  const percentage = totals.universe ? Math.round((totals.applied / totals.universe) * 100) : 0;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#17324a]/55 p-4">
    <div role="dialog" aria-modal="true" aria-labelledby="block-detail-title" className="max-h-[95vh] w-full max-w-[680px] overflow-hidden rounded-[11px] border-t-[3px] border-[#2f82d5] bg-white shadow-[0_22px_50px_rgba(15,35,55,.25)]">
      <header className="flex items-start justify-between px-4 pb-3 pt-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#eaf4ff] px-2 py-1 text-[6px] font-semibold uppercase text-[#2a79c8]">{title}</span>
            <span className="text-[7px] text-[#6f8294]">Detalle por bloque</span>
          </div>
          <h2 id="block-detail-title" className="mt-2 font-serif text-lg font-bold text-[#1f3448]">Distribucion de aplicacion B1-B5</h2>
          <p className="mt-1 text-[6px] text-[#8799aa]">Aplicacion registrada respecto al universo de cada bloque.</p>
        </div>
        <button type="button" aria-label="Cerrar detalle" onClick={onClose} className="text-lg text-[#8ea1b4] hover:text-[#4c6277]">x</button>
      </header>
      <div className="flex items-center justify-between border-y border-[#dfe6ed] bg-[#fbfcfd] px-4 py-2.5">
        <span className="text-[6px] font-semibold uppercase text-[#657b90]">Desagregar por</span>
        <div className="flex overflow-hidden rounded border">
          <ModeButton active={mode==="centros"} onClick={()=>setMode("centros")}>Centros escolares</ModeButton>
          <ModeButton active={mode==="matricula"} onClick={()=>setMode("matricula")}>Matricula</ModeButton>
        </div>
      </div>
      <div className="max-h-[calc(95vh-145px)] overflow-y-auto px-4 py-4">
        {data.length > 0 ? <>
          <div className="grid grid-cols-3 gap-2.5">
            <Metric label="Universo" value={format(totals.universe)} />
            <Metric label="Aplicados" value={format(totals.applied)} subtitle={`${percentage}% del universo`} valueClass="text-[#176fc8]" />
            <Metric label="Pendientes" value={format(totals.pending)} subtitle={`${Math.max(100 - percentage, 0)}% del universo`} danger />
          </div>
          <ChartCard data={data} />
          <section className="mt-4">
            <h3 className="text-[6px] font-semibold uppercase tracking-wide text-[#62788d]">Resumen por bloque</h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-5">{data.map((item) => <BlockSummary key={item.block} item={item} />)}</div>
          </section>
        </> : <EmptyDetailState mode={mode} />}
      </div>
      <footer className="flex h-[42px] items-center justify-between border-t bg-[#fbfcfd] px-4">
        <p className="text-[5px] text-[#8294a6]">Valores registrados para el periodo seleccionado.</p>
        <button type="button" onClick={onClose} className="h-6 rounded border bg-white px-3 text-[6px] text-[#394f63]">Cerrar detalle</button>
      </footer>
    </div>
  </div>;
}

function ChartCard({ data }:{ data:BlockItem[] }) {
  const max = Math.max(...data.map((item) => item.universe), 1);
  return <section className="mt-3.5 rounded-lg border border-[#dce3ea] bg-white p-3">
    <div className="flex justify-between">
      <div>
        <h3 className="text-[8px] font-semibold text-[#334c61]">Aplicacion por bloque</h3>
        <p className="mt-1 text-[5.5px] text-[#8ea0b1]">Aplicados y pendientes respecto al universo</p>
      </div>
      <div className="flex gap-3 text-[5.5px]"><span>● <i className="not-italic text-[#1f6fc1]">Aplicados</i></span><span>● <i className="not-italic text-[#e63737]">Pendientes</i></span></div>
    </div>
    <div className="mt-5 flex h-[190px] items-end justify-around border-b border-[#e7edf3]">{data.map((item) => <div key={item.block} className="flex h-full w-14 flex-col items-center justify-end"><span className="mb-1 text-[6px] font-semibold text-[#ed3333]">{format(item.pending)}</span><div className="w-[29px] rounded-t bg-[#216fc1]" style={{ height: `${Math.max((item.applied / max) * 150, 10)}px` }} /><span className="mt-2 text-[6px] font-semibold">{item.block}</span></div>)}</div>
  </section>;
}

function BlockSummary({ item }:{ item:BlockItem }) { return <div className="rounded-lg border p-2.5"><div className="flex justify-between"><strong className="text-[9px]">{item.block}</strong><span className="rounded-full bg-[#eaf4ff] px-1.5 py-1 text-[5px] text-[#1971c8]">{item.percentage}%</span></div><div className="mt-3 space-y-2 text-[5px]"><p className="flex justify-between"><span>Universo</span><strong>{format(item.universe)}</strong></p><p className="flex justify-between"><span>Aplicados</span><strong className="text-[#1971c8]">{format(item.applied)}</strong></p></div><div className="mt-2.5 rounded bg-[#ffdddd] p-2 text-[5px] text-[#e72f2f]">Pendientes: <strong>{format(item.pending)}</strong></div></div>; }
function Metric({ label, value, subtitle, valueClass = "text-[#2f455a]", danger = false }:{ label:string; value:string; subtitle?:string; valueClass?:string; danger?:boolean }) { return <div className={`min-h-[65px] rounded-md border p-3 ${danger ? "border-[#ffd3d3] bg-[#ffdddd]" : "border-[#dce3ea]"}`}><p className={`text-[5.5px] font-semibold uppercase ${danger ? "text-[#ed3838]" : "text-[#8193a5]"}`}>{label}</p><p className={`mt-2 text-[17px] font-medium ${danger ? "text-[#ed3030]" : valueClass}`}>{value}</p>{subtitle && <p className={`mt-2 text-[5px] ${danger ? "text-[#e94e4e]" : "text-[#8193a5]"}`}>{subtitle}</p>}</div>; }
function ModeButton({ active, onClick, children }:{ active:boolean; onClick:()=>void; children:React.ReactNode }) { return <button type="button" onClick={onClick} className={`h-[25px] border-l px-4 text-[6px] ${active ? "bg-[#176fc8] font-semibold text-white" : "bg-white text-[#5f7488]"}`}>{children}</button>; }
function EmptyDetailState({ mode }:{ mode:DetailMode }) { return <div className="rounded-lg border border-dashed border-[#cbd6e0] bg-[#fbfcfd] px-5 py-10 text-center"><p className="text-[10px] font-semibold text-[#526a80]">Sin detalle por bloque</p><p className="mt-2 text-[8px] text-[#8b9daf]">No hay registros cargados para {mode === "centros" ? "centros escolares" : "matricula"} en el periodo seleccionado.</p></div>; }
function format(value:number) { return new Intl.NumberFormat("es-SV").format(value); }
