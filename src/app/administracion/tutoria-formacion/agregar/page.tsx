import TutoringTrainingFormPage from "@/components/page/Administracion/TutoringTrainingFormPage";

export default async function AddTutoringTrainingPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <TutoringTrainingFormPage recordId={id && /^\d+$/.test(id) ? Number(id) : undefined}/>;
}
