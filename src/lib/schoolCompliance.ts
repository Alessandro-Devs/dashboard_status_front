// Cumplimiento por centro educativo (Gestión de Calidad). Se guarda en gestionCalidad.cumplimientoPorCentro
// como [{ codigo, nombre, cumplimiento }]. Puede tener más de 2,000 centros, así que se captura pegando
// desde Excel o importando un CSV en lugar de escribir fila por fila.

export type SchoolCompliance = { codigo: string; nombre: string; cumplimiento: number };

const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object" && !Array.isArray(value);
const toPercent = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const text = value.trim().replace("%", "").trim();
  // Acepta 85.5 y 85,5 (coma decimal).
  const parsed = Number(/^\d+,\d+$/.test(text) ? text.replace(",", ".") : text.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

export function readSchoolCompliance(value: unknown): SchoolCompliance[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isObject(item)) return [];
    const codigo = String(item.codigo ?? "").trim();
    const nombre = String(item.nombre ?? "").trim();
    const cumplimiento = toPercent(item.cumplimiento);
    if (!codigo && !nombre) return [];
    if (cumplimiento === null) return [];
    return [{ codigo, nombre, cumplimiento: Math.min(100, Math.max(0, Math.round(cumplimiento * 10) / 10)) }];
  });
}

// Separa una línea de CSV respetando comillas.
function splitCsvLine(line: string, separator: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (quoted && line[index + 1] === '"') { current += '"'; index += 1; } else quoted = !quoted;
    } else if (char === separator && !quoted) { cells.push(current); current = ""; } else current += char;
  }
  cells.push(current);
  return cells.map((item) => item.trim());
}

export type ParseResult = { rows: SchoolCompliance[]; skipped: number };

// Convierte texto pegado desde Excel (tabulaciones) o un CSV (coma o punto y coma) en filas.
// Columnas esperadas: Código, Nombre, Cumplimiento. Si la primera fila es un encabezado, se omite.
export function parseSchoolCompliance(text: string): ParseResult {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!lines.length) return { rows: [], skipped: 0 };
  const sample = lines[0];
  const separator = sample.includes("\t") ? "\t" : sample.split(";").length > sample.split(",").length ? ";" : ",";
  const rows: SchoolCompliance[] = [];
  let skipped = 0;
  lines.forEach((line, index) => {
    const [codigo = "", nombre = "", cumplimiento = ""] = splitCsvLine(line, separator);
    const percent = toPercent(cumplimiento);
    if (percent === null || (!codigo && !nombre)) {
      if (index > 0) skipped += 1; // la primera fila sin número es el encabezado
      return;
    }
    rows.push({ codigo, nombre, cumplimiento: percent });
  });
  // Si todo viene entre 0 y 1, Excel lo copió como fracción (0.85 = 85%).
  const asFraction = rows.length > 0 && rows.every((row) => row.cumplimiento <= 1) && rows.some((row) => row.cumplimiento > 0);
  return { rows: rows.map((row) => ({ ...row, cumplimiento: Math.min(100, Math.max(0, Math.round((asFraction ? row.cumplimiento * 100 : row.cumplimiento) * 10) / 10)) })), skipped };
}
