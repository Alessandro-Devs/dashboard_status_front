"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Platform = "KIRA" | "IHFB";
type DashboardState = { activeSection: string; setActiveSection: (value: string) => void; trimesters: string[]; setTrimesters: (value: string[]) => void; learningLines: string[]; setLearningLines: (value: string[]) => void; platforms: Platform[]; togglePlatform: (value: Platform) => void; blocks: string[]; setBlocks: (value: string[]) => void; components: string[]; setComponents: (value: string[]) => void; startDate: string; endDate: string; setPeriod: (start: string, end: string) => void };
const DashboardContext = createContext<DashboardState | null>(null);

export function AuditFiltersProvider({ children }: { children: ReactNode }) {
  const [activeSection, setActiveSection] = useState("Gestión de Calidad");
  const [trimesters, setTrimesters] = useState<string[]>(["t3"]);
  const [learningLines, setLearningLines] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>(["KIRA", "IHFB"]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [components, setComponents] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("2026-07-01");
  const [endDate, setEndDate] = useState("2026-07-31");
  const value = useMemo(() => ({ activeSection, setActiveSection, trimesters, setTrimesters, learningLines, setLearningLines, platforms, togglePlatform: (platform: Platform) => setPlatforms((current) => current.includes(platform) ? (current.length === 1 ? current : current.filter((item) => item !== platform)) : [...current, platform]), blocks, setBlocks, components, setComponents, startDate, endDate, setPeriod: (start: string, end: string) => { setStartDate(start); setEndDate(end); } }), [activeSection, trimesters, learningLines, platforms, blocks, components, startDate, endDate]);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useAuditFilters() { const context = useContext(DashboardContext); if (!context) throw new Error("useAuditFilters debe usarse dentro de AuditFiltersProvider"); return context; }
