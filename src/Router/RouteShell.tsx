"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import AuditReportHeader from "@/components/layout/AuditReportHeader";
import GlobalFooter from "@/components/layout/GlobalFooter";
import MobileHeaderShell from "@/components/layout/MobileHeaderShell";
import AdministrationLayout from "@/components/layout/AdministrationLayout";
import { AuditFiltersProvider } from "@/stores/AuditFiltersContext";
import { DashboardDataProvider } from "@/stores/DashboardDataContext";

export default function RouteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname !== "/login") return;
    const storedUser = window.localStorage.getItem("dashboard:user");
    if (!storedUser) return;
    try {
      const user = JSON.parse(storedUser) as { updatedPassword?: boolean };
      if (user.updatedPassword === false) router.replace("/administracion");
    } catch {
      window.localStorage.removeItem("dashboard:user");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (pathname !== "/login") return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyZoom = document.body.style.zoom;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.body.style.zoom = "1";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.zoom = previousBodyZoom;
    };
  }, [pathname]);

  if (pathname === "/login") {
    return children;
  }

  if (pathname.startsWith("/administracion")) {
    return <AdministrationLayout>{children}</AdministrationLayout>;
  }

  return (
    <AuditFiltersProvider>
      <DashboardDataProvider>
        <MobileHeaderShell>
          <AuditReportHeader />
        </MobileHeaderShell>
        {children}
        <GlobalFooter />
      </DashboardDataProvider>
    </AuditFiltersProvider>
  );
}
