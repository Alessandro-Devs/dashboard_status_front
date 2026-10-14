"use client";

import { useState } from "react";
import { Mail, MessageCircle, Phone, UserCheck, Video, type LucideIcon } from "lucide-react";
import { dashboardDatabase } from "@/data/dashboardDatabase";
import { readDirectorContacts } from "@/lib/schoolManagementExtras";

// Datos capturados en el panel (Gestión operativa → Contactos a directores) para la fecha de corte.
const readData = () => readDirectorContacts(dashboardDatabase.gestionEscolar?.gestionOperativa?.contactosDirectores);

const TIPO_STYLE: Record<string, { icon: LucideIcon; color: string; soft: string }> = {
  Llamada: { icon: Phone, color: "#176dcc", soft: "#eaf3ff" },
  Videollamada: { icon: Video, color: "#7b3ff2", soft: "#f2ecff" },
  Correo: { icon: Mail, color: "#e07a00", soft: "#fff3e3" },
  WhatsApp: { icon: MessageCircle, color: "#168642", soft: "#eaf8ef" },
};
const COBERTURA = { icon: UserCheck, color: "#0e8fa3", soft: "#e4f6f8" };

const fmt = (value: number) => value.toLocaleString("es-SV");
const pct = (num: number, den: number) => (den > 0 ? (num / den) * 100 : 0);
const fmtPct = (value: number) => `${(Math.round(value * 10) / 10).toLocaleString("es-SV", { maximumFractionDigits: 1 })}%`;

type Ring = { key: string; label: string; detail: string; value: number; percent: number; icon: LucideIcon; color: string; soft: string };

// Anillos concéntricos: cada anillo se llena según su porcentaje.
function Rings({ rings, center, sub, active, onActive }: { rings: Ring[]; center: string; sub: string; active: string | null; onActive: (key: string | null) => void }) {
  const size = 260, stroke = 13, gap = 5, c = size / 2;
  return (
    <div className="relative mx-auto w-full max-w-[260px]">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full -rotate-90">
        {rings.map((ring, index) => {
          const r = c - stroke / 2 - 2 - index * (stroke + gap);
          const len = 2 * Math.PI * r;
          const dim = active !== null && active !== ring.key;
          const on = active === ring.key;
          return (
            <g key={ring.key} className="cursor-pointer transition-opacity duration-200" style={{ opacity: dim ? 0.18 : 1 }} onMouseEnter={() => onActive(ring.key)} onMouseLeave={() => onActive(null)}>
              <circle cx={c} cy={c} r={r} fill="none" stroke={ring.soft} strokeWidth={stroke} />
              <circle cx={c} cy={c} r={r} fill="none" stroke={ring.color} strokeWidth={on ? stroke + 3 : stroke} strokeLinecap="round" strokeDasharray={`${(len * Math.min(ring.percent, 100)) / 100} ${len}`}
                style={{ transition: "stroke-width .2s", filter: on ? `drop-shadow(0 0 4px ${ring.color}66)` : undefined }} />
            </g>
          );
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        {(() => {
          const ring = rings.find((item) => item.key === active);
          return ring ? (
            <>
              <span className="text-[10px] font-semibold" style={{ color: ring.color }}>{ring.label}</span>
              <span className="mt-1 text-[24px] font-semibold leading-none" style={{ color: ring.color }}>{fmtPct(ring.percent)}</span>
              <span className="mt-1 max-w-[120px] text-center text-[9px] leading-tight text-[#8fa1b5]">{ring.detail}</span>
            </>
          ) : (
            <>
              <span className="text-[24px] font-semibold leading-none text-[#223c52]">{center}</span>
              <span className="mt-1 text-[9px] text-[#8fa1b5]">{sub}</span>
            </>
          );
        })()}
      </div>
    </div>
  );
}

// Hay datos de contactos si existe un total de directores y al menos un contacto registrado.
export const hasContactsData = () => readData() !== null;

export default function ContactsDirectorsPanel() {
  // Elemento resaltado: al pasar el cursor por una fila o un anillo se resalta en ambos lados.
  const [active, setActive] = useState<string | null>(null);
  const data = readData();
  if (!data) return null;
  const total = data.totalDirectores;
  const contactados = data.tipos.reduce((sum, tipo) => sum + tipo.contactados, 0);
  const sinContactar = Math.max(0, total - contactados);
  const tipos = [...data.tipos].sort((a, b) => b.contactados - a.contactados);
  const rings: Ring[] = [
    { key: "cobertura", label: "Contactados", detail: `${fmt(contactados)} de ${fmt(total)} directores`, value: contactados, percent: pct(contactados, total), ...COBERTURA },
    ...tipos.map((tipo) => {
      const style = TIPO_STYLE[tipo.nombre] ?? TIPO_STYLE.Llamada;
      return { key: tipo.nombre, label: tipo.nombre, detail: `${fmt(tipo.contactados)} de ${fmt(contactados)} contactados`, value: tipo.contactados, percent: pct(tipo.contactados, contactados), ...style };
    }),
  ];

  return (
    <article className="rounded-[12px] border border-[#d9e1e8] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[13px] font-semibold text-[#29455f]">Contacto a directores</h3>
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="rounded-full bg-[#f4f7fa] px-3 py-1 text-[#60778d]">Total <b className="ml-1 font-semibold text-[#223c52]">{fmt(total)}</b></span>
          <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-[#c2410c]">Sin contactar <b className="ml-1 font-semibold">{fmt(sinContactar)}</b></span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
        <Rings rings={rings} active={active} onActive={setActive} center={fmtPct(pct(contactados, total))} sub={`${fmt(contactados)} de ${fmt(total)} contactados`} />

        <ul className="divide-y divide-[#eef2f6]">
          {rings.map((ring, index) => {
            const Icon = ring.icon;
            const main = index === 0;
            return (
              <li key={ring.key} onMouseEnter={() => setActive(ring.key)} onMouseLeave={() => setActive(null)}
                className={`-mx-3 flex cursor-pointer items-center gap-3 rounded-[10px] px-3 py-3 transition duration-200 ${main ? "pb-4" : ""}`}
                style={{ background: active === ring.key ? ring.soft : "transparent", opacity: active !== null && active !== ring.key ? 0.45 : 1 }}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: ring.soft, color: ring.color }}><Icon className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold text-[#29455f] ${main ? "text-[12px]" : "text-[11px]"}`}>{ring.label}</p>
                  <p className="mt-0.5 text-[9px] text-[#8fa1b5]">{main ? `del total de ${fmt(total)} directores` : `de los ${fmt(contactados)} contactados`}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold leading-none tabular-nums text-[#223c52] ${main ? "text-[22px]" : "text-[16px]"}`}>{fmt(ring.value)}</p>
                  <p className="mt-1 text-[10px] font-semibold tabular-nums" style={{ color: ring.color }}>{fmtPct(ring.percent)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </article>
  );
}
