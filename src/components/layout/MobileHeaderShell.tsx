"use client";

import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useAuditFilters } from "@/stores/AuditFiltersContext";

export default function MobileHeaderShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { activeSection } = useAuditFilters();
  const selectedSection = pathname.startsWith("/gestion-escolar")
    ? "Gestión Escolar"
    : activeSection;

  return (
    <div
      className="mobile-header sticky top-0 z-[100] bg-[#071a29] shadow-sm"
      data-open={open}
    >
      <button
        type="button"
        className="mobile-header__toggle flex min-h-12 w-full items-center justify-between px-4 text-sm font-semibold text-white sm:hidden"
        aria-expanded={open}
        aria-controls="mobile-header-panel"
        onClick={() => setOpen((value) => !value)}
      >
        <span>{selectedSection}</span>
        <span aria-hidden="true" className="mobile-header__icon">
          <span />
          <span />
          <span />
        </span>
      </button>
      <div id="mobile-header-panel" className="mobile-header__panel">
        {children}
      </div>
    </div>
  );
}
