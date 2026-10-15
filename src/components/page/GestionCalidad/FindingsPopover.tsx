"use client";

import { ChevronDown, X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FindingsDetailsContent } from "./FindingsDetailsPage";

// "Ver detalles" de Hallazgos: abre el detalle en un panel flotante junto al botón.
// Se dibuja encima del dashboard (portal en el body), así que no empuja el resto del contenido.

const GAP = 8;
const MARGIN = 16;
const MAX_WIDTH = 760;

type Position = { top: number; left: number; width: number; maxHeight: number; placement: "below" | "above" };

// El body tiene zoom; las coordenadas de getBoundingClientRect vienen escaladas.
const bodyZoom = () => {
  const zoom = Number.parseFloat(getComputedStyle(document.body).zoom || "1");
  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
};

// Borde inferior de las barras fijas superiores (encabezado y selector de fecha), para no quedar debajo de ellas.
const stickyTop = (zoom: number) => {
  let bottom = 0;
  document.querySelectorAll<HTMLElement>("body *").forEach((element) => {
    const { position } = getComputedStyle(element);
    if (position !== "fixed" && position !== "sticky") return;
    const rect = element.getBoundingClientRect();
    if (rect.top <= 1 && rect.bottom > 0 && rect.bottom < window.innerHeight / 2 && rect.width > window.innerWidth / 2) bottom = Math.max(bottom, rect.bottom);
  });
  return bottom / zoom;
};

export default function FindingsPopover() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const place = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;
    const zoom = bodyZoom();
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth / zoom;
    const viewportHeight = window.innerHeight / zoom;
    const anchor = { top: rect.top / zoom, bottom: rect.bottom / zoom, right: rect.right / zoom };
    const width = Math.min(MAX_WIDTH, viewportWidth - MARGIN * 2);
    // Alineado al borde derecho del botón, sin salirse de la pantalla.
    const left = Math.max(MARGIN, Math.min(anchor.right - width, viewportWidth - width - MARGIN));
    const spaceBelow = viewportHeight - anchor.bottom - GAP - MARGIN;
    const spaceAbove = anchor.top - GAP - Math.max(MARGIN, stickyTop(zoom) + GAP);
    const placement = spaceBelow >= 320 || spaceBelow >= spaceAbove ? "below" : "above";
    const maxHeight = Math.max(200, placement === "below" ? spaceBelow : spaceAbove);
    const top = placement === "below" ? anchor.bottom + GAP : anchor.top - GAP;
    setPosition({ top, left, width, maxHeight, placement });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open, place]);

  return <>
    <button ref={buttonRef} type="button" aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen((value) => !value)} className={`inline-flex items-center gap-1 rounded-md border border-[#f3c8c8] px-2 py-1 text-[9px] font-semibold text-[#d83b3b] transition hover:bg-[#fff7f7] focus:outline-none focus:ring-2 focus:ring-[#f3c8c8] ${open ? "bg-[#fff2f2]" : "bg-white"}`}>
      Ver detalles<ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && position ? createPortal(
      <div ref={panelRef} role="dialog" aria-label="Detalle de hallazgos" className="fixed z-[70] flex flex-col overflow-hidden rounded-xl border border-[#d9e1e8] bg-[#f4f7fb] shadow-[0_18px_48px_rgba(15,35,55,.22)]" style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight, transform: position.placement === "above" ? "translateY(-100%)" : undefined }}>
        <div className="flex items-center justify-between gap-3 border-b border-[#e3e9ef] bg-white px-4 py-3">
          <div>
            <p className="text-[8px] font-semibold uppercase tracking-[.1em] text-[#71869a]">Gestión de Calidad</p>
            <h2 className="mt-0.5 text-[12px] font-semibold tracking-[.04em] text-[#27435c]">DETALLE DE HALLAZGOS</h2>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar detalle" className="flex h-7 w-7 items-center justify-center rounded-md text-[#71869a] transition hover:bg-[#f1f5f9] hover:text-[#27435c]"><X className="h-4 w-4" /></button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"><FindingsDetailsContent /></div>
      </div>,
      document.body,
    ) : null}
  </>;
}
