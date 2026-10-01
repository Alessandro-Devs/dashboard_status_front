"use client";

import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { apiFetch } from "@/services/api";

type PeriodFilterProps = {
  date: string;
  onApply: (date: string) => void;
};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

type MonthKey = { year: number; month: number };

const pad = (value: number) => String(value).padStart(2, "0");
const toIso = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const parseIso = (value: string): MonthKey & { day: number } | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) } : null;
};
const monthIndex = ({ year, month }: MonthKey) => year * 12 + month;
const formatDisplay = (value: string) => {
  const parsed = parseIso(value);
  return parsed ? `${pad(parsed.day)}/${pad(parsed.month + 1)}/${parsed.year}` : "Seleccionar";
};

// Las fechas con datos se consultan una sola vez y se comparten entre montajes.
let availableDatesPromise: Promise<string[] | null> | null = null;
function loadAvailableDates() {
  availableDatesPromise ??= apiFetch<{ dates?: unknown }>("/dashboard/dates")
    .then(({ dates }) => (Array.isArray(dates) ? dates.filter((item): item is string => typeof item === "string") : null))
    .catch(() => {
      availableDatesPromise = null;
      return null;
    });
  return availableDatesPromise;
}

export default function PeriodFilter({ date, onApply }: PeriodFilterProps) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>({ mobile: false, top: 0, left: 0 });
  const [availableDates, setAvailableDates] = useState<string[] | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let active = true;
    loadAvailableDates().then((dates) => { if (active) setAvailableDates(dates); });
    return () => { active = false; };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  return (
    <div className="ml-auto shrink-0">
      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-wide text-[#b8cada] 2xl:text-[10px]">Fecha de corte</span>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          if (!open && triggerRef.current) setPlacement(measurePlacement(triggerRef.current));
          setOpen((value) => !value);
        }}
        className="flex h-[29px] w-[152px] cursor-pointer items-center justify-between rounded-sm border border-[#496176] bg-[#152f44] px-2.5 text-[9px] font-medium text-white outline-none transition hover:border-[#75c4fa] focus-visible:border-[#75c4fa] 2xl:h-9 2xl:w-[190px] 2xl:text-[11px]"
      >
        {formatDisplay(date)}
        <CalendarDays className="h-3.5 w-3.5 text-[#b8cada]" />
      </button>
      {open ? (
        <CalendarPopover
          anchor={triggerRef}
          placement={placement}
          onPlacementChange={setPlacement}
          value={date}
          availableDates={availableDates}
          onClose={close}
          onSelect={(selected) => {
            onApply(selected);
            close();
          }}
        />
      ) : null}
    </div>
  );
}

type Placement = { mobile: boolean; top: number; left: number };
function measurePlacement(element: HTMLElement): Placement {
  const rect = element.getBoundingClientRect();
  return { mobile: window.matchMedia("(max-width: 639px)").matches, top: rect.bottom + 6, left: rect.left };
}

function CalendarPopover({ anchor, placement, onPlacementChange, value, availableDates, onClose, onSelect }: {
  anchor: React.RefObject<HTMLButtonElement | null>;
  placement: Placement;
  onPlacementChange: (placement: Placement) => void;
  value: string;
  availableDates: string[] | null;
  onClose: () => void;
  onSelect: (value: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  const dataSet = useMemo(() => new Set(availableDates ?? []), [availableDates]);
  const selected = useMemo(() => parseIso(value), [value]);
  const todayKey = useMemo(() => { const today = new Date(); return { year: today.getFullYear(), month: today.getMonth() }; }, []);

  // Límites de navegación: del primer al último mes con datos (o hasta hoy si no hay lista).
  const bounds = useMemo(() => {
    const parsed = (availableDates ?? []).map(parseIso).filter((item): item is NonNullable<typeof item> => item !== null);
    const indexes = parsed.map(monthIndex);
    if (selected) indexes.push(monthIndex(selected));
    return {
      min: availableDates && indexes.length ? Math.min(...indexes) : -Infinity,
      max: indexes.length ? Math.max(...indexes, availableDates ? -Infinity : monthIndex(todayKey)) : monthIndex(todayKey),
    };
  }, [availableDates, selected, todayKey]);

  const [view, setView] = useState<MonthKey>(() => selected ? { year: selected.year, month: selected.month } : todayKey);
  const canGoPrev = monthIndex(view) > bounds.min;
  const canGoNext = monthIndex(view) < bounds.max;
  const shiftMonth = (step: number) => setView(({ year, month }) => {
    const next = year * 12 + month + step;
    return { year: Math.floor(next / 12), month: next % 12 };
  });

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.left = "0px";
    panel.style.top = "0px";
    panel.style.width = "";
    panel.style.maxHeight = "";
    let origin = panel.getBoundingClientRect();
    // Relación entre píxeles de pantalla y píxeles CSS del panel (cubre el zoom de globals.css).
    const scale = origin.width / (panel.offsetWidth || origin.width) || 1;
    if (placement.mobile) {
      // Teléfono: centrado en la pantalla, hasta 340px y con 16px de margen a cada lado.
      const width = Math.min(340, window.innerWidth - 32);
      panel.style.width = `${width / scale}px`;
      origin = panel.getBoundingClientRect();
      const left = (window.innerWidth - origin.width) / 2;
      const top = Math.max(16, (window.innerHeight - origin.height) / 2);
      panel.style.left = `${(left - origin.left) / scale}px`;
      panel.style.top = `${(top - origin.top) / scale}px`;
      panel.style.visibility = "visible";
      return;
    }
    const margin = 12;
    // Ventanas muy bajas: el panel nunca supera el alto disponible y se desplaza por dentro.
    if (origin.height > window.innerHeight - margin * 2) {
      panel.style.maxHeight = `${(window.innerHeight - margin * 2) / scale}px`;
      panel.style.overflowY = "auto";
      origin = panel.getBoundingClientRect();
    }
    const maxLeft = window.innerWidth - origin.width - margin;
    const left = Math.max(margin, Math.min(placement.left, maxLeft));
    const fitsBelow = placement.top + origin.height <= window.innerHeight - margin;
    const top = fitsBelow ? placement.top : Math.max(margin, window.innerHeight - origin.height - margin);
    panel.style.left = `${(left - origin.left) / scale}px`;
    panel.style.top = `${(top - origin.top) / scale}px`;
    panel.style.visibility = "visible";
  }, [placement]);

  useEffect(() => {
    const update = () => { if (anchor.current) onPlacementChange(measurePlacement(anchor.current)); };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor, onPlacementChange]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || anchor.current?.contains(target)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    panelRef.current?.querySelector<HTMLButtonElement>("[data-selected='true'], [data-available='true']")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [anchor, onClose]);

  const firstWeekday = (new Date(view.year, view.month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {placement.mobile ? <div className="fixed inset-0 z-[1190] bg-[#0f1a2b]/40 backdrop-blur-[2px]" aria-hidden="true" /> : null}
      <div
        ref={panelRef}
        role="dialog"
        aria-label="Seleccionar fecha de corte"
        style={{ top: 0, left: 0, visibility: "hidden" }}
        className={`fixed z-[1200] rounded-2xl border border-[#eef1f5] bg-white p-5 text-[#1e2340] sm:rounded-xl sm:p-4 shadow-[0_18px_48px_rgba(15,26,43,0.16)] ${placement.mobile ? "" : "w-[248px]"}`}
      >
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => shiftMonth(-1)} disabled={!canGoPrev} aria-label="Mes anterior" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#475569] sm:h-6 sm:w-6 transition hover:bg-[#f1f5f9] disabled:cursor-default disabled:text-[#cbd5e1] disabled:hover:bg-transparent">
            <ChevronLeft className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
          <p className="text-[16px] font-bold sm:text-[13.5px]" aria-live="polite">{MONTHS[view.month]} {view.year}</p>
          <button type="button" onClick={() => shiftMonth(1)} disabled={!canGoNext} aria-label="Mes siguiente" className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-[#475569] sm:h-6 sm:w-6 transition hover:bg-[#f1f5f9] disabled:cursor-default disabled:text-[#cbd5e1] disabled:hover:bg-transparent">
            <ChevronRight className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-y-1 text-center sm:mt-3 sm:gap-y-0.5">
          {WEEKDAYS.map((weekday, index) => <span key={index} className="pb-2 text-[12px] font-semibold text-[#9ca3af] sm:pb-1.5 sm:text-[9.5px]">{weekday}</span>)}
          {cells.map((day, index) => {
            if (day === null) return <span key={`empty-${index}`} />;
            const iso = toIso(view.year, view.month, day);
            const isSelected = iso === value;
            const hasData = availableDates === null || dataSet.has(iso);
            const showDot = availableDates !== null && hasData && !isSelected;
            return (
              <div key={iso} className="flex justify-center">
                <button
                  type="button"
                  disabled={!hasData}
                  data-selected={isSelected}
                  data-available={hasData}
                  aria-pressed={isSelected}
                  aria-label={`${day} de ${MONTHS[view.month].toLowerCase()} de ${view.year}${hasData && availableDates ? ", con datos" : ""}`}
                  onClick={() => onSelect(iso)}
                  className={`relative flex h-9 w-9 cursor-pointer flex-col items-center justify-center rounded-lg text-[14px] sm:h-8 sm:w-8 sm:rounded-lg sm:text-[11px] outline-none transition focus-visible:ring-2 focus-visible:ring-[#4f6ef7]/50 disabled:cursor-default ${
                    isSelected
                      ? "bg-[#1b1f4b] font-bold text-white shadow-[0_3px_8px_rgba(27,31,75,0.22)]"
                      : hasData
                        ? "font-medium text-[#1f2937] hover:bg-[#f1f4ff]"
                        : "font-medium text-[#cbd5e1]"
                  }`}
                >
                  {day}
                  {showDot ? <span className="absolute bottom-[3px] h-1 w-1 rounded-full bg-[#4f6ef7] sm:bottom-[3px] sm:h-[3px] sm:w-[3px]" /> : null}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-5 border-t border-[#eef1f5] pt-4 text-[12px] text-[#6b7280] sm:mt-3 sm:gap-4 sm:pt-3 sm:text-[9.5px]">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#1b1f4b] sm:h-1.5 sm:w-1.5" />Seleccionado</span>
          {availableDates !== null ? <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-[#4f6ef7] sm:h-1.5 sm:w-1.5" />Con datos</span> : null}
        </div>
      </div>
    </>,
    document.body,
  );
}
