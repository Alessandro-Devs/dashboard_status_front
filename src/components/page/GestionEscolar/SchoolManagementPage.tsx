import Link from "next/link";
import AttendanceSection from "./AttendanceSection";
import SchoolKpis from "./SchoolKpis";

export default function SchoolManagementPage() {
  return <main className="flex-1 bg-[#f5f8fc] text-[#17324a]">
    <div className="mx-auto w-full max-w-[1020px] px-4 pb-16 pt-5">
      <SchoolKpis />
      <nav aria-label="Vistas de gestión escolar" className="mt-5 flex flex-wrap gap-2">
        <Link href="/gestion-escolar/gestion-operativa" className="flex h-[29px] items-center rounded-md border border-[#d6dfe8] bg-white px-3 text-[8px] text-[#52687d] hover:border-[#1976d2] hover:text-[#1976d2]">Gestión operativa</Link>
      </nav>
      <AttendanceSection />
    </div>
  </main>;
}
