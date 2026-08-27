export const dashboardDatabase = {
  metadata: {
    fechaCorte: "2026-08-19",
  },
  gestionCalidad: {
    kpis: {
      auditados: 0,
      universo: 0,
      cobertura: 0,
      cumplimiento: 0,
      hallazgos: 0,
      hallazgosMayor: 0,
      hallazgosMenor: 0,
      observaciones: 0,
      grupos: 0,
    },
    auditadosPorGrupo: [],
    coberturaPorGrupo: [
      { grupo: "G1A", ronda: 3, auditados: 47, total: 71, porcentaje: 66.2 },
      { grupo: "G1B", ronda: 1, auditados: 67, total: 113, porcentaje: 59.3 },
      { grupo: "G2", ronda: 5, auditados: 36, total: 196, porcentaje: 18.4 },
      { grupo: "G3", ronda: 1, auditados: 114, total: 199, porcentaje: 57 },
      { grupo: "G4", ronda: 1, auditados: 171, total: 201, porcentaje: 85 },
      { grupo: "G5", ronda: 1, auditados: 174, total: 200, porcentaje: 87 },
    ],
    cumplimientoPorGrupo: [],
    cumplimientoPorProceso: [],
    hallazgosCriticos: [],
  },
  gestionEscolar: {
    actividades: {
      periodo: "",
      observacion: [],
      formacion: [],
      horariosG12: [],
      horariosG345: [],
      accionesObservacion: [],
      accionesHorarios: [],
    },
    noAccesos: {
      historialDocentes: [],
      historialClases: [],
      resumen: [],
      evolucion: [],
      acciones: [],
      limitaciones: [],
    },
    kpis: [],
    asistenciaTarjetas: [],
    asistenciaDiaria: [],
    observacionesPorBloque: [],
    gestionOperativa: {
      formacion: {
        participantes: "0",
        secciones: "0",
        grupos: [],
      },
      observaciones: {
        resumen: {
          directoresActivos: "0",
          observacionesRealizadas: "0",
          retroalimentacionesRealizadas: "0",
        },
        bloques: [],
      },
    },
    centrosProyecto: [],
  },
  aprendizaje: {
    estadoLxp: [],
  },
  evaluacion: {
    pruebas: {
      cml: { titulo: "Prueba CML", centrosEscolares: { aplicados: "720", pendientes: "32", universo: "752", porcentaje: 95.7 }, matricula: { aplicados: "193,875", pendientes: "32,126", universo: "226,001", porcentaje: 85.8 } },
      progreso: { titulo: "Prueba Progreso", centrosEscolares: { aplicados: "574", pendientes: "180", universo: "", porcentaje: 76 }, matricula: { aplicados: "9,638", pendientes: "4,522", universo: "", porcentaje: 68 } },
    },
    seguimientoAplicacionCml: {
      etiqueta: "Aplicación CML",
      programados: "Programados 55 centros (No aplicación y baja participación)",
      aplicaciones: ["Aplicación en 31 centros 12 de agosto, 1 pendiente por finalizar. 14 CE aplicación con Starlink", "24 centros en aplicación 13 de agosto. 10 CE aplicación con Starlink"],
      barrera: "El contrato con SOTE se ha vencido, aplicaciones están por fuera de contrato",
    },
    detallePorBloque: {
      cml: {
        centrosEscolares: [],
        matricula: [],
      },
      progreso: {
        centrosEscolares: [],
        matricula: [],
      },
    },
    actualizacionPortalResultados: { etiqueta:"Actualización del portal",entrada:"Entrada en funcionamiento del portal 10 de agosto",incidencias:"43 reportes de incidencias de ingreso o falta de datos, hasta el 13 de agosto",barrera:"Para fase 1 solo se contempló ingreso a directores y docentes, no hay acceso para usuarios administradores; esto se dará en fase 2 de desarrollo" },
    comparativasPorMateria: {
      lengua: { promedio:49.7,variacionRespectoJunio:-2.9,porcentajesJunio:[18,19.1,19.3,20.1,23.5],porcentajesJulio:[23.7,21.5,17.6,18.6,18.6] },
      matematica: { promedio:50,variacionRespectoJunio:-2.7,porcentajesJunio:[15.9,25.4,19,14.9,24.8],porcentajesJulio:[22,22.7,21.4,15.1,18.8] },
    },
    distribucionPorBloqueMateriaNiveles: {
      lengua: [
        { bloque: "B3", nivel1: null, nivel2: 24.7, nivel3: 5.2, nivel4: 70.1, nivel5: null },
        { bloque: "B4", nivel1: 0.5, nivel2: 12.5, nivel3: 12.5, nivel4: 73.4, nivel5: 1 },
        { bloque: "B5", nivel1: null, nivel2: 16, nivel3: 14.4, nivel4: 69.6, nivel5: null },
        { bloque: "Control", nivel1: null, nivel2: 15.5, nivel3: 8.5, nivel4: 75.4, nivel5: null },
      ],
      matematica: [
        { bloque: "B3", nivel1: null, nivel2: 25.3, nivel3: 7.2, nivel4: 67, nivel5: 0.5 },
        { bloque: "B4", nivel1: null, nivel2: 17.2, nivel3: 12, nivel4: 69.8, nivel5: 1 },
        { bloque: "B5", nivel1: null, nivel2: 12.9, nivel3: 12.9, nivel4: 73.7, nivel5: 0.5 },
        { bloque: "Control", nivel1: null, nivel2: 25.4, nivel3: 11.3, nivel4: 62.7, nivel5: 0.7 },
      ],
    },
    // Configuración y datos de la vista "Avance · Resultados · Progreso".
    // Las etapas y los niveles pueden aumentarse o reducirse libremente.
    vistaResultados: {
      materiasDisponibles: [],
      materiaSeleccionadaPorDefecto: "",
      composicionDelUniverso: {},
      trayectoriaDeResultados: {
        nivelesDeDesempeno: [],
        resumenPorNivel: [],
        etapas: [],
        distribucionPorcentualDeLosFlujos: {},
        lecturaPrincipal: "",
        descripcionLectura: "",
      },
    },
    comparativasNiveles: {
      matematica: {
        promedio: 0,
        variacion: 0,
        junio: [],
        julio: [],
      },
      lengua: {
        promedio: 0,
        variacion: 0,
        junio: [],
        julio: [],
      },
    },
    portalResultados: {
      etiqueta: "",
      entrada: "",
      incidencias: "",
      barrera: "",
    },
    aplicacionCml: {
      etiqueta: "",
      programados: "",
      aplicaciones: [],
      barrera: "",
    },
    datosAnterioresPruebas: {
      cml: {
        title: "",
        schoolPercentage: 0,
        schoolUniverse: "0",
        schoolApplied: "0",
        schoolPending: "0",
        enrollmentPercentage: 0,
        enrollmentUniverse: "0",
        enrollmentApplied: "0",
        enrollmentPending: "0",
      },
      progreso: {
        title: "",
        schoolPercentage: 0,
        schoolApplied: "0",
        schoolPending: "0",
        enrollmentPercentage: 0,
        enrollmentApplied: "0",
        enrollmentPending: "0",
      },
    },
    bloquesCentros: [],
    bloquesMatricula: [],
    composicionUniverso: {
      lengua: {
        total: [],
        grupos: {},
      },
      matematica: {
        total: [],
        grupos: {},
      },
    },
    trayectoria: [],
  },
  tutoriaFormacion: {
    accesos: {
      centros: "0",
      docentes: "0",
      docentesConAcceso: "0",
      porcentajeDocentes: 0,
      estudiantes: "0",
      estudiantesConAcceso: "0",
      porcentajeEstudiantes: 0,
    },
    modelamientos: {
      totalDocentes: "0",
      claseRegularRemediacion: {
        totalEsperados: "0",
        realizados: "0",
        porcentaje: 0,
      },
      soloClaseRegular: {
        totalDocentes: "0",
        realizados: "0",
        porcentaje: 0,
      },
      soloRemediacion: {
        totalDocentes: "0",
        realizados: "0",
        porcentaje: 0,
      },
      meta: {
        total: "0",
        realizados: "0",
        porcentaje: 0,
      },
    },
    diagnosticos: {
      docentesDiagnosticados: "0",
      totalDocentes: "0",
      porcentaje: 0,
    },
    acompanamientos: {
      realizados: "0",
      estado: "En seguimiento",
    },
    tutoriaVirtual: [],
  },
};

export default dashboardDatabase;
