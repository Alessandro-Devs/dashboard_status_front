"use client";

import { useRouter } from "next/navigation";
import EvaluationProgress from "@/components/page/Evaluacion/EvaluationProgress";

export default function Page() {
  const router = useRouter();

  return <EvaluationProgress onBack={() => router.push("/#evaluacion")} />;
}
