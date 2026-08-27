"use client";
export type FilterOption = {
    id: string;
    label: string;
};
type FilterSelectProps = {
    label: string;
    options: FilterOption[];
    selected: string[];
    onChange: (value: string[]) => void;
    className?: string;
};
export default function FilterSelect({ label, options, selected, onChange, className = "w-28" }: FilterSelectProps) {
    return (<label className="shrink-0 text-[8px] font-semibold uppercase tracking-wide text-[#b8cada]">
      {label}
      <select aria-label={label} value={selected[0] ?? "all"} onChange={(event) => onChange(event.target.value === "all" ? [] : [event.target.value])} className={`${className} mt-1 block h-[29px] rounded-sm border border-[#496176] bg-[#152f44] px-2.5 text-[9px] font-medium normal-case text-white outline-none focus:border-[#69bdf5]`}>
        <option value="all">Todos</option>
        {options.map((option) => (<option key={option.id} value={option.id}>
            {option.label}
          </option>))}
      </select>
    </label>);
}
