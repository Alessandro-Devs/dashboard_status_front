import LearningFormPage from "@/components/page/Administracion/LearningFormPage";

export default async function AddLearningPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <LearningFormPage recordId={id && /^\d+$/.test(id) ? Number(id) : undefined}/>;
}
