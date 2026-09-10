"use client";

import { useState } from "react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { useDashboardData } from "@/stores/DashboardDataContext";

type Campaign = {
  name: string;
  date: string;
  baseContactos: number;
  enviados: number;
  noEnviados: number;
  entregados: number;
  noEntregados: number;
  leidos: number;
  noLeidos: number;
  respuestas: number;
  noRespondidos: number;
};

type CampaignMetricItem = {
  label: string;
  value: string;
  total?: string;
  percentage: number;
};

function numericValue(value: unknown): number {
  const parsed = Number(typeof value === "string" ? value.replace(/,/g, "").trim() : value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function campaignMetrics(campaign: Campaign): CampaignMetricItem[][] {
  const item = (label: string, value: number, total?: number): CampaignMetricItem => ({
    label,
    value: String(value),
    total: total === undefined ? undefined : String(total),
    percentage: total && total > 0 ? Math.round((value / total) * 100) : 0,
  });
  return [
    [item("Base de contactos", campaign.baseContactos)],
    [item("Enviados", campaign.enviados, campaign.baseContactos), item("No enviados", campaign.noEnviados, campaign.baseContactos)],
    [item("Entregados", campaign.entregados, campaign.enviados), item("No entregados", campaign.noEntregados, campaign.enviados)],
    [item("Leídos", campaign.leidos, campaign.entregados), item("No leídos", campaign.noLeidos, campaign.entregados)],
    [item("Respuestas", campaign.respuestas, campaign.leidos), item("No respondidos", campaign.noRespondidos, campaign.leidos)],
  ];
}

function campaignFields(item: Record<string, unknown>) {
  const enviados = numericValue(item.enviados ?? item.mensajesEnviados);
  const sourceNoEnviados = numericValue(item.noEnviados ?? item.mensajesNoEnviados);
  const entregados = numericValue(item.entregados ?? item.mensajesEntregados);
  const leidos = numericValue(item.leidos);
  const respuestas = numericValue(item.respuestas ?? item.respuestasRecibidas);
  const sourceBaseContactos = numericValue(item.baseContactos);
  const baseContactos = sourceBaseContactos > 0 ? sourceBaseContactos : enviados + sourceNoEnviados;
  return {
    baseContactos,
    enviados,
    noEnviados: Math.max(0, baseContactos - enviados),
    entregados,
    noEntregados: numericValue(item.noEntregados) || Math.max(0, enviados - entregados),
    leidos,
    noLeidos: numericValue(item.noLeidos) || Math.max(0, entregados - leidos),
    respuestas,
    noRespondidos: numericValue(item.noRespondidos) || Math.max(0, leidos - respuestas),
  };
}

function campaignList(value: unknown): Campaign[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item, index) => ({
      ...campaignFields(item),
      name: String(item.nombre ?? item.name ?? `Campaña ${index + 1}`),
      date: String(item.fecha ?? item.date ?? ""),
    }));
}

function campaignGroups(value: unknown) {
  if (Array.isArray(value)) {
    const campaigns = campaignList(value);
    return { directors: campaigns, teachers: campaigns.map((campaign) => ({ ...campaign })) };
  }
  if (!value || typeof value !== "object") return { directors: [], teachers: [] };
  const groups = value as Record<string, unknown>;
  return { directors: campaignList(groups.directores), teachers: campaignList(groups.docentes) };
}

function MetricLine({ metric, showPercentage = true }: { metric: CampaignMetricItem; showPercentage?: boolean }) {
  return <div className="min-w-0"><h4 className="truncate text-[6px] font-semibold uppercase tracking-[.03em] text-[#71869a]">{metric.label}</h4><div className="mt-0.5 truncate"><span className="text-[13px] font-bold leading-none text-[#29455f]">{metric.value}</span>{metric.total && <><span className="mx-1 text-[8px] font-normal text-[#9aaabd]">de</span><span className="text-[9px] font-medium text-[#9aaabd]">{metric.total}</span></>}{showPercentage && <span className="ml-1 text-[7px] font-semibold text-[#176dcc]">({metric.percentage}%)</span>}</div></div>;
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <article className="rounded-lg border border-[#d9e1e8] bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-[#e7edf2] pb-3">
        <div className="text-center"><h3 className="text-[10px] font-semibold text-[#29455f]">{campaign.name}</h3></div>
        <div className="text-right">
          <div className="mt-1 flex justify-end gap-2 text-center"><div className="rounded-md bg-[#f8fafc] px-2 py-1"><p className="text-[12px] font-bold leading-none text-[#29455f]">{campaign.entregados}</p><p className="mt-1 text-[7px] text-[#71869a]">Entregados</p></div><div className="rounded-md bg-[#f8fafc] px-2 py-1"><p className="text-[12px] font-bold leading-none text-[#29455f]">{campaign.respuestas}</p><p className="mt-1 text-[7px] text-[#71869a]">Respuestas</p></div></div>
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {campaignMetrics(campaign).map((group, groupIndex) => {
          const primary = group[0];
          const secondary = group[1];
          const primaryAlpha = 0.25 + primary.percentage / 100 * 0.75;
          const barBackground = `linear-gradient(to right, rgba(23, 109, 204, ${primaryAlpha}) 0% ${primary.percentage}%, #edf1f5 ${primary.percentage}% 100%)`;
          const progressBar = groupIndex > 0 ? <div className="h-1.5 overflow-hidden rounded-full bg-[#edf1f5]" style={{ background: barBackground }} /> : null;
          return secondary
            ? <div key={groupIndex} className="space-y-1.5 rounded-md bg-[#f8fafc] px-2.5 py-2"><div className="flex items-end justify-between gap-3"><MetricLine metric={primary} showPercentage={groupIndex > 0}/><MetricLine metric={secondary}/></div>{progressBar}</div>
            : <div key={groupIndex} className="space-y-1.5 rounded-md bg-[#f8fafc] px-2.5 py-2"><MetricLine metric={primary} showPercentage={groupIndex > 0}/>{progressBar}</div>;
        })}
      </div>
    </article>
  );
}

function CampaignSection({ title, campaigns }: { title: string; campaigns: Campaign[] }) {
  return (
    <>
      <h2 className="mt-5 text-[11px] font-semibold uppercase tracking-[.08em] text-[#29455f]">{title}</h2>
      {!campaigns.length ? (
        <div className="mt-4 rounded-xl border border-dashed border-[#d9e1e8] bg-white px-4 py-8 text-center text-[11px] text-[#8ea1b5]">No hay campañas para esta categoría.</div>
      ) : (
        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {campaigns.map((campaign, index) => <CampaignCard key={`${title}-${campaign.name}-${index}`} campaign={campaign} />)}
        </div>
      )}
    </>
  );
}

export default function CampaignsNerdsPanel() {
  useDashboardData();
  const source = dashboardDatabase.gestionEscolar?.gestionOperativa?.campanasNerds;
  const groups = campaignGroups(source);
  const [activeGroup, setActiveGroup] = useState<"directors" | "teachers">("directors");
  if (!groups.directors.length && !groups.teachers.length) return null;
  const title = activeGroup === "directors" ? "DIRECTORES" : "DOCENTES";
  const campaigns = activeGroup === "directors" ? groups.directors : groups.teachers;

  return (
    <section className="mt-8">
      <h2 className="text-[13px] font-semibold tracking-[.04em] text-[#29455f]">CAMPAÑAS NERDS</h2>
      <div className="mt-4 inline-flex rounded-lg border border-[#d9e1e8] bg-white p-1 shadow-sm">
        <button type="button" onClick={() => setActiveGroup("directors")} className={`cursor-pointer rounded-md px-3 py-1 text-[9px] font-semibold transition ${activeGroup === "directors" ? "bg-[#eaf3ff] text-[#176dcc]" : "text-[#6f8294] hover:bg-[#f5f8fb]"}`}>Directores</button>
        <button type="button" onClick={() => setActiveGroup("teachers")} className={`cursor-pointer rounded-md px-3 py-1 text-[9px] font-semibold transition ${activeGroup === "teachers" ? "bg-[#f2ecff] text-[#7b3ff2]" : "text-[#6f8294] hover:bg-[#f5f8fb]"}`}>Docentes</button>
      </div>
      <CampaignSection title={title} campaigns={campaigns} />
    </section>
  );
}
