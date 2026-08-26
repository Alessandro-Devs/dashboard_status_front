"use client";
import { GraduationCap, School, Users, type LucideIcon } from "lucide-react";
const items: {
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    title: string;
    value: string;
    valueColor: string;
    description: string;
}[] = [
    { icon: GraduationCap, iconColor: "text-[#1674dc]", iconBg: "bg-[#e9f3ff]", title: "Matrícula", value: "38,240", valueColor: "text-[#146cd1]", description: "Estudiantes registrados" },
    { icon: Users, iconColor: "text-[#7e48f2]", iconBg: "bg-[#f2ecff]", title: "Docentes", value: "1824", valueColor: "text-[#7243ec]", description: "Docentes registrados" },
    { icon: School, iconColor: "text-[#228c4d]", iconBg: "bg-[#eaf8ef]", title: "Centros escolares", value: "870", valueColor: "text-[#168642]", description: "Centros con matrícula" },
];
export default function SchoolKpis() {
    return <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{items.map(({ icon: Icon, ...item }) => <article key={item.title} className="min-h-[115px] rounded-lg border border-[#d7e0e8] bg-white p-4"><div className="flex items-center gap-3"><span className={`flex h-7 w-7 items-center justify-center rounded-md ${item.iconBg}`}><Icon className={`h-4 w-4 ${item.iconColor}`}/></span><h3 className="text-[8px] font-semibold uppercase tracking-[.04em] text-[#587086]">{item.title}</h3></div><p className={`mt-4 text-2xl font-medium leading-none ${item.valueColor}`}>{item.value}</p><p className="mt-3 text-[8px] text-[#92a3b5]">{item.description}</p></article>)}</div>;
}
