"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/services/api";
import DeleteEvaluationModal from "@/components/page/Administracion/DeleteEvaluationModal";

type RecordItem = { id: number; date: string; createdAt: string; updatedAt: string; data: unknown };
const hiddenLegacyDates = new Set(["2026-08-13", "2026-08-20"]);
const format = (value: string) => new Intl.DateTimeFormat("es-SV", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export default function LearningAdministrationPage() {
  const router = useRouter();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    apiFetch<{ records: RecordItem[] }>("/dashboard/sections/aprendizaje")
      .then((result) => setRecords(result.records.filter((record) => !hiddenLegacyDates.has(record.date))))
      .catch((cause) => setError(cause instanceof Error ? cause.message : "No fue posible cargar los registros."))
      .finally(() => setLoading(false));
  }, []);

  const remove = async () => {
    if (!selected) return;
    setDeleting(true);
    setError("");
    try {
      await apiFetch(`/dashboard/sections/aprendizaje/${selected.id}`, { method: "DELETE" });
      setRecords((items) => items.filter((item) => item.id !== selected.id));
      setSelected(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No fue posible eliminar el registro.");
    } finally {
      setDeleting(false);
    }
  };

  return <main className="min-h-screen bg-[#f3f7fb] p-5 sm:p-8 lg:p-10"><div className="mx-auto max-w-5xl"><div className="flex items-center justify-between gap-4"><h2 className="text-3xl font-semibold text-[#17324a]">Aprendizaje</h2><button type="button" onClick={() => router.push("/administracion/aprendizaje/agregar")} className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#c9ddec] bg-white px-3 text-xs font-semibold text-[#176fc8] hover:bg-[#f5faff]"><Plus size={15}/>Agregar</button></div><p className="mt-2 text-[15px] text-[#61788c]">Registros disponibles para la nueva estructura del módulo de Aprendizaje.</p>{error && <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}{loading ? <p className="mt-8 text-sm text-[#61788c]">Cargando registros...</p> : <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce6ef] bg-white shadow-[0_12px_32px_rgba(27,58,87,.07)]"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-center text-sm"><thead className="bg-[#edf5fc] text-xs uppercase tracking-wide text-[#526a80]"><tr><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Hora de creación</th><th className="px-5 py-4">Hora de actualización</th><th className="px-5 py-4">Acciones</th></tr></thead><tbody className="divide-y divide-[#e5edf3]">{records.length === 0 ? <tr><td colSpan={4} className="px-5 py-10 text-[#8294a6]">No hay registros nuevos de Aprendizaje.</td></tr> : records.map((record) => <tr key={record.id} className="hover:bg-[#f8fbfe]"><td className="px-5 py-4 text-[#526a80]">{record.date}</td><td className="px-5 py-4 text-[#526a80]">{format(record.createdAt)}</td><td className="px-5 py-4 text-[#526a80]">{format(record.updatedAt)}</td><td className="px-5 py-4"><div className="flex justify-center gap-2"><button type="button" onClick={() => router.push(`/administracion/aprendizaje/agregar?id=${record.id}`)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#e8f3ff] text-[#176fc8] hover:bg-[#d7ebfc]" aria-label={`Editar registro ${record.id}`}><Pencil size={16}/></button><button type="button" onClick={() => setSelected(record)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#fff0f0] text-[#d64545] hover:bg-[#ffe0e0]" aria-label={`Eliminar registro ${record.id}`}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></div>}</div>{selected && <DeleteEvaluationModal moduleName="Aprendizaje" date={selected.date} deleting={deleting} onCancel={() => setSelected(null)} onConfirm={remove}/>}</main>;
}
