import DashboardPage from "@/components/page/DashboardPage";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const view = typeof params.view === "string" ? params.view : "gestion-calidad";
  return <DashboardPage view={view} />;
}
