import { PackageCheck, PenTool, Upload, type LucideIcon } from "lucide-react";
import type { LineProgress } from "./learningData";

export default function LearningSummary({ lines }: { lines: LineProgress[] }) {
  const average = (key: "authoring" | "production" | "publication") => Math.round(lines.reduce((sum,item) => sum + item[key],0) / lines.length);
  const cards: [LucideIcon,string,string,string,string][] = [[PenTool,"Autoría",`${average("authoring")}%`,"Avance promedio de creación","text-[#126fd0] bg-[#eaf3ff]"],[PackageCheck,"Producción / edición",`${average("production")}%`,"Avance promedio de producción","text-[#7540f1] bg-[#f1ebff]"],[Upload,"Publicación",`${average("publication")}%`,"Avance promedio de publicación","text-[#16863f] bg-[#eaf8ef]"]];
  return <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">{cards.map(([Icon,title,value,description,colors]) => <article key={title} className="min-h-[118px] rounded-lg border border-[#d8e0e8] bg-white p-4"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${colors}`}><Icon className="h-4 w-4" /></span><span className="text-[8px] font-semibold uppercase tracking-[.04em] text-[#587086]">{title}</span></div><p className={`mt-4 text-[25px] font-medium leading-none ${colors.split(" ")[0]}`}>{value}</p><p className="mt-3 text-[8px] text-[#91a3b7]">{description}</p></article>)}</div>;
}
