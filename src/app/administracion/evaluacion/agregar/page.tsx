import EvaluationFormPage from "@/components/page/Administracion/EvaluationFormPage";

export default async function AddEvaluationPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const recordId = id && /^\d+$/.test(id) ? Number(id) : undefined;
  return <EvaluationFormPage recordId={recordId} />;
}
