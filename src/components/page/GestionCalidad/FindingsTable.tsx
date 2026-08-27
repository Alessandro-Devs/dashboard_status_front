"use client";
import type { Finding } from "./qualityData";
export default function FindingsTable({ data }: {
    data: Finding[];
}) {
    return <div className="overflow-x-auto"><table className="w-full min-w-[600px] border-collapse"><thead><tr className="border-y border-[#dfe6ed] bg-[#f8fafc] text-left">{["Hallazgo", "Proceso", "Descripción", "Impacto"].map((heading) => <th key={heading} className="px-3 py-3 text-[9px] font-semibold uppercase text-[#768a9e] first:pl-4">{heading}</th>)}</tr></thead><tbody>{data.map((item) => <tr key={item.title} className="border-b border-[#e4eaf0] align-top"><td className="px-4 py-3 text-[10px] font-medium leading-[1.5] text-[#183049]">{item.title}</td><td className="px-3 py-3 text-[9px] leading-[1.5] text-[#60778c]">{item.process}</td><td className="max-w-[330px] px-3 py-3 text-[9px] leading-[1.6] text-[#71869a]">{item.description}</td><td className="px-3 py-3"><span className="rounded-full bg-[#ffe8e8] px-2 py-1 text-[9px] font-semibold text-[#f04444]">{item.impact}%</span></td></tr>)}</tbody></table></div>;
}
