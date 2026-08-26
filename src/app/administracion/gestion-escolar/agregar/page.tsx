import SchoolManagementFormPage from "@/components/page/Administracion/SchoolManagementFormPage";

export default async function AddSchoolManagementPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  return <SchoolManagementFormPage recordId={id && /^\d+$/.test(id) ? Number(id) : undefined}/>;
}
