export default function BarreraAplicacionCard() {
  return (
    <article className="overflow-hidden rounded-xl border border-[#e1e7ed] bg-white shadow-[0_8px_24px_rgba(35,52,70,0.04)]">
      <div className="grid md:grid-cols-[0.9fr_1.1fr]">
        <div className="border-b border-[#edf1f4] p-5 md:border-b-0 md:border-r md:p-6">
          <span className="inline-flex rounded-full bg-[#eef5fc] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#46729a]">
            Aplicación CML
          </span>

          <p className="mt-5 text-[15px] font-semibold leading-relaxed text-[#263d52] sm:text-base">
            Programados 55 centros (No aplicación y baja participación)
          </p>

          <ul className="mt-5 space-y-3 border-t border-[#edf1f4] pt-4 text-[14px] leading-relaxed text-[#5d7184] sm:text-[15px]">
            <li className="flex gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6f8ba3]" />
              <span>Aplicación en 31 centros 12 de agosto, 1 pendiente por finalizar. 14 CE aplicación con Starlink</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#6f8ba3]" />
              <span>24 centros en aplicación 13 de agosto. 10 CE aplicación con Starlink</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 bg-[#fffafa] p-5 md:p-6">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f2cccc] bg-white text-lg font-bold text-[#c91c1c]">
            !
          </span>
          <p className="text-[14px] leading-relaxed text-[#4a4f55] sm:text-[15px]">
            <span className="font-semibold text-[#a62626]">Barrera:</span>{" "}
            El contrato con SOTE se ha vencido, aplicaciones están por fuera de contrato
          </p>
        </div>
      </div>
    </article>
  );
}
