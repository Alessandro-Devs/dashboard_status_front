"use client";

import { ChevronLeft } from "lucide-react";
import EvaluationComparison from "./EvaluationComparison";

export default function EvaluationProgress({ onBack }: { onBack: () => void }) {
  return (
    <main className="flex-1 bg-[#f5f8fc] px-4 pb-16 pt-5 text-[#17324a]">
      <div className="mx-auto max-w-[1020px]">
        <button onClick={onBack} className="mb-4 flex items-center gap-1 text-[8px] text-[#176fc8]">
          <ChevronLeft className="h-3 w-3" />
          Volver a Evaluación
        </button>
        <EvaluationComparison />
      </div>
    </main>
  );
}
