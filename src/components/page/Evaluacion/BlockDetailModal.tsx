"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import {
  getBlockData,
  getEnrollmentData,
  type BlockItem,
  type TestType,
} from "./evaluationData";

type DetailMode = "centros" | "matricula";

export default function BlockDetailModal({
  testType,
  title,
  onClose,
}: {
  testType: TestType;
  title: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<DetailMode>("centros");
  const data = mode === "centros" ? getBlockData(testType) : getEnrollmentData(testType);
  const blockRangeTitle = getBlockRangeTitle(data);
  const totals = useMemo(
    () =>
      data.reduce(
        (sum, item) => ({
          universe: sum.universe + item.universe,
          applied: sum.applied + item.applied,
          pending: sum.pending + item.pending,
        }),
        { universe: 0, applied: 0, pending: 0 },
      ),
    [data],
  );
  const percentage = totals.universe ? Math.round((totals.applied / totals.universe) * 100) : 0;

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", escape);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [onClose]);

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#17324a]/55 p-4"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="block-detail-title"
        className="max-h-[95vh] w-full max-w-[760px] overflow-hidden rounded-[11px] border-t-[3px] border-[#2f82d5] bg-white shadow-[0_22px_50px_rgba(15,35,55,.25)]"
      >
        <header className="flex items-start justify-between px-4 pb-3 pt-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#eaf4ff] px-2 py-1 text-[6px] font-semibold uppercase text-[#2a79c8]">
                {title}
              </span>
            </div>
            <h2
              id="block-detail-title"
              className="mt-2 font-serif text-lg font-bold text-[#1f3448]"
            >
              {blockRangeTitle}
            </h2>
            <p className="mt-1 text-[6px] text-[#8799aa]">
              Aplicacion registrada respecto al universo de cada bloque.
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar detalle"
            onClick={onClose}
            className="text-lg text-[#8ea1b4] hover:text-[#4c6277]"
          >
            x
          </button>
        </header>

        <div className="flex items-center justify-between border-y border-[#dfe6ed] bg-[#fbfcfd] px-4">
          <span className="text-[6px] font-semibold uppercase tracking-[0.08em] text-[#657b90]">
            Desagregar por
          </span>
          <nav aria-label="Detalle por bloque" className="flex h-[34px] items-center gap-1">
            <ModeButton active={mode === "centros"} onClick={() => setMode("centros")}>
              Centros escolares
            </ModeButton>
            <ModeButton active={mode === "matricula"} onClick={() => setMode("matricula")}>
              Matricula
            </ModeButton>
          </nav>
        </div>

        <div className="max-h-[calc(95vh-145px)] overflow-y-auto px-4 py-4">
          {data.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <Metric
                  label="Universo"
                  value={<span className="block-detail-metric-value text-[20px] font-medium leading-none">{format(totals.universe)}</span>}
                  details={data.map((item) => ({ label: item.block, value: format(item.universe) }))}
                />
                <Metric
                  label="Aplicados"
                  value={
                    <>
                      <span className="block-detail-metric-value text-[20px] font-medium leading-none">
                        {format(totals.applied)}
                      </span>
                      <span className="block-detail-metric-percent ml-1 text-[12px] font-medium leading-none text-gray-600">
                        - {percentage}% del universo
                      </span>
                    </>
                  }
                  valueClass="text-[#16a34a]"
                  details={data.map((item) => ({ label: item.block, value: format(item.applied) }))}
                />
                <Metric
                  label="Pendientes"
                  value={
                    <>
                      <span className="block-detail-metric-value text-[20px] font-medium leading-none">
                        {format(totals.pending)}
                      </span>
                      <span className="block-detail-metric-percent ml-1 text-[12px] font-medium leading-none text-gray-600">
                        - {Math.max(100 - percentage, 0)}% del universo
                      </span>
                    </>
                  }
                  valueClass="text-[#ed3030]"
                  details={data.map((item) => ({ label: item.block, value: format(item.pending) }))}
                />
              </div>
              <ChartCard data={data} />
            </>
          ) : (
            <EmptyDetailState mode={mode} />
          )}
        </div>

        <footer className="flex h-[42px] items-center justify-between border-t bg-[#fbfcfd] px-4">
          <p className="text-[5px] text-[#8294a6]">
            Valores registrados para el periodo seleccionado.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="h-6 rounded border bg-white px-3 text-[6px] text-[#394f63]"
          >
            Cerrar detalle
          </button>
        </footer>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  subtitle,
  valueClass = "text-[#2f455a]",
  details,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  valueClass?: string;
  details?: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="min-h-[65px] rounded-md border border-[#dce3ea] p-3">
      <p className="text-[5.5px] font-semibold uppercase text-[#8193a5]">{label}</p>
      <p className={`mt-2 text-[28px] font-medium leading-none ${valueClass}`}>{value}</p>
      {subtitle ? <p className="mt-2 text-[5px] text-[#8193a5]">{subtitle}</p> : null}
      {details && details.length > 0 ? (
        <div className="mt-3 flex flex-row flex-wrap gap-2 text-[5.5px]">
          {details.map((item) => (
            <div
              key={`${label}-${item.label}`}
              className="flex w-[calc(50%-4px)] min-w-0 items-center justify-between gap-2 rounded bg-[#f7fafd] px-2 py-1"
            >
              <span className="block truncate uppercase tracking-[0.04em] text-[#74879a]">{item.label}</span>
              <strong className="block text-[11px] font-semibold text-[#22384c]">
                {item.value}
              </strong>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative flex h-full items-center whitespace-nowrap px-3 text-[6px] font-medium transition-colors sm:px-4 ${
        active ? "text-[#17324a]" : "text-[#8a9daf] hover:text-[#17324a]"
      }`}
    >
      {children}
      {active ? <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#59b8f8]" /> : null}
    </button>
  );
}

function EmptyDetailState({ mode }: { mode: DetailMode }) {
  return (
    <div className="rounded-lg border border-dashed border-[#cbd6e0] bg-[#fbfcfd] px-5 py-10 text-center">
      <p className="text-[10px] font-semibold text-[#526a80]">Sin detalle por bloque</p>
      <p className="mt-2 text-[8px] text-[#8b9daf]">
        No hay registros cargados para{" "}
        {mode === "centros" ? "centros escolares" : "matricula"} en el periodo seleccionado.
      </p>
    </div>
  );
}

function ChartCard({ data }: { data: BlockItem[] }) {
  const chartData = data.map((item) => ({
    block: item.block,
    applied: item.applied,
    pending: item.pending,
  }));

  return (
    <section className="mt-3.5 rounded-lg border border-[#dce3ea] bg-white p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-[8px] font-semibold text-[#334c61]">Aplicacion por bloque</h3>
          <p className="mt-1 text-[5.5px] text-[#8ea0b1]">
            Aplicados y pendientes respecto al universo
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-[5.5px]">
          <LegendDot color="#16a34a" label="Aplicados" />
          <LegendDot color="#ef5b5b" label="Pendientes" />
        </div>
      </div>

      <div className="mt-4 h-[260px]">
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            barGap={1}
            barCategoryGap="0%"
            margin={{ top: 24, right: 2, bottom: 2, left: -18 }}
            barSize={32}
          >
            <CartesianGrid vertical={false} stroke="#edf2f7" />
            <XAxis
              dataKey="block"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#6f8294", fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={40}
              tickFormatter={formatShort}
              tick={{ fill: "#6f8294", fontSize: 10 }}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="applied" fill="#16a34a" radius={[4, 4, 0, 0]}>
              <LabelList content={(props) => <BarValueLabel {...props} fill="#16a34a" />} />
            </Bar>
            <Bar dataKey="pending" fill="#ef5b5b" radius={[4, 4, 0, 0]}>
              <LabelList content={(props) => <BarValueLabel {...props} fill="#ef5b5b" />} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[#5f886b]">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <i className="not-italic">{label}</i>
    </span>
  );
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const applied = payload.find((entry) => entry.dataKey === "applied")?.value;
  const pending = payload.find((entry) => entry.dataKey === "pending")?.value;

  return (
    <div className="rounded-md border border-[#dce3ea] bg-white px-3 py-2 text-[10px] shadow-[0_10px_24px_rgba(15,35,55,.12)]">
      <p className="font-semibold text-[#2f455a]">{label}</p>
      <div className="mt-2 space-y-1">
        <p className="flex items-center justify-between gap-4">
          <span className="text-[#5f7488]">Aplicados</span>
          <strong className="text-[#16a34a]">{formatLabelValue(applied)}</strong>
        </p>
        <p className="flex items-center justify-between gap-4">
          <span className="text-[#5f7488]">Pendientes</span>
          <strong className="text-[#ef5b5b]">{formatLabelValue(pending)}</strong>
        </p>
      </div>
    </div>
  );
}

function BarValueLabel({
  x,
  y,
  width,
  value,
  fill,
}: {
  x?: number;
  y?: number;
  width?: number;
  value?: string | number;
  fill: string;
}) {
  if (typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || value == null) {
    return null;
  }

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill={fill}
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {formatShort(Number(value))}
    </text>
  );
}

function format(value: number) {
  return new Intl.NumberFormat("es-SV").format(value);
}

function formatShort(value: number) {
  return new Intl.NumberFormat("es-SV", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatLabelValue(value: unknown) {
  return typeof value === "number" ? format(value) : "-";
}

function getBlockRangeTitle(data: BlockItem[]) {
  if (data.length === 0) return "Distribucion de aplicacion";

  const firstBlock = data[0]?.block;
  const lastBlock = data[data.length - 1]?.block;

  if (!firstBlock) return "Distribucion de aplicacion";
  if (!lastBlock || lastBlock === firstBlock) return `Distribucion de aplicacion ${firstBlock}`;

  return `Distribucion de aplicacion ${firstBlock}-${lastBlock}`;
}
