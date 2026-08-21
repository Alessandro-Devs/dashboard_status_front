"use client";

type PeriodFilterProps =
  | { date: string; onApply: (date: string) => void }
  | { startDate: string; endDate: string; onApply: (startDate: string, endDate: string) => void };

export default function PeriodFilter(props: PeriodFilterProps) {
  const date = "date" in props ? props.date : props.endDate;

  const selectDate = (selectedDate: string) => {
    if (!selectedDate) return;
    if ("date" in props) props.onApply(selectedDate);
    else props.onApply(selectedDate, selectedDate);
  };

  return <label className="ml-auto block min-w-0 shrink-0 text-[8px] font-semibold uppercase tracking-wide text-[#b8cada]">
    Fecha de corte
    <input type="date" value={date} onChange={(event) => selectDate(event.target.value)} className="mt-1 block h-[30px] w-[152px] max-w-full rounded-sm border border-[#496176] bg-white px-2.5 text-[9px] font-medium normal-case text-[#29445b] outline-none focus:border-[#2680eb]" />
  </label>;
}
