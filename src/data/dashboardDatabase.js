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
      progreso: { titulo: "", centrosEscolares: { aplicados: "", pendientes: "", universo: "", porcentaje: null }, matricula: { aplicados: "", pendientes: "", universo: "", porcentaje: null } },
    },
    seguimientoAplicacionCml: {
      etiqueta: "Aplicación CML",
      programados: "Programados 55 centros (No aplicación y baja participación)",
      aplicaciones: ["Aplicación en 31 centros 12 de agosto, 1 pendiente por finalizar. 14 CE aplicación con Starlink", "24 centros en aplicación 13 de agosto. 10 CE aplicación con Starlink"],
      barrera: "El contrato con SOTE se ha vencido, aplicaciones están por fuera de contrato",
    },
    detallePorBloque: {
      centrosEscolares: [],
      matricula: [],
    },
    actualizacionPortalResultados: { etiqueta:"Actualización del portal",entrada:"Entrada en funcionamiento del portal 10 de agosto",incidencias:"43 reportes de incidencias de ingreso o falta de datos, hasta el 13 de agosto",barrera:"Para fase 1 solo se contempló ingreso a directores y docentes, no hay acceso para usuarios administradores; esto se dará en fase 2 de desarrollo" },
    comparativasPorMateria: {
      lengua: { promedio:49.7,variacionRespectoJunio:-2.9,porcentajesJunio:[18,19.1,19.3,20.1,23.5],porcentajesJulio:[23.7,21.5,17.6,18.6,18.6] },
      matematica: { promedio:50,variacionRespectoJunio:-2.7,porcentajesJunio:[15.9,25.4,19,14.9,24.8],porcentajesJulio:[22,22.7,21.4,15.1,18.8] },
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
    tutoriaVirtual: [],
  },
};

export default dashboardDatabase;
