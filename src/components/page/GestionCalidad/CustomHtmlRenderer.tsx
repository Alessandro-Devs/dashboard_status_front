"use client";

import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { qualityData } from "./qualityData";

type ChartRow = { name: string; value: number };
type ChartSource = "coberturaPorGrupo" | "auditadosPorGrupo" | "cumplimientoPorGrupo" | "cumplimientoPorProceso";
type ChartType = "bar" | "line" | "pie";

function getChartData(source: string): ChartRow[] {
  const data = (qualityData as unknown as Record<string, unknown>)[source] as unknown;
  if (!Array.isArray(data)) return [];
  return data.map((item) => {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? row.grupo ?? "");
    const value = Number(row.value ?? row.porcentaje ?? row.auditados ?? 0);
    return name && Number.isFinite(value) ? { name, value } : null;
  }).filter((item): item is ChartRow => item !== null);
}

function ChartBlock({ type, source, values }: { type: ChartType; source?: string; values?: string }) {
  let data = source ? getChartData(source) : [];
  if (values) {
    try {
      const parsed = JSON.parse(values) as unknown;
      if (Array.isArray(parsed)) {
        data = parsed
          .filter((item): item is ChartRow => Boolean(item && typeof item === "object" && typeof (item as ChartRow).name === "string" && Number.isFinite(Number((item as ChartRow).value))))
          .map((item) => ({ name: item.name, value: Number(item.value) }));
      }
    } catch {
      data = [];
    }
  }
  if (!data.length) return <p className="rounded-lg border border-dashed border-[#cbd6e0] p-4 text-center text-xs text-[#71869a]">No hay datos para este gráfico.</p>;
  if (type === "pie") return <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d9e1e8", fontSize: 11 }}/><Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="45%" outerRadius="78%" paddingAngle={3} stroke="none">{data.map((item, index) => <Cell key={`${item.name}-${index}`} fill={["#3478b9", "#48a37b", "#e0a43a", "#d56b6b", "#8064b5"][index % 5]}/>)}</Pie></PieChart></ResponsiveContainer></div>;
  if (type === "line") return <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 30 }}><CartesianGrid vertical={false} stroke="#e5ebf1" strokeDasharray="3 3"/><XAxis dataKey="name" angle={-28} textAnchor="end" interval={0} height={55} axisLine={false} tickLine={false} tick={{ fill: "#71869a", fontSize: 10 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8da0b4", fontSize: 10 }}/><Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d9e1e8", fontSize: 11 }}/><Line type="monotone" dataKey="value" name="Valor" stroke="#3478b9" strokeWidth={3} dot={{ r: 4, fill: "#3478b9" }}/></LineChart></ResponsiveContainer></div>;
  return <div className="h-[280px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 30 }}><CartesianGrid vertical={false} stroke="#e5ebf1" strokeDasharray="3 3"/><XAxis dataKey="name" angle={-28} textAnchor="end" interval={0} height={55} axisLine={false} tickLine={false} tick={{ fill: "#71869a", fontSize: 10 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: "#8da0b4", fontSize: 10 }}/><Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #d9e1e8", fontSize: 11 }}/><Bar dataKey="value" name="Valor" fill="#3478b9" radius={[4, 4, 0, 0]}/></BarChart></ResponsiveContainer></div>;
}

export default function CustomHtmlRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootsRef = useRef<Root[]>([]);

  useEffect(() => {
    rootsRef.current.forEach((root) => root.unmount());
    rootsRef.current = [];
    const container = containerRef.current;
    if (!container) return;
    container.querySelectorAll<HTMLElement>("[data-chart]").forEach((element) => {
      const chartType = element.dataset.chart as ChartType | undefined;
      const source = element.dataset.source as ChartSource | undefined;
      const values = element.dataset.values;
      if (!chartType || !["bar", "line", "pie"].includes(chartType) || (!source && !values)) return;
      const root = createRoot(element);
      root.render(<ChartBlock type={chartType} source={source} values={values}/>);
      rootsRef.current.push(root);
    });
    return () => {
      rootsRef.current.forEach((root) => root.unmount());
      rootsRef.current = [];
    };
  }, [html]);

  return <div ref={containerRef} className="w-full" dangerouslySetInnerHTML={{ __html: html }}/>;
}
