const metric = (universo = "", aplicados = "", pendientes = "", porcentaje: number | null = null) => ({ universo, aplicados, pendientes, porcentaje });
const block = (bloque: string, universo: number | null = null, aplicados: number | null = null, pendientes: number | null = null, porcentaje: number | null = null) => ({ bloque, universo, aplicados, pendientes, porcentaje });
const distribution = (bloque: string) => ({ bloque, universo: 0, nivel1data: 0, nivel2data: 0, nivel3data: 0, nivel4data: 0, nivel5data: 0, nivel1percent: 0, nivel2percent: 0, nivel3percent: 0, nivel4percent: 0, nivel5percent: 0 });
const monthlyBlock = (bloque = "B1") => ({ bloque, materia: "Matemática", subgrupo: "", universo: 0, promedioMatematica: 0, promedioLengua: 0, nivel1data: 0, nivel1percent: 0, nivel2data: 0, nivel2percent: 0, nivel3data: 0, nivel3percent: 0, nivel4data: 0, nivel4percent: 0, nivel5data: 0, nivel5percent: 0 });
const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

export const evaluationTemplate = {
  pruebas: {
    cml: { titulo: "CML", matricula: metric(), centrosEscolares: metric() },
    progreso: { titulo: "Progreso", matricula: metric(), centrosEscolares: metric() },
    fundamentos: { titulo: "Fundamentos", matricula: metric(), centrosEscolares: metric() },
  },
  detallePorBloque: {
    cml: { matricula: [block("B1"), block("B2")], centrosEscolares: [block("B1"), block("B2")] },
    progreso: { matricula: [block("B1"), block("B2")], centrosEscolares: [block("B1"), block("B2")] },
    fundamentos: { matricula: [block("B1"), block("B2")], centrosEscolares: [block("B1"), block("B2")] },
  },
  nivelesDesempeno: [{ nivel: 1, rango: "0-35", nombre: "Crítico" }, { nivel: 2, rango: "36-45", nombre: "Bajo" }, { nivel: 3, rango: "46-55", nombre: "Medio" }, { nivel: 4, rango: "56-65", nombre: "Bueno" }, { nivel: 5, rango: "66-100", nombre: "Excelente" }],
  distribucionPorBloqueMateriaNiveles: { lengua: ["B3", "B4", "B5", "Control"].map(distribution), matematica: ["B3", "B4", "B5", "Control"].map(distribution) },
  resultadosPorMes: Object.fromEntries(months.map((month) => [month, [monthlyBlock()]])),
};

// Secciones que forman parte del contrato JSON de Evaluación, aunque no se
// capturan en este formulario administrativo.
export const evaluationHiddenDefaults = {
  vistaResultados: {
    materiasDisponibles: ["Lengua", "Matemática"],
    composicionDelUniverso: {},
    trayectoriaDeResultados: { etapas: [], resumenPorNivel: [], lecturaPrincipal: "", descripcionLectura: "", nivelesDeDesempeno: [], distribucionPorcentualDeLosFlujos: {} },
    materiaSeleccionadaPorDefecto: "Matemática",
  },
  sankeysSeparados: {},
  comparativasPorMateria: {
    lengua: { estatus: "Medio", promedio: 49.96, porcentajesJulio: [], porcentajesJunio: [], variacionRespectoJunio: null },
    matematica: { estatus: "Medio", promedio: 50.11, porcentajesJulio: [], porcentajesJunio: [], variacionRespectoJunio: null },
  },
  seguimientoAplicacionCml: { barrera: "", etiqueta: "", programados: "", aplicaciones: [] },
  actualizacionPortalResultados: { barrera: "", entrada: "", etiqueta: "", incidencias: "" },
};
