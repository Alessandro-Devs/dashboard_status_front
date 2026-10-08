"use client";

import { dashboardDatabase } from "@/data/dashboardDatabase";
import { learningSubjects } from "@/lib/learningSubjects";
import { hasLearningProgressData, LearningProgressLineCards, LearningProgressSummaryCards, type LearningProgressData } from "./LearningSummary";
import StaticProductionProgress from "./StaticProductionProgress";

const stages = ["Autoría", "Edición", "Publicación"];

// Cards por materia capturadas en Administración > Aprendizaje (solo las materias actuales, en su orden).
const subjectProgress = (data: LearningProgressData | undefined): LearningProgressData => {
  const lines = learningSubjects.flatMap((subject) => data?.lineasAplicativo?.filter((line) => line.name?.trim().toLowerCase() === subject.toLowerCase()).slice(0, 1) ?? []);
  const resumenAvance = stages.flatMap((title, index) => {
    const values = lines.map((line) => line.items[index]?.value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    return values.length ? [{ title, value: Math.round(values.reduce((sum, value) => sum + value, 0) / values.length), description: "Avance promedio" }] : [];
  });
  // Las etapas siempre usan los nombres actuales, aunque el registro se haya guardado con otros.
  return { resumenAvance, lineasAplicativo: lines.map((line) => ({ ...line, items: line.items.map((item, index) => ({ ...item, label: stages[index] ?? item.label })) })) };
};

export default function LearningPage() {
  const learningProgressData = dashboardDatabase.aprendizaje;
  const progressData = hasLearningProgressData(learningProgressData) ? learningProgressData : undefined;
  const subjects = subjectProgress(progressData);
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]"><div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-6"><StaticProductionProgress>
    <LearningProgressSummaryCards data={subjects}/>
    <LearningProgressLineCards data={subjects}/>
  </StaticProductionProgress></div></main>;
}
