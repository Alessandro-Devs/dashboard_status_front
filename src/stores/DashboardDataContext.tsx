"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { dashboardSections, getAvailableDashboardSections, type DashboardSection } from "@/lib/dashboardSections";
import { apiFetch } from "@/services/api";
import { useAuditFilters } from "@/stores/AuditFiltersContext";

type DashboardResponse = {
  snapshot: { date: string } | null;
  data: unknown | null;
  message?: string;
};
type DashboardDataState = { hasData: boolean; snapshotDate: string | null; resolvedDate: string | null; error: string | null };
type DashboardContextState = DashboardDataState & { isLoading: boolean; availableSections: DashboardSection[] };

const DashboardDataContext = createContext<DashboardContextState | null>(null);

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canSynchronizeObject(target: Record<string, unknown>, source: Record<string, unknown>) {
  if (!Object.isExtensible(target)) return false;

  return Object.keys(target).every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(target, key);
    if (!descriptor) return true;
    if (!(key in source)) return descriptor.configurable === true;
    return descriptor.writable === true || typeof descriptor.set === "function";
  });
}

function synchronize(target: unknown, source: unknown): unknown {
  if (Array.isArray(target) && Array.isArray(source)) {
    const next = source.map((item, index) => synchronize(target[index], item));
    if (Object.isExtensible(target)) target.splice(0, target.length, ...next);
    else return next;
    return target;
  }
  if (isObject(target) && isObject(source)) {
    const next = Object.fromEntries(
      Object.entries(source).map(([key, value]) => [key, synchronize(target[key], value)]),
    );
    if (!canSynchronizeObject(target, source)) return next;
    for (const key of Object.keys(target)) if (!(key in source)) delete target[key];
    for (const [key, value] of Object.entries(next)) target[key] = value;
    return target;
  }
  // No conservar referencias de la respuesta de la API: pueden estar congeladas.
  if (Array.isArray(source)) return source.map((item) => synchronize(undefined, item));
  if (isObject(source)) return Object.fromEntries(Object.entries(source).map(([key, value]) => [key, synchronize(undefined, value)]));
  return source;
}

export function DashboardDataProvider({ children }: { children: ReactNode }) {
  const { startDate, endDate, setPeriod } = useAuditFilters();
  const [state, setState] = useState<DashboardDataState>({ hasData: false, snapshotDate: null, resolvedDate: null, error: null });
  const resolvedDateRef = useRef<string | null>(null);

  useEffect(() => {
    if (startDate !== endDate) {
      return;
    }
    if (resolvedDateRef.current === endDate) {
      return;
    }

    const isInitialLoad = resolvedDateRef.current === null;
    const path = isInitialLoad ? "/dashboard" : `/dashboard?date=${encodeURIComponent(endDate)}`;
    let active = true;
    apiFetch<DashboardResponse>(path)
      .then((response) => {
        if (!active) return;
        if (!response.snapshot || !isObject(response.data)) {
          resolvedDateRef.current = endDate;
          setState({ hasData: false, snapshotDate: null, resolvedDate: endDate, error: null });
          return;
        }
        const resolvedDate = response.snapshot.date;
        synchronize(dashboardDatabase, response.data);
        resolvedDateRef.current = resolvedDate;
        setState({ hasData: true, snapshotDate: resolvedDate, resolvedDate, error: null });
        if (isInitialLoad && resolvedDate !== endDate) {
          setPeriod(resolvedDate, resolvedDate);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = error instanceof Error ? error.message : "Error desconocido al consultar la API.";
        console.error("No fue posible cargar la instantánea del dashboard", error);
        resolvedDateRef.current = endDate;
        setState({ hasData: false, snapshotDate: null, resolvedDate: endDate, error: message });
      });
    return () => { active = false; };
  }, [startDate, endDate, setPeriod]);

  const value = useMemo(
    () => ({
      ...state,
      isLoading: startDate === endDate && state.resolvedDate !== endDate,
      hasData: startDate === endDate && state.hasData && state.snapshotDate === endDate && state.resolvedDate === endDate,
      availableSections: startDate === endDate && state.resolvedDate === endDate
        ? getAvailableDashboardSections()
        : dashboardSections,
    }),
    [endDate, startDate, state],
  );

  return <DashboardDataContext.Provider value={value}>{children}</DashboardDataContext.Provider>;
}

export function useDashboardData() {
  const context = useContext(DashboardDataContext);
  if (!context) throw new Error("useDashboardData debe usarse dentro de DashboardDataProvider");
  return context;
}
