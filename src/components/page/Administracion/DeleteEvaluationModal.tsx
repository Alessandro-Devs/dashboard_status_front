"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";

export default function DeleteEvaluationModal({ date, deleting, onCancel, onConfirm, moduleName = "Evaluación" }: { date: string; deleting: boolean; onCancel: () => void; onConfirm: () => void; moduleName?: string }) {
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#102c42]/45 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) onCancel(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="delete-evaluation-title" className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_24px_70px_rgba(15,40,60,.25)]">
      <div className="flex justify-end px-4 pt-3"><button type="button" onClick={onCancel} disabled={deleting} aria-label="Cerrar confirmación" className="rounded-lg p-1.5 text-[#8496a6] transition hover:bg-[#f0f4f7] hover:text-[#526a80] disabled:opacity-40"><X size={17}/></button></div>
      <div className="px-6 pb-6 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0f0] text-[#dc4545]"><AlertTriangle size={22}/></span><h2 id="delete-evaluation-title" className="mt-4 text-base font-bold text-[#213b52]">Eliminar registro</h2><p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-[#708598]">Se eliminará permanentemente la información de {moduleName} correspondiente a:</p><p className="mx-auto mt-3 w-fit rounded-lg bg-[#f3f7fa] px-4 py-2 text-sm font-bold text-[#294b68]">{date}</p><p className="mt-3 text-[10px] text-[#95a5b3]">Esta acción no se puede deshacer.</p></div>
      <footer className="flex gap-2 border-t border-[#e4ebf1] bg-[#f8fafc] px-5 py-3"><button type="button" onClick={onCancel} disabled={deleting} className="h-9 flex-1 rounded-lg border border-[#d3dfe8] bg-white text-xs font-semibold text-[#61788c] transition hover:bg-[#f3f7fa] disabled:opacity-50">Cancelar</button><button type="button" onClick={onConfirm} disabled={deleting} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#dc4545] text-xs font-semibold text-white transition hover:bg-[#c93939] disabled:cursor-wait disabled:opacity-60"><Trash2 size={13}/>{deleting ? "Eliminando..." : "Sí, eliminar"}</button></footer>
    </section>
  </div>;
}
