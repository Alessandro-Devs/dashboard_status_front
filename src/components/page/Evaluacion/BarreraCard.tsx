export default function BarreraCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e1e7ed] bg-white shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-[#edf1f4] p-5 md:border-b-0 md:border-r md:p-6">
          <span className="inline-flex rounded-full bg-[#eef5fc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#46729a]">
            Actualización del portal
          </span>

          <div className="mt-5 space-y-4">
            <p className="text-[15px] font-semibold leading-relaxed text-[#263d52] sm:text-base">
              Entrada en funcionamiento del portal 10 de agosto
            </p>

            <div className="h-px bg-[#edf1f4]" />

            <p className="text-[14px] leading-relaxed text-[#5d7184] sm:text-[15px]">
              43 reportes de incidencias de ingreso o falta de datos, hasta el 13 de agosto
            </p>
          </div>
        </div>

        <div className="flex gap-4 bg-[#fffafa] p-5 md:p-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f2cccc] bg-white text-lg font-bold text-[#c91c1c]">
            !
          </span>

          <p className="text-[14px] leading-relaxed text-[#4a4f55] sm:text-[15px]">
            <span className="font-semibold text-[#a62626]">Barrera:</span>{" "}
            Para fase 1 solo se contempló ingreso a directores y docentes, no hay acceso para usuarios
            “administradores”, esto se dará en fase 2 de desarrollo
          </p>
        </div>
      </div>
    </article>
  );
}
