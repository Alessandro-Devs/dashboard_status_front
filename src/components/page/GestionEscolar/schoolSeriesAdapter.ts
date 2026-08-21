export type PlatformSeriesPoint = {
  day: string;
  value: number;
};

export type PlatformSeriesPayload = {
  ihfb: PlatformSeriesPoint[];
  kira: PlatformSeriesPoint[];
};

export type PlatformDayRow = {
  day: string;
  ihfb?: number;
  kira?: number;
};

export const schoolPlatformSeries: PlatformSeriesPayload = {
  ihfb: [
    { day: "2026-08-12", value: 1146 },
    { day: "2026-08-13", value: 1109 },
    { day: "2026-08-14", value: 1446 },
    { day: "2026-08-17", value: 1648 },
    { day: "2026-08-18", value: 1580 },
  ],
  kira: [
    { day: "2026-08-12", value: 1880 },
    { day: "2026-08-13", value: 2187 },
    { day: "2026-08-14", value: 2823 },
    { day: "2026-08-17", value: 2118 },
    { day: "2026-08-18", value: 2064 },
  ],
};

export function adaptSchoolPlatformSeries(source: PlatformSeriesPayload): PlatformDayRow[] {
  const rows = new Map<string, PlatformDayRow>();

  for (const platform of ["ihfb", "kira"] as const) {
    for (const point of source[platform]) {
      const row = rows.get(point.day) ?? { day: point.day };
      row[platform] = point.value;
      rows.set(point.day, row);
    }
  }

  return Array.from(rows.values()).sort((left, right) => left.day.localeCompare(right.day));
}

export const adaptedSchoolPlatformSeries = adaptSchoolPlatformSeries(schoolPlatformSeries);
