"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { dashboardDatabase } from "@/data/dashboardDatabase";

type DashboardState = { activeSection: string; setActiveSection: (value: string) => void; blocks: string[]; setBlocks: (value: string[]) => void; startDate: string; endDate: string; setPeriod: (start: string, end: string) => void };
const DashboardContext = createContext<DashboardState | null>(null);
const PERIOD_STORAGE_KEY = "dashboard:selected-period";

function initialPeriod() {
  if (typeof window !== "undefined") {
    const stored = window.sessionStorage.getItem(PERIOD_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as { startDate?: string; endDate?: string };
        if (parsed.startDate && parsed.endDate) return { startDate: parsed.startDate, endDate: parsed.endDate };
      } catch {
        window.sessionStorage.removeItem(PERIOD_STORAGE_KEY);
      }
    }
  }
  const date = dashboardDatabase.metadata.fechaCorte;
  return { startDate: date, endDate: date };
}

export function AuditFiltersProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState("Gestión de Calidad");
  const [blocks, setBlocks] = useState<string[]>([]);
  const defaultDate = dashboardDatabase.metadata.fechaCorte;
  const [startDate, setStartDate] = useState(defaultDate);
  const [endDate, setEndDate] = useState(defaultDate);
  useEffect(() => {
    const stored = initialPeriod();
    if (stored.startDate !== defaultDate || stored.endDate !== defaultDate) {
      queueMicrotask(() => {
        setStartDate(stored.startDate);
        setEndDate(stored.endDate);
      });
    }
  }, [defaultDate]);
  const value = useMemo(() => ({ activeSection, setActiveSection, blocks, setBlocks, startDate, endDate, setPeriod: (start: string, end: string) => { setStartDate(start); setEndDate(end); if (typeof window !== "undefined") window.sessionStorage.setItem(PERIOD_STORAGE_KEY, JSON.stringify({ startDate: start, endDate: end })); } }), [activeSection, blocks, startDate, endDate]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useAuditFilters() { const context = useContext(DashboardContext); if (!context) throw new Error("useAuditFilters debe usarse dentro de AuditFiltersProvider"); return context; }
