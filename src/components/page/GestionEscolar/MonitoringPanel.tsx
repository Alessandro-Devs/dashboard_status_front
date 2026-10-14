"use client";

import { useState } from "react";
import { ContactRound, Megaphone, type LucideIcon } from "lucide-react";
import CampaignsNerdsPanel from "./CampaignsNerdsPanel";
import ContactsDirectorsPanel from "./ContactsDirectorsPanel";

// Pestaña "Monitoreo" de Gestión operativa, con su propia navegación interna (subpestañas subrayadas).
type SubTab = "campanas" | "contactos";
const SUB_TABS: Array<{ key: SubTab; label: string; icon: LucideIcon }> = [
  { key: "campanas", label: "Campañas nerds", icon: Megaphone },
  { key: "contactos", label: "Contactos directores", icon: ContactRound },
];

function Pending({ title, icon: Icon }: { title: string; icon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d9e1e8] bg-white px-6 py-12 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#eaf3ff] text-[#176dcc]"><Icon className="h-5 w-5" /></span>
      <p className="text-[12px] font-semibold text-[#29455f]">{title}</p>
      <p className="max-w-sm text-[10px] text-[#8fa1b5]">Aquí se mostrará la información de esta sección.</p>
    </div>
  );
}

export default function MonitoringPanel({ hasCampaigns, hasContacts }: { hasCampaigns: boolean; hasContacts: boolean }) {
  // Solo se muestran las secciones que tienen datos.
  const tabs = SUB_TABS.filter((item) => (item.key === "campanas" ? hasCampaigns : hasContacts));
  const [selected, setTab] = useState<SubTab>("campanas");
  const current = tabs.find((item) => item.key === selected) ?? tabs[0] ?? SUB_TABS[0];
  const tab = current.key;
  return (
    <section className="mt-8">
      <nav className="mt-4 flex gap-0 sm:gap-6" style={{ borderBottom: "1px solid #d9e1e8" }} aria-label="Secciones de monitoreo">
        {tabs.map((item) => {
          const active = item.key === tab;
          const Icon = item.icon;
          return (
            <button key={item.key} type="button" aria-current={active ? "page" : undefined} onClick={() => setTab(item.key)}
              className={`relative inline-flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap px-0.5 pb-3 sm:flex-none sm:justify-start text-[11px] font-semibold transition ${active ? "text-[#176dcc]" : "text-[#6f8294] hover:text-[#29455f]"}`}
              style={{ border: "none", background: "transparent", boxShadow: "none" }}>
              <Icon className="h-4 w-4" />{item.label}
              <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full" style={{ background: active ? "#176dcc" : "transparent" }} />
            </button>
          );
        })}
      </nav>

      <div className="mt-5">
        {tab === "campanas" && hasCampaigns ? <CampaignsNerdsPanel embedded /> : tab === "contactos" ? <ContactsDirectorsPanel /> : <Pending title={current.label} icon={current.icon} />}
      </div>
    </section>
  );
}
