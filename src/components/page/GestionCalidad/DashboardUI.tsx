"use client";
import type { ReactNode } from "react";
export function SectionHeader({ title, subtitle, rightText }: {
    title: string;
    subtitle: string;
    rightText?: string;
}) {
    return <div className="flex items-start justify-between gap-4"><div><h2 className="text-sm font-semibold tracking-[.04em] text-[#20394e]">{title}</h2><p className="mt-1 text-[8px] text-[#8da0b4]">{subtitle}</p></div>{rightText && <span className="mt-2 text-[8px] text-[#95a7bc]">{rightText}</span>}</div>;
}
export function DashboardCard({ children, className = "" }: {
    children: ReactNode;
    className?: string;
}) {
    return <section className={`w-full min-w-0 rounded-lg border border-[#d6dfe8] bg-white p-4 shadow-[0_1px_2px_rgba(15,35,55,.02)] ${className}`}>{children}</section>;
}
export function CardTitle({ title, subtitle, icon, rightText }: {
    title: string;
    subtitle: string;
    icon?: ReactNode;
    rightText?: string;
}) {
    return <div className="flex items-start justify-between gap-4"><div><h3 className="text-[10px] font-semibold text-[#233a4e]">{title}</h3><p className="mt-[3px] text-[8px] text-[#91a3b7]">{subtitle}</p></div>{icon}{rightText && <span className="text-[8px] text-[#99aabc]">{rightText}</span>}</div>;
}
export function KpiCard({ icon, iconBg, title, children }: {
    icon: ReactNode;
    iconBg: string;
    title: string;
    children: ReactNode;
}) {
    return <div className="min-h-[145px] rounded-lg border border-[#d7e0e9] bg-white p-4"><div className="flex items-start gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${iconBg}`}>{icon}</span><h3 className="max-w-[145px] pt-1 text-[8px] font-semibold uppercase leading-[1.35] tracking-[.04em] text-[#4f6a82]">{title}</h3></div><div className="mt-4">{children}</div></div>;
}
export function CircularProgress({ value }: {
    value: number;
}) {
    return <div className="relative flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[conic-gradient(#277ed0_0deg,#277ed0_40deg,#e6edf6_40deg,#e6edf6_360deg)]"><div className="flex h-[51px] w-[51px] items-center justify-center rounded-full bg-white"><span className="text-xs font-semibold text-[#1976d2]">{value}%</span></div></div>;
}
