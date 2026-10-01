// Avance de producción de las plataformas Kira y xAI (módulo Aprendizaje).
// Se guarda en `aprendizaje.avanceProduccion`; lo usan el dashboard y el formulario del panel.

export type ProductionComponent = { nombre: string; clasesProducidas: number | null; clasesTotales: number | null };
export type ProductionType = { letra: string; descripcion: string; componentes: ProductionComponent[] };
export type XaiSubject = { nombre: string; detalle: string; activa: boolean };
export type AvanceProduccion = {
  kira: { tipos: ProductionType[] };
  xai: { estado: string; alcance: string; materias: XaiSubject[] };
};

// Colores por posición del tipo (A, B, C…); si hay más tipos se repite la paleta.
export const TYPE_PALETTE = [
  { accent: "#059c80", tint: "#e6f6f2" },
  { accent: "#187ec7", tint: "#e8f3ff" },
  { accent: "#f26a0a", tint: "#fff1e6" },
  { accent: "#7544f4", tint: "#f2ecff" },
  { accent: "#c2417a", tint: "#fbe9f1" },
];
export const typeColors = (index: number) => TYPE_PALETTE[index % TYPE_PALETTE.length];

export const emptyAvanceProduccion = (): AvanceProduccion => ({ kira: { tipos: [] }, xai: { estado: "", alcance: "", materias: [] } });
// Estructura inicial del formulario: campos vacíos para que solo se vean los placeholders.
export const blankAvanceProduccion = (): AvanceProduccion => ({
  kira: { tipos: [{ letra: "", descripcion: "", componentes: [{ nombre: "", clasesProducidas: null, clasesTotales: null }] }] },
  xai: { estado: "", alcance: "", materias: [{ nombre: "", detalle: "", activa: true }] },
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown) => (typeof value === "string" ? value : "");
const toNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
};

// Acepta cualquier JSON guardado y devuelve una estructura completa y segura.
export function normalizeAvanceProduccion(value: unknown): AvanceProduccion {
  const source = isRecord(value) ? value : {};
  const kira = isRecord(source.kira) ? source.kira : {};
  const xai = isRecord(source.xai) ? source.xai : {};
  return {
    kira: {
      tipos: (Array.isArray(kira.tipos) ? kira.tipos : []).filter(isRecord).map((type) => ({
        letra: text(type.letra),
        descripcion: text(type.descripcion),
        componentes: (Array.isArray(type.componentes) ? type.componentes : []).filter(isRecord).map((item) => ({
          nombre: text(item.nombre),
          clasesProducidas: toNumber(item.clasesProducidas),
          clasesTotales: toNumber(item.clasesTotales),
        })),
      })),
    },
    xai: {
      estado: text(xai.estado),
      alcance: text(xai.alcance),
      materias: (Array.isArray(xai.materias) ? xai.materias : []).filter(isRecord).map((item) => ({
        nombre: text(item.nombre),
        detalle: text(item.detalle),
        activa: item.activa !== false,
      })),
    },
  };
}

// Solo cuentan los tipos y componentes con nombre; así una fila vacía no se muestra.
export const visibleKiraTypes = (data: AvanceProduccion) =>
  data.kira.tipos
    .map((type, index) => ({ ...type, index, componentes: type.componentes.filter((item) => item.nombre.trim() !== "") }))
    .filter((type) => type.letra.trim() !== "" && type.componentes.length > 0);
export const visibleXaiSubjects = (data: AvanceProduccion) => data.xai.materias.filter((item) => item.nombre.trim() !== "");
export const hasKiraData = (data: AvanceProduccion) => visibleKiraTypes(data).length > 0;
export const hasXaiData = (data: AvanceProduccion) => data.xai.estado.trim() !== "" || visibleXaiSubjects(data).length > 0;
export const hasAvanceProduccion = (data: AvanceProduccion) => hasKiraData(data) || hasXaiData(data);

export const componentPercent = (item: ProductionComponent) => {
  const done = item.clasesProducidas ?? 0;
  const total = item.clasesTotales ?? 0;
  return total > 0 ? Math.min(100, Math.floor((done / total) * 100)) : 0;
};
