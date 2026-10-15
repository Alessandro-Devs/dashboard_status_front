// Cumplimiento por centro educativo (Gestión de Calidad). Se guarda en gestionCalidad.cumplimientoPorCentro
// como [{ codigo, nombre, grupo, cumplimiento }]. Puede tener más de 2,000 centros, así que se captura pegando
// desde Excel o importando un CSV en lugar de escribir fila por fila.

export type SchoolCompliance = { codigo: string; nombre: string; grupo: string; cumplimiento: number };

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
    const grupo = String(item.grupo ?? "").trim();
    const cumplimiento = toPercent(item.cumplimiento);
    if (!codigo && !nombre) return [];
    if (cumplimiento === null) return [];
    return [{ codigo, nombre, grupo, cumplimiento: Math.min(100, Math.max(0, Math.round(cumplimiento * 10) / 10)) }];
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
// Columnas: Código, Nombre, Grupo, Cumplimiento. Si la primera fila es un encabezado, las columnas se
// reconocen por su nombre (en cualquier orden); sin encabezado se usa ese orden. Con solo tres columnas
// se toman como Código, Nombre y Cumplimiento (sin grupo).
const headerKey = (cell: string) => {
  const text = cell.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  if (/cumpl|porcent|%/.test(text)) return "cumplimiento";
  if (/grupo/.test(text)) return "grupo";
  if (/cod/.test(text)) return "codigo";
  if (/nombre|centro|escuela|institucion/.test(text)) return "nombre";
  return null;
};

export function parseSchoolCompliance(text: string): ParseResult {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim() !== "");
  if (!lines.length) return { rows: [], skipped: 0 };
  const sample = lines[0];
  const separator = sample.includes("\t") ? "\t" : sample.split(";").length > sample.split(",").length ? ";" : ",";
  const first = splitCsvLine(lines[0], separator);
  const isHeader = first.every((cell) => toPercent(cell) === null) && first.some((cell) => headerKey(cell) !== null);
  const width = first.length;
  const positions: Record<"codigo" | "nombre" | "grupo" | "cumplimiento", number> = width >= 4 ? { codigo: 0, nombre: 1, grupo: 2, cumplimiento: 3 } : { codigo: 0, nombre: 1, grupo: -1, cumplimiento: 2 };
  if (isHeader) {
    const found: Partial<typeof positions> = {};
    first.forEach((cell, index) => { const key = headerKey(cell); if (key && found[key] === undefined) found[key] = index; });
    if (found.cumplimiento !== undefined) Object.assign(positions, { grupo: -1 }, found);
  }
  const rows: SchoolCompliance[] = [];
  let skipped = 0;
  lines.forEach((line, index) => {
    if (index === 0 && isHeader) return;
    const cells = splitCsvLine(line, separator);
    const pick = (position: number) => (position >= 0 ? cells[position] ?? "" : "").trim();
    const codigo = pick(positions.codigo);
    const nombre = pick(positions.nombre);
    const percent = toPercent(pick(positions.cumplimiento));
    if (percent === null || (!codigo && !nombre)) {
      skipped += 1;
      return;
    }
    rows.push({ codigo, nombre, grupo: pick(positions.grupo), cumplimiento: percent });
  });
  // Si todo viene entre 0 y 1, Excel lo copió como fracción (0.85 = 85%).
  const asFraction = rows.length > 0 && rows.every((row) => row.cumplimiento <= 1) && rows.some((row) => row.cumplimiento > 0);
  return { rows: rows.map((row) => ({ ...row, cumplimiento: Math.min(100, Math.max(0, Math.round((asFraction ? row.cumplimiento * 100 : row.cumplimiento) * 10) / 10)) })), skipped };
}
