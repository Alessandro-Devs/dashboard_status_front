"use client";

import { ClipboardCheck, House, LogOut, School, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";

type StoredUser = { name: string; role?: string };

export default function AdministrationAside({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useState<StoredUser>(() => {
    if (typeof window === "undefined") return { name: "Usuario", role: "Usuario" };
    const storedUser = window.localStorage.getItem("dashboard:user");
    if (!storedUser) return { name: "Usuario", role: "Usuario" };
    try { return JSON.parse(storedUser) as StoredUser; } catch { window.localStorage.removeItem("dashboard:user"); return { name: "Usuario", role: "Usuario" }; }
  });

  function logout() {
    window.localStorage.removeItem("dashboard:user");
    window.localStorage.removeItem("dashboard:lastActivity");
    router.push("/login");
  }

  const normalizedRole = (user.role ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const canAccessEvaluation = normalizedRole === "evaluacion";
  const canAccessSchoolManagement = normalizedRole === "gestion escolar";

  return <aside className={`fixed inset-y-0 left-0 z-[110] flex w-[280px] flex-col bg-[#071a29] px-5 py-7 text-white shadow-[8px_0_24px_rgba(7,26,41,.12)] transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
    <div><div className="relative mb-4 flex items-center justify-start"><div className="flex h-11 min-w-[72px] items-center justify-center rounded-xl bg-[#176fc8] px-2 text-lg font-bold">Panel</div><button type="button" onClick={onClose} aria-label="Cerrar menú" className="absolute right-0 rounded-lg p-2 text-[#9bb0c1] hover:bg-white/10 hover:text-white lg:hidden"><X size={20} /></button></div><h1 className="text-left text-[20px] font-semibold leading-tight">Administración</h1></div>
    <nav className="mt-8 space-y-2" aria-label="Módulos de administración"><button type="button" onClick={() => { router.push("/administracion"); onClose(); }} className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium text-white transition hover:bg-white/[0.15] ${pathname === "/administracion" ? "bg-white/10" : "bg-transparent"}`}><House size={18} /><span>Home</span></button>{canAccessEvaluation && <button type="button" onClick={() => { router.push("/administracion/evaluacion"); onClose(); }} className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium text-white transition hover:bg-white/[0.15] ${pathname.startsWith("/administracion/evaluacion") ? "bg-white/10" : "bg-transparent"}`}><ClipboardCheck size={18} /><span>Evaluación</span></button>}{canAccessSchoolManagement && <button type="button" onClick={() => { router.push("/administracion/gestion-escolar"); onClose(); }} className={`flex h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-left text-[13px] font-medium text-white transition hover:bg-white/[0.15] ${pathname.startsWith("/administracion/gestion-escolar") ? "bg-white/10" : "bg-transparent"}`}><School size={18}/><span>Gestión Escolar</span></button>}</nav>
    <div className="mt-auto border-t border-white/10 pt-5"><div className="mb-4 min-w-0 text-center"><p className="truncate text-[14px] font-semibold text-white">{user.name}</p><p className="mt-1 truncate text-[12px] text-[#9bb0c1]">{user.role ?? "Usuario"}</p></div><button type="button" onClick={logout} className="relative flex h-10 w-full cursor-pointer items-center justify-center rounded-lg bg-white/10 px-3 text-center text-[13px] font-medium text-[#c4d3de] transition hover:bg-white/[0.15] hover:text-white"><LogOut size={16} className="absolute left-3" /><span>Cerrar sesión</span></button></div>
  </aside>;
}
