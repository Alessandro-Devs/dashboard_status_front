"use client";
import { AlertTriangle, BookOpenCheck, Layers3 } from "lucide-react";
import type { LearningLine } from "./learningData";
export default function LearningSummary({ lines }: {
    lines: LearningLine[];
}) {
    const maxClass = lines.length ? Math.max(...lines.map((item) => item.estatus.hastaClase)) : 0;
    const barriers = lines.filter((item) => item.barrera).length;
    const cards = [
        [Layers3, "Líneas visibles", String(lines.length), "Aplicativos según los filtros", "text-[#126fd0] bg-[#eaf3ff]"],
        [BookOpenCheck, "Clase más avanzada", String(maxClass), "Máximo registrado en el periodo", "text-[#16863f] bg-[#eaf8ef]"],
        [AlertTriangle, "Barreras identificadas", String(barriers), "Una barrera principal por línea", "text-[#e77b13] bg-[#fff3e6]"],
    ] as const;
    return <div className="mt-5 grid gap-4 md:grid-cols-3">{cards.map(([Icon, title, value, description, colors]) => <article key={title} className="min-h-[118px] rounded-lg border bg-white p-4">
    <div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors}`}><Icon className="h-4 w-4"/></span><span className="text-[9px] font-semibold uppercase text-[#587086]">{title}</span></div>
    <p className={`mt-4 text-[26px] font-medium ${colors.split(" ")[0]}`}>{value}</p>
    <p className="mt-3 text-[9px] text-[#8295a8]">{description}</p>
  </article>)}</div>;
}
