"use client";

import { Plus, Trash2 } from "lucide-react";
import { componentPercent, typeColors, type AvanceProduccion, type ProductionComponent, type ProductionType, type XaiSubject } from "@/lib/productionProgress";

// Editor de "Avance de producción" (Kira y xAI) en el formulario de Aprendizaje.

const input = "w-full rounded-md border border-[#d8e4ee] bg-white px-2 py-1.5 text-[11px] text-[#243f57] outline-none focus:border-[#5d9ed8] focus:ring-1 focus:ring-[#dceeff]";
const label = "mb-0.5 block text-[9px] font-semibold uppercase tracking-[.04em] text-[#71869a]";
const addButton = "flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-[#176fc8] hover:underline";
const removeButton = "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#9aabbb] transition hover:bg-[#fff1f1] hover:text-[#c05050]";
const parseNumber = (raw: string): number | null => {
  if (raw.trim() === "") return null;
  const numeric = Number(raw);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : null;
};

export default function ProductionProgressEditor({ value, onChange, showKira = true }: { value: AvanceProduccion; onChange: (value: AvanceProduccion) => void; showKira?: boolean }) {
  const types = value.kira.tipos;
  const setTypes = (tipos: ProductionType[]) => onChange({ ...value, kira: { tipos } });
  const updateType = (index: number, next: ProductionType) => setTypes(types.map((type, typeIndex) => (typeIndex === index ? next : type)));
  const updateComponent = (typeIndex: number, componentIndex: number, next: ProductionComponent) => {
    const type = types[typeIndex];
    updateType(typeIndex, { ...type, componentes: type.componentes.map((item, index) => (index === componentIndex ? next : item)) });
  };
  const subjects = value.xai.materias;
  const setXai = (xai: Partial<AvanceProduccion["xai"]>) => onChange({ ...value, xai: { ...value.xai, ...xai } });
  const updateSubject = (index: number, next: XaiSubject) => setXai({ materias: subjects.map((item, itemIndex) => (itemIndex === index ? next : item)) });

  return <div className="space-y-4">
    {/* Kira */}
    {showKira ? <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold text-[#294b68]">Kira · tipos y componentes</p>
          <p className="text-[9px] text-[#8a9cab]">El porcentaje de cada componente se calcula con las clases producidas entre las clases totales.</p>
        </div>
        <button type="button" onClick={() => setTypes([...types, { letra: "", descripcion: "", componentes: [{ nombre: "", clasesProducidas: null, clasesTotales: null }] }])} className={addButton}><Plus size={12} />Agregar tipo</button>
      </div>
      {types.length === 0 ? <p className="rounded-lg border border-dashed border-[#cbd6e0] p-4 text-center text-[10px] text-[#8b9daf]">Sin tipos. La pestaña KIRA no se mostrará en el dashboard.</p> : null}
      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        {types.map((type, typeIndex) => {
          const colors = typeColors(typeIndex);
          return <article key={typeIndex} className="rounded-lg border border-[#dce7ef] bg-[#f8fbfe] p-3" style={{ borderTop: `3px solid ${colors.accent}` }}>
            <div className="flex items-end gap-2">
              <label className="w-14 shrink-0"><span className={label}>Letra</span><input value={type.letra} placeholder={String.fromCharCode(65 + (typeIndex % 26))} maxLength={2} onChange={(event) => updateType(typeIndex, { ...type, letra: event.target.value.toUpperCase() })} className={`${input} text-center font-bold`} style={{ color: colors.accent }} /></label>
              <label className="min-w-0 flex-1"><span className={label}>Descripción</span><input value={type.descripcion} placeholder="Ej. Estudiantes con bajo rezago" onChange={(event) => updateType(typeIndex, { ...type, descripcion: event.target.value })} className={input} /></label>
              <button type="button" onClick={() => setTypes(types.filter((_, index) => index !== typeIndex))} aria-label={`Quitar tipo ${type.letra}`} title="Quitar tipo" className={removeButton}><Trash2 size={13} /></button>
            </div>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_64px_64px_36px_28px] gap-1.5 text-[8px] font-semibold uppercase tracking-[.04em] text-[#71869a]"><span>Componente</span><span className="truncate" title="Clases producidas">Prod.</span><span className="truncate" title="Clases totales">Total</span><span className="text-right">%</span><span /></div>
            <div className="mt-1 space-y-1.5">
              {type.componentes.map((item, componentIndex) => {
                const invalid = item.clasesProducidas !== null && item.clasesTotales !== null && item.clasesProducidas > item.clasesTotales;
                return <div key={componentIndex} className="grid grid-cols-[minmax(0,1fr)_64px_64px_36px_28px] items-center gap-1.5">
                  <input value={item.nombre} placeholder="Ej. Lenguaje" aria-label="Componente" onChange={(event) => updateComponent(typeIndex, componentIndex, { ...item, nombre: event.target.value })} className={input} />
                  <input type="number" min={0} step={1} value={item.clasesProducidas ?? ""} placeholder="Ej. 2" aria-label="Clases producidas" onChange={(event) => updateComponent(typeIndex, componentIndex, { ...item, clasesProducidas: parseNumber(event.target.value) })} className={`${input} text-center ${invalid ? "bg-[#fff3f3] text-[#c03030]" : ""}`} title={invalid ? "Las clases producidas no pueden superar las totales" : undefined} />
                  <input type="number" min={0} step={1} value={item.clasesTotales ?? ""} placeholder="Ej. 3" aria-label="Clases totales" onChange={(event) => updateComponent(typeIndex, componentIndex, { ...item, clasesTotales: parseNumber(event.target.value) })} className={`${input} text-center`} />
                  <span className="text-right text-[10px] font-semibold tabular-nums" style={{ color: colors.accent }}>{componentPercent(item)}%</span>
                  <button type="button" onClick={() => updateType(typeIndex, { ...type, componentes: type.componentes.filter((_, index) => index !== componentIndex) })} aria-label="Quitar componente" className={removeButton}><Trash2 size={12} /></button>
                </div>;
              })}
            </div>
            <button type="button" onClick={() => updateType(typeIndex, { ...type, componentes: [...type.componentes, { nombre: "", clasesProducidas: null, clasesTotales: null }] })} className={`${addButton} mt-2`}><Plus size={12} />Agregar componente</button>
          </article>;
        })}
      </div>
    </div> : null}

    {/* xAI */}
    <div className={showKira ? "border-t border-[#e4ecf2] pt-4" : ""}>
      <p className="text-[11px] font-bold text-[#294b68]">xAI · estado y materias</p>
      <p className="text-[9px] text-[#8a9cab]">Deja el estado vacío y sin materias para ocultar la pestaña xAI en el dashboard.</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <label><span className={label}>Estado de la plataforma</span><input value={value.xai.estado} placeholder="Ej. En funcionamiento" onChange={(event) => setXai({ estado: event.target.value })} className={input} /></label>
        <label><span className={label}>Alcance actual</span><input value={value.xai.alcance} placeholder="Ej. 6.º grado" onChange={(event) => setXai({ alcance: event.target.value })} className={input} /></label>
      </div>
      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_64px_28px] gap-1.5 text-[8px] font-semibold uppercase tracking-[.04em] text-[#71869a]"><span>Materia</span><span>Detalle</span><span className="text-center">Activa</span><span /></div>
      <div className="mt-1 space-y-1.5">
        {subjects.map((subject, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_64px_28px] items-center gap-1.5">
          <input value={subject.nombre} placeholder="Ej. Lenguaje" aria-label="Materia" onChange={(event) => updateSubject(index, { ...subject, nombre: event.target.value })} className={input} />
          <input value={subject.detalle} placeholder="Ej. Tipo B · 6.º grado" aria-label="Detalle" onChange={(event) => updateSubject(index, { ...subject, detalle: event.target.value })} className={input} />
          <label className="flex justify-center"><input type="checkbox" checked={subject.activa} aria-label="Materia activa" onChange={(event) => updateSubject(index, { ...subject, activa: event.target.checked })} className="h-4 w-4 cursor-pointer accent-[#176fc8]" /></label>
          <button type="button" onClick={() => setXai({ materias: subjects.filter((_, itemIndex) => itemIndex !== index) })} aria-label="Quitar materia" className={removeButton}><Trash2 size={12} /></button>
        </div>)}
      </div>
      <button type="button" onClick={() => setXai({ materias: [...subjects, { nombre: "", detalle: "", activa: true }] })} className={`${addButton} mt-2`}><Plus size={12} />Agregar materia</button>
    </div>
  </div>;
}
