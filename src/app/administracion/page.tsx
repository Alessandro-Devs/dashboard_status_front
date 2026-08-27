"use client";

import { useState } from "react";

type SessionUser = { name: string; role?: string };

const roleMessages: Record<string, string> = {
  "Evaluación": "Desde este espacio podrás administrar y controlar la información que se muestra en el módulo de Evaluación del dashboard.",
  "Gestión Escolar": "Desde este espacio podrás administrar y controlar la información que se muestra en el módulo de Gestión Escolar del dashboard.",
  "Gestión de Calidad": "Desde este espacio podrás administrar y controlar la información que se muestra en el módulo de Gestión de Calidad del dashboard.",
  Aprendizaje: "Desde este espacio podrás administrar y controlar la información que se muestra en el módulo de Aprendizaje del dashboard.",
  "Tutoría y Formación": "Desde este espacio podrás administrar y controlar la información que se muestra en el módulo de Tutoría y Formación del dashboard.",
};

export default function AdministrationPage() {
  const [user] = useState<SessionUser>(() => {
    if (typeof window === "undefined") return { name: "Usuario", role: "Usuario" };
    const storedUser = window.localStorage.getItem("dashboard:user");
    if (!storedUser) return { name: "Usuario", role: "Usuario" };
    try { return JSON.parse(storedUser) as SessionUser; } catch { window.localStorage.removeItem("dashboard:user"); return { name: "Usuario", role: "Usuario" }; }
  });

  const role = user.role ?? "Usuario";
  const message = roleMessages[role] ?? "Desde este espacio podrás administrar y controlar la información que se muestra en el dashboard.";

  return <main className="min-h-screen bg-[#f3f7fb] p-5 sm:p-8 lg:p-10"><div className="mx-auto max-w-5xl"><h2 className="mt-2 text-3xl font-semibold text-[#17324a]">Bienvenido/a, {user.name}</h2><p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#61788c]">{message}</p><section className="mt-8 rounded-2xl border border-[#dce6ef] bg-white p-6 shadow-[0_12px_32px_rgba(27,58,87,.07)]"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f3ff] text-[#176fc8]">{role.slice(0, 1).toUpperCase()}</div><div><p className="text-xs text-[#8294a6]">Rol asignado</p><p className="text-base font-semibold text-[#17324a]">{role}</p></div></div><p className="mt-5 text-sm leading-6 text-[#61788c]">Utiliza las opciones del menú lateral para gestionar los contenidos y configuraciones disponibles para tu rol.</p></section></div></main>;
}
