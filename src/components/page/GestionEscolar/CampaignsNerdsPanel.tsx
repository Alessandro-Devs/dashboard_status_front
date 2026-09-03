"use client";

import { dashboardDatabase } from "@/data/dashboardDatabase";
import { useDashboardData } from "@/stores/DashboardDataContext";

type CampaignValue = number | string;
type Campaign = {
  name: CampaignValue;
  date: CampaignValue;
  tipoRespuesta: CampaignValue;
  mensajesNoEnviados: CampaignValue;
  mensajesEnviados: CampaignValue;
  mensajesEntregados: CampaignValue;
  leidos: CampaignValue;
  respuestasRecibidas: CampaignValue;
};
const metrics = [["Tipo de respuesta", "tipoRespuesta"], ["Mensajes no enviados", "mensajesNoEnviados"], ["Mensajes enviados", "mensajesEnviados"], ["Mensajes entregados", "mensajesEntregados"], ["Leídos", "leidos"], ["Respuestas recibidas", "respuestasRecibidas"]] as const;

function hasData(value: unknown): boolean {
  if (value === null || value === undefined || value === "" || value === 0 || value === false) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasData);
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some(hasData);
  return true;
}
function campaignValue(value: unknown): CampaignValue { return typeof value === "number" || typeof value === "string" ? value : ""; }
function campaignList(value: unknown): Campaign[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item)).map((item) => ({ name: campaignValue(item.nombre ?? item.name), date: campaignValue(item.fecha ?? item.date), tipoRespuesta: campaignValue(item.tipoRespuesta), mensajesNoEnviados: campaignValue(item.mensajesNoEnviados), mensajesEnviados: campaignValue(item.mensajesEnviados), mensajesEntregados: campaignValue(item.mensajesEntregados), leidos: campaignValue(item.leidos), respuestasRecibidas: campaignValue(item.respuestasRecibidas) }));
}
function campaignGroups(value: unknown) {
  if (Array.isArray(value)) return { directors: campaignList(value), teachers: [] };
  if (!value || typeof value !== "object") return { directors: [], teachers: [] };
  const groups = value as Record<string, unknown>;
  return { directors: campaignList(groups.directores), teachers: campaignList(groups.docentes) };
}

function CampaignSection({ title, campaigns }: { title: string; campaigns: Campaign[] }) {
  if (!campaigns.length) return null;
  return <section className="mt-8"><h2 className="text-[13px] font-semibold uppercase tracking-[.08em] text-[#29455f]">{title}</h2><div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">{campaigns.map((campaign, index) => <article key={`${title}-${String(campaign.name)}-${index}`} className="rounded-xl border border-[#d9e1e8] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><h3 className="text-[12px] font-semibold text-[#29455f]">{campaign.name}</h3><p className="text-right text-[9px] text-[#8ea1b5]">{campaign.date}</p></div><div className="mt-4 space-y-2">{metrics.map(([label, key], metricIndex) => <div key={key} className="flex items-center justify-between gap-3 rounded-md bg-[#f8fafc] px-3 py-2"><span className="text-[9px] text-[#71869a]">{label}</span><span className={`text-[11px] font-semibold ${metricIndex === 0 ? "text-[#176dcc]" : "text-[#29455f]"}`}>{campaign[key]}</span></div>)}</div></article>)}</div></section>;
}

export default function CampaignsNerdsPanel() {
  useDashboardData();
  const source = dashboardDatabase.gestionEscolar?.gestionOperativa?.campanasNerds;
  const groups = campaignGroups(source);
  if (!hasData(source)) return <section className="mt-8"><h2 className="text-[15px] font-semibold tracking-[.04em] text-[#29455f]">CAMPAÑAS NERDS</h2><div className="mt-4 rounded-xl border border-dashed border-[#d9e1e8] bg-white px-4 py-8 text-center text-[11px] text-[#8ea1b5]">No se encontró información de campañas para esta fecha.</div></section>;
  return <section className="mt-8"><h2 className="text-[15px] font-semibold tracking-[.04em] text-[#29455f]">CAMPAÑAS NERDS</h2><CampaignSection title="Directores" campaigns={groups.directors} /><CampaignSection title="Docentes" campaigns={groups.teachers} />{!groups.directors.length && !groups.teachers.length && <div className="mt-4 rounded-xl border border-dashed border-[#d9e1e8] bg-white px-4 py-8 text-center text-[11px] text-[#8ea1b5]">No se encontró información de campañas para esta fecha.</div>}</section>;
}
