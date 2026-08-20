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
    pruebas: {
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
