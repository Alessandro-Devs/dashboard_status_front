import QualityManagementFormPage from "@/components/page/Administracion/QualityManagementFormPage";

export default async function AddQualityManagementPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <QualityManagementFormPage recordId={id && /^\d+$/.test(id) ? Number(id) : undefined}/>;
}
