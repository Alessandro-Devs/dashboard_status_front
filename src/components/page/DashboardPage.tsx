"use client";
import { useLayoutEffect } from "react";
import AuditReportPage from "@/components/page/GestionCalidad/AuditReportPage";
import SchoolManagementPage from "@/components/page/GestionEscolar/SchoolManagementPage";
import LearningPage from "@/components/page/Aprendizaje/LearningPage";
import EvaluationPage from "@/components/page/Evaluacion/EvaluationPage";
import TutoringAndTrainingPage from "@/components/page/TutoriaFormacion/TutoringAndTrainingPage";
import { useAuditFilters } from "@/stores/AuditFiltersContext";
const sectionByView: Record<string, string> = { "gestion-calidad": "Gestión de Calidad", "gestion-escolar": "Gestión Escolar", aprendizaje: "Aprendizaje", evaluacion: "Evaluación", "tutoria-formacion": "Tutoría y Formación" };
export default function DashboardPage({ view }: {
    view: string;
}) {
    const { activeSection, setActiveSection } = useAuditFilters();
    const requestedSection = sectionByView[view] ?? "Gestión de Calidad";
    useLayoutEffect(() => { setActiveSection(requestedSection); }, [requestedSection, setActiveSection]);
    const visibleSection = activeSection === requestedSection ? activeSection : requestedSection;
    if (visibleSection === "Gestión Escolar")
        return <SchoolManagementPage />;
    if (visibleSection === "Aprendizaje")
        return <LearningPage />;
    if (visibleSection === "Evaluación")
        return <EvaluationPage />;
    if (visibleSection === "Tutoría y Formación")
        return <TutoringAndTrainingPage />;
    return <AuditReportPage />;
}
