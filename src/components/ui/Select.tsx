"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Select propio del aplicativo. Reemplaza al <select> nativo porque el menú del navegador
// no respeta el diseño (en la vista de teléfono de Chrome se dibuja con medidas de escritorio).
// El menú se dibuja en el <body> para que no lo recorten contenedores con overflow oculto.

export type SelectOption = { value: string; label: string };
type Size = "xs" | "sm" | "form" | "md" | "lg";

const sizes: Record<Size, { trigger: string; option: string; icon: string }> = {
  xs: { trigger: "h-7 px-2 text-[9px]", option: "px-2 py-1.5 text-[9px]", icon: "h-3 w-3" },
  sm: { trigger: "h-7 px-2 text-[10px]", option: "px-2 py-1.5 text-[10px]", icon: "h-3 w-3" },
  form: { trigger: "h-[30px] px-2 text-[11px]", option: "px-2 py-1.5 text-[11px]", icon: "h-3.5 w-3.5" },
  md: { trigger: "h-9 px-3 text-[10px]", option: "px-3 py-2 text-[10px]", icon: "h-3.5 w-3.5" },
  lg: { trigger: "h-[38px] px-3 text-sm", option: "px-3 py-2 text-sm", icon: "h-4 w-4" },
};

export default function Select({ value, options, onChange, size = "sm", className = "w-full", ariaLabel, placeholder = "Selecciona una opción", disabled = false }: {
  value: string;
  options: Array<SelectOption | string>;
  onChange: (value: string) => void;
  size?: Size;
  className?: string;
  ariaLabel?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const items: SelectOption[] = options.map((option) => (typeof option === "string" ? { value: option, label: option } : option));
  const selected = items.find((item) => item.value === value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();
  const style = sizes[size];

  const openMenu = () => {
    if (disabled || !triggerRef.current) return;
    setActiveIndex(Math.max(0, items.findIndex((item) => item.value === value)));
    setAnchor(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };
  const close = () => setOpen(false);
  const choose = (option: SelectOption) => {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Cerrar al tocar fuera y seguir al botón si la página se desplaza o cambia de tamaño.
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || listRef.current?.contains(target)) return;
      setOpen(false);
    };
    const follow = (event: Event) => {
      // Desplazarse dentro del propio menú no debe reubicarlo.
      if (event.target instanceof Node && listRef.current?.contains(event.target)) return;
      if (triggerRef.current) setAnchor(triggerRef.current.getBoundingClientRect());
    };
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("resize", follow);
    window.addEventListener("scroll", follow, true);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("resize", follow);
      window.removeEventListener("scroll", follow, true);
    };
  }, [open]);

  // Coloca el menú en coordenadas de pantalla. Se mide el menú ya dibujado para que funcione
  // con el zoom que globals.css aplica al body; si no cabe abajo, se abre hacia arriba.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!open || !list || !anchor) return;
    list.style.left = "0px";
    list.style.top = "0px";
    list.style.width = "";
    let rect = list.getBoundingClientRect();
    const scale = rect.width / (list.offsetWidth || rect.width) || 1;
    const margin = 8;
    list.style.width = `${anchor.width / scale}px`;
    // Ajuste fino: el zoom redondea offsetWidth, así que se corrige con el ancho real medido.
    const measuredWidth = list.getBoundingClientRect().width;
    if (measuredWidth > 0) list.style.width = `${(anchor.width / scale) * (anchor.width / measuredWidth)}px`;
    list.style.maxHeight = "";
    rect = list.getBoundingClientRect();
    const spaceBelow = window.innerHeight - anchor.bottom - margin;
    const spaceAbove = anchor.top - margin;
    const openUp = rect.height > spaceBelow && spaceAbove > spaceBelow;
    const available = Math.max(80, (openUp ? spaceAbove : spaceBelow) - 4);
    if (rect.height > available) {
      list.style.maxHeight = `${available / scale}px`;
      rect = list.getBoundingClientRect();
    }
    const top = openUp ? anchor.top - rect.height - 4 : anchor.bottom + 4;
    const left = Math.max(margin, Math.min(anchor.left, window.innerWidth - rect.width - margin));
    list.style.left = `${(left - rect.left) / scale}px`;
    list.style.top = `${(top - rect.top) / scale}px`;
    list.style.visibility = "visible";
    list.querySelector<HTMLElement>("[aria-selected='true']")?.scrollIntoView({ block: "nearest" });
  }, [open, anchor]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) { event.preventDefault(); openMenu(); }
      return;
    }
    if (event.key === "Escape") { event.preventDefault(); close(); }
    else if (event.key === "ArrowDown") { event.preventDefault(); setActiveIndex((index) => Math.min(items.length - 1, index + 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(0, index - 1)); }
    else if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
    else if (event.key === "End") { event.preventDefault(); setActiveIndex(items.length - 1); }
    else if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (items[activeIndex]) choose(items[activeIndex]); }
    else if (event.key === "Tab") close();
  };

  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-index='${activeIndex}']`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  return <>
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={open ? listId : undefined}
      aria-label={ariaLabel ? `${ariaLabel}: ${selected?.label ?? placeholder}` : undefined}
      onClick={() => (open ? close() : openMenu())}
      onKeyDown={onKeyDown}
      className={`${className} ${style.trigger} flex cursor-pointer items-center justify-between gap-2 rounded-md border bg-[#fbfcfd] font-semibold normal-case tracking-normal text-[#334b60] outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${open ? "border-[#176fc8] ring-2 ring-[#eaf4ff]" : "border-[#d9e2eb] hover:border-[#b9cbdc] focus-visible:border-[#176fc8] focus-visible:ring-2 focus-visible:ring-[#eaf4ff]"}`}
    >
      <span className={`truncate ${selected ? "" : "font-medium text-[#8a9cab]"}`}>{selected?.label ?? placeholder}</span>
      <ChevronDown className={`${style.icon} shrink-0 text-[#71869a] transition-transform ${open ? "rotate-180" : ""}`} />
    </button>
    {open && typeof document !== "undefined" ? createPortal(
      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-label={ariaLabel}
        style={{ position: "fixed", top: 0, left: 0, visibility: "hidden" }}
        className="z-[1300] overflow-y-auto rounded-md border border-[#d9e2eb] bg-white py-1 shadow-[0_8px_24px_rgba(35,52,70,0.12)]"
      >
        {items.length === 0 ? <li className={`${style.option} text-[#8a9cab]`}>Sin opciones</li> : null}
        {items.map((option, index) => {
          const isSelected = option.value === value;
          return <li
            key={`${option.value}-${index}`}
            role="option"
            data-index={index}
            aria-selected={isSelected}
            onPointerMove={() => setActiveIndex(index)}
            onClick={() => choose(option)}
            className={`${style.option} flex cursor-pointer items-center justify-between gap-2 font-semibold ${index === activeIndex ? "bg-[#eef5fc]" : ""} ${isSelected ? "text-[#176fc8]" : "text-[#334b60]"}`}
          >
            <span className="truncate">{option.label}</span>
            {isSelected ? <Check className={`${style.icon} shrink-0`} /> : null}
          </li>;
        })}
      </ul>,
      document.body,
    ) : null}
  </>;
}
