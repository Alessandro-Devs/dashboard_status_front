import type { Metadata } from "next";
import { Suspense } from "react";
import AuditReportHeader from "@/components/layout/AuditReportHeader";
import GlobalFooter from "@/components/layout/GlobalFooter";
import MobileHeaderShell from "@/components/layout/MobileHeaderShell";
import { AuditFiltersProvider } from "@/stores/AuditFiltersContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Status",
  description: "Panel de estado",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AuditFiltersProvider>
          <MobileHeaderShell>
            <Suspense fallback={null}>
              <AuditReportHeader />
            </Suspense>
          </MobileHeaderShell>
          {children}
          <Suspense fallback={null}>
            <GlobalFooter />
          </Suspense>
        </AuditFiltersProvider>
      </body>
    </html>
  );
}
