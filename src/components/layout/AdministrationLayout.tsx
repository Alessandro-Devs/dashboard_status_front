"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import AdministrationAside from "@/components/layout/AdministrationAside";

export default function AdministrationLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [asideOpen, setAsideOpen] = useState(false);

  useEffect(() => {
    const inactivityLimit = 15 * 60 * 1000;
    const activityKey = "dashboard:lastActivity";
    const storedUser = window.localStorage.getItem("dashboard:user");

    if (!storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser) as { updatedPassword?: boolean };
      if (user.updatedPassword !== false) {
        router.replace("/login");
        return;
      }
    } catch {
      window.localStorage.removeItem("dashboard:user");
      router.replace("/login");
      return;
    }

    const now = Date.now();
    const lastActivity = Number(window.localStorage.getItem(activityKey)) || now;
    if (now - lastActivity >= inactivityLimit) {
      window.localStorage.removeItem("dashboard:user");
      window.localStorage.removeItem(activityKey);
      router.replace("/login");
      return;
    }

    setAuthorized(true);
    let timer: number;
    const updateActivity = () => {
      window.localStorage.setItem(activityKey, String(Date.now()));
      window.clearTimeout(timer);
      timer = window.setTimeout(logoutForInactivity, inactivityLimit);
    };
    const logoutForInactivity = () => {
      window.localStorage.removeItem("dashboard:user");
      window.localStorage.removeItem(activityKey);
      router.replace("/login");
    };
    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, updateActivity, { passive: true }));
    timer = window.setTimeout(logoutForInactivity, inactivityLimit - (now - lastActivity));

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      window.clearTimeout(timer);
    };
  }, [router]);

  if (!authorized) return null;

  return <div className="min-h-screen bg-[#f3f7fb]"><div className="fixed inset-x-0 top-0 z-[100] flex h-14 items-center bg-[#071a29] px-4 text-white lg:hidden"><button type="button" onClick={() => setAsideOpen(true)} aria-label="Abrir menú" className="rounded-lg p-2 hover:bg-white/10"><Menu size={21} /></button><span className="ml-3 text-sm font-semibold">Administración</span></div>{asideOpen && <button type="button" aria-label="Cerrar menú" onClick={() => setAsideOpen(false)} className="fixed inset-0 z-[105] bg-black/40 lg:hidden" />}<AdministrationAside open={asideOpen} onClose={() => setAsideOpen(false)} /><div className="min-h-screen bg-white ml-0 pt-14 lg:ml-[280px] lg:pt-0">{children}</div></div>;
}
