import { AlertTriangle, BookOpen, CircleCheck, Clock3 } from "lucide-react";
import type { LearningLine } from "./learningData";

const accents = {
  blue: { icon: "text-[#1771d3]", bg: "bg-[#eaf3ff]", border: "border-t-[#1771d3]" },
  purple: { icon: "text-[#7544f4]", bg: "bg-[#f2ecff]", border: "border-t-[#7544f4]" },
  green: { icon: "text-[#198849]", bg: "bg-[#eaf8ef]", border: "border-t-[#198849]" },
};

export default function LineProgressCard({ item }: { item: LearningLine }) {
  const colors = accents[item.accent];
  const status = item.estatus.estado ?? (item.estatus.trimestreEnProceso ? `T${item.estatus.trimestreEnProceso} en proceso` : "En proceso");

  return <article className={`overflow-hidden rounded-lg border border-t-2 border-[#d8e0e8] bg-white ${colors.border}`}>
    <header className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-md ${colors.bg}`}><BookOpen className={`h-4 w-4 ${colors.icon}`} /></span>
        <div><p className="text-[8px] font-semibold uppercase text-[#8194a7]">Línea / aplicativo</p><h3 className="mt-1 text-[15px] font-semibold">{item.name}</h3></div>
      </div>
      <span className={`rounded-full px-2 py-1 text-[8px] font-semibold ${colors.bg} ${colors.icon}`}>{status}</span>
    </header>
    <div className="p-4">
      <div className="rounded-lg bg-[#f6f9fc] p-3">
        <div className="flex items-end justify-between">
          <div><p className="text-[8px] font-semibold uppercase text-[#8396a8]">Estado actual</p><p className="mt-2 text-[10px] leading-[1.55] text-[#40596f]">{item.estatus.descripcion}</p></div>
          <div className="ml-3 shrink-0 text-right"><strong className={`text-2xl ${colors.icon}`}>{item.estatus.hastaClase}</strong><p className="text-[8px] text-[#91a3b5]">clase alcanzada</p></div>
        </div>
      </div>
      <Info icon={<CircleCheck />} title={item.pendiente.title} text={item.pendiente.description} tone="blue" />
      <Info icon={<AlertTriangle />} title={item.barrera.title} text={item.barrera.description} tone="orange" />
      {item.barrera.tiempoPorClase && <div className="mt-3 flex items-center gap-3 rounded-lg bg-[#fff5e9] p-3 text-[#d96f0c]">
        <Clock3 className="h-4 w-4 shrink-0" />
        <div><strong className="text-[13px]">{item.barrera.tiempoPorClase.minHoras}–{item.barrera.tiempoPorClase.maxHoras} horas</strong><p className="mt-1 text-[8px]">Tiempo estimado por clase</p></div>
      </div>}
    </div>
  </article>;
}

function Info({ icon, title, text, tone }: { icon: React.ReactNode; title: string; text: string; tone: "blue" | "orange" }) {
  return <div className="mt-3 flex gap-3 border-t pt-3">
    <span className={`mt-0.5 [&>svg]:h-3.5 [&>svg]:w-3.5 ${tone === "blue" ? "text-[#1971d1]" : "text-[#e77b13]"}`}>{icon}</span>
    <div><p className="text-[9px] font-semibold text-[#40596f]">{title}</p><p className="mt-1 text-[8px] leading-[1.55] text-[#8295a8]">{text}</p></div>
  </div>;
}
