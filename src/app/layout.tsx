import type { Metadata } from "next";
import { Suspense } from "react";
import RouteShell from "@/Router/RouteShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dashboard Status",
  description: "Panel de estado",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <RouteShell>{children}</RouteShell>
        </Suspense>
      </body>
    </html>
  );
}
