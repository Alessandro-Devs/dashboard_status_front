"use client";

type PeriodFilterProps =
  | {
      date: string;
      onApply: (date: string) => void;
    }
  | {
      startDate: string;
      endDate: string;
      onApply: (startDate: string, endDate: string) => void;
    };

export default function PeriodFilter(props: PeriodFilterProps) {
  const date = "date" in props ? props.date : props.endDate;

  const selectDate = (selectedDate: string) => {
    if (!selectedDate) return;

    if ("date" in props) props.onApply(selectedDate);
    else props.onApply(selectedDate, selectedDate);
  };

  return (
    <label className="ml-auto block shrink-0">
      <span className="mb-1 block text-[8px] font-semibold uppercase tracking-wide text-[#b8cada]">
        Fecha de corte
      </span>
      <input
        type="date"
        value={date}
        onChange={(event) => selectDate(event.target.value)}
        className="h-[29px] w-[152px] rounded-sm border border-[#496176] bg-[#152f44] px-2.5 text-[9px] font-medium text-white outline-none [color-scheme:dark] focus:border-[#75c4fa]"
      />
    </label>
  );
}
