"use client";
import { useEffect, useRef } from "react";
import LearningPage from "@/components/page/Aprendizaje/LearningPage";
import EvaluationPage from "@/components/page/Evaluacion/EvaluationPage";
import AuditReportPage from "@/components/page/GestionCalidad/AuditReportPage";
import SchoolNoAccessDashboard from "@/components/page/GestionEscolar/SchoolNoAccessDashboard";
import TutoringAndTrainingPage from "@/components/page/TutoriaFormacion/TutoringAndTrainingPage";
import { dashboardSections } from "@/lib/dashboardSections";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
import { useDashboardData } from "@/stores/DashboardDataContext";
import { withDateQuery } from "@/lib/dateQuery";
const sectionContent = {
    "gestion-calidad": <AuditReportPage />,
    "gestion-escolar": <SchoolNoAccessDashboard />,
    aprendizaje: <LearningPage />,
    evaluacion: <EvaluationPage />,
    "tutoria-formacion": <TutoringAndTrainingPage />,
} as const;
export default function AllDashboardSections() {
    const { setActiveSection } = useAuditFilters();
    const { availableSections, hasData, isLoading, snapshotDate, error } = useDashboardData();
    const pendingSection = useRef<{
        id: string;
        direction: "up" | "down";
    } | null>(null);
    const sections = hasData ? availableSections : dashboardSections;
    // Sección del link compartido (#evaluacion, #aprendizaje…). Se lee una vez, antes de que el scroll la cambie.
    const initialHash = useRef<string | null | undefined>(undefined);
    useEffect(() => {
        if (initialHash.current === undefined)
            initialHash.current = window.location.hash.slice(1) || null;
        // Mientras cargan los datos no hay secciones en pantalla: no se toca la URL.
        if (!hasData || sections.length === 0)
            return;
        const beginNavigation = (event: Event) => {
            const id = (event as CustomEvent<{
                id: string;
            }>).detail?.id;
            const target = id ? document.getElementById(id) : null;
            if (id && target) {
                pendingSection.current = {
                    id,
                    direction: target.getBoundingClientRect().top >= 190 ? "down" : "up",
                };
            }
        };
        const updateActiveSection = () => {
            // Al salir del dashboard (por ejemplo, "Ir al panel") todavía puede llegar un evento de scroll:
            // si se reescribe la URL en ese momento, la navegación regresa al dashboard.
            if (window.location.pathname !== "/")
                return;
            const header = document.querySelector<HTMLElement>(".mobile-header");
            const marker = (header?.getBoundingClientRect().height ?? 0) + 4;
            if (pendingSection.current) {
                const pending = pendingSection.current;
                const target = document.getElementById(pending.id);
                const targetTop = target?.getBoundingClientRect().top;
                const arrived = targetTop !== undefined && (pending.direction === "down"
                    ? targetTop <= marker + 60
                    : targetTop >= marker - 60);
                if (target && arrived) {
                    const arrivedId = pending.id;
                    const arrived = sections.find((section) => section.id === arrivedId);
                    pendingSection.current = null;
                    if (arrived)
                        setActiveSection(arrived.label);
                    window.dispatchEvent(new CustomEvent("dashboard:arrived", { detail: { id: arrivedId } }));
                }
                return;
            }
            let current = sections[0];
            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element && element.getBoundingClientRect().top <= marker)
                    current = section;
            }
            setActiveSection(current.label);
            const nextUrl = withDateQuery(`/#${current.id}`);
            if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== nextUrl) {
                window.history.replaceState(window.history.state, "", nextUrl);
            }
        };
        const hashTarget = initialHash.current && sections.some((section) => section.id === initialHash.current) ? initialHash.current : null;
        initialHash.current = null;
        if (hashTarget) {
            // Abrir el link directamente en la sección indicada.
            pendingSection.current = { id: hashTarget, direction: "down" };
            requestAnimationFrame(() => {
                const target = document.getElementById(hashTarget);
                const header = document.querySelector<HTMLElement>(".mobile-header");
                if (target) {
                    const headerHeight = header?.getBoundingClientRect().height ?? 0;
                    window.scrollTo({ top: Math.max(window.scrollY + target.getBoundingClientRect().top - headerHeight, 0) });
                }
                updateActiveSection();
            });
        }
        else {
            updateActiveSection();
        }
        window.addEventListener("dashboard:navigate", beginNavigation);
        window.addEventListener("scroll", updateActiveSection, { passive: true });
        window.addEventListener("resize", updateActiveSection);
        return () => {
            window.removeEventListener("dashboard:navigate", beginNavigation);
            window.removeEventListener("scroll", updateActiveSection);
            window.removeEventListener("resize", updateActiveSection);
        };
    }, [hasData, sections, setActiveSection]);
    if (!hasData) {
        // Mientras carga, el modal del encabezado informa al usuario; aquí solo se muestra un esqueleto.
        if (isLoading) return <LoadingDashboardSkeleton />;
        return <EmptyDashboardState message={error ?? undefined}/>;
    }
    if (sections.length === 0) {
        return <EmptyDashboardState message="No existen secciones con datos para la fecha seleccionada."/>;
    }
    return <>{sections.map((section) => (<section key={`${section.id}-${snapshotDate ?? "loading"}`} id={section.id} aria-label={section.label} className="scroll-mt-[150px]">
      <div className="border-y border-[#d9e1e8] bg-[#eef3f8]">
        <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-3 px-4 py-3 text-[#526a80] sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[15px] font-bold text-[#29445b]">{section.id === "gestion-calidad" ? "Gestión Calidad" : section.label}</h2>
            {section.id !== "gestion-calidad" && <p className="mt-0.5 text-[9px] text-[#8296a8]">{section.description}</p>}
          </div>
        </div>
      </div>
      {sectionContent[section.id]}
    </section>))}</>;
}
function LoadingDashboardSkeleton() {
    return <main className="flex-1 bg-[#f5f8fc]" aria-hidden="true">
    <div className="mx-auto w-full max-w-[1020px] animate-pulse px-4 pb-16 pt-5 motion-reduce:animate-none">
      <div className="h-3 w-40 rounded-full bg-[#e3eaf2]"/>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((item) => <div key={item} className="h-[110px] rounded-lg border border-[#e1e8ef] bg-white p-4"><div className="h-2 w-16 rounded-full bg-[#e8eef5]"/><div className="mt-5 h-6 w-12 rounded-md bg-[#e8eef5]"/><div className="mt-4 h-2 w-20 rounded-full bg-[#eef3f8]"/></div>)}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[0, 1].map((item) => <div key={item} className="h-[220px] rounded-lg border border-[#e1e8ef] bg-white p-4"><div className="h-2.5 w-28 rounded-full bg-[#e8eef5]"/><div className="mt-6 flex h-[150px] items-end gap-3">{[55, 80, 40, 95, 65, 75].map((height, index) => <div key={index} className="flex-1 rounded-t-md bg-[#eef3f8]" style={{ height: `${height}%` }}/>)}</div></div>)}
      </div>
    </div>
  </main>;
}
function EmptyDashboardState({ message }: {
    message?: string;
}) {
    return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {["Indicadores", "Avance", "Registros", "Resultados"].map((title) => (<article key={title} className="min-h-[110px] rounded-lg border border-[#d7e0e8] bg-white p-4">
            <p className="text-[8px] font-semibold uppercase tracking-[.04em] text-[#71869a]">{title}</p>
            <p className="mt-4 text-2xl font-semibold text-[#8b9cad]">0</p>
            <p className="mt-3 text-[8px] text-[#9aabba]">Sin datos para el periodo</p>
          </article>))}
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-[#cbd6e0] bg-white px-5 py-10 text-center">
        <p className="text-[11px] font-semibold text-[#526a80]">Dashboard</p>
        <p className="mt-2 text-[9px] text-[#8b9daf]">{message ?? "No existen registros para la fecha seleccionada."}</p>
      </div>
    </div>
  </main>;
}
