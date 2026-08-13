/**
 * BASE DE DATOS LOCAL DEL DASHBOARD
 *
 * Edita únicamente este archivo para actualizar la información quemada.
 * Los datos están agrupados por módulo y son consumidos por las vistas.
 */

export const dashboardDatabase = {
  metadata: {
    // Fecha de corte general para todos los datos locales (formato YYYY-MM-DD).
    fechaCorte: "2026-08-13",
  },
gestionCalidad: {
  kpis: {
    auditados: 187,
    universo: 982,
    cobertura: 19,
    cumplimiento: 77.3,
    hallazgos: 23,
    hallazgosMayor: 9,
    hallazgosMenor: 5,
    observaciones: 9,
    grupos: 6,
  },

  // Centros escolares auditados por grupo
  auditadosPorGrupo: [
    {
      name: "G1 F3",
      auditados: 18,
      total: 67,
    },
    {
      name: "G1 F2",
      auditados: 18,
      total: 118,
    },
    {
      name: "G2 F2",
      auditados: 16,
      total: 197,
    },
    {
      name: "G3 F1",
      auditados: 27,
      total: 200,
    },
    {
      name: "G4 F1",
      auditados: 52,
      total: 200,
    },
    {
      name: "G5 F1",
      auditados: 56,
      total: 200,
    },
  ],

  // Cumplimiento global por grupo
  cumplimientoPorGrupo: [
    {
      name: "G1 F3",
      value: 88.5,
    },
    {
      name: "G1 F2",
      value: 83.2,
    },
    {
      name: "G2 F2",
      value: 83.4,
    },
    {
      name: "G3 F1",
      value: 76.7,
    },
    {
      name: "G4 F1",
      value: 73.8,
    },
    {
      name: "G5 F1",
      value: 73.5,
    },
  ],

  // Cumplimiento promedio por proceso
  cumplimientoPorProceso: [
    {
      name: "Mesa técnica gestión escolar",
      value: 95.5,
    },
    {
      name: "Autonomía y sostenibilidad Director",
      value: 92,
    },
    {
      name: "Asistencia a Tutoría Virtual",
      value: 92,
    },
    {
      name: "Optimización Pedagógica y Administrativa",
      value: 91.5,
    },
    {
      name: "Conectividad",
      value: 91,
    },
    {
      name: "Modelación",
      value: 88.6,
    },
    {
      name: "Observaciones Director a Docentes",
      value: 85,
    },
    {
      name: "Acceso a internet",
      value: 81.2,
    },
    {
      name: "Refuerzo",
      value: 81,
    },
    {
      name: "Clase Regular",
      value: 78.3,
    },
    {
      name: "Dispositivos y acceso al LXP",
      value: 75.5,
    },
    {
      name: "Remediación",
      value: 67.1,
    },
    {
      name: "Infraestructura",
      value: 58.6,
    },
  ],

  // Diagnóstico de hallazgos más críticos
  hallazgosCriticos: [
    {
      title: "Tasa de finalización debajo del 80%",
      process: "Clase Regular",
      description:
        "44 de 91 clases observadas no alcanzaron la tasa mínima de finalización/avance del 80% definida por el proyecto.",
      impact: 48,
    },
    {
      title: "Condiciones de infraestructura",
      process: "Infraestructura",
      description:
        "68 de 181 CE presentan condiciones de infraestructura que representan un riesgo real o potencial para la continuidad de las clases.",
      impact: 38,
    },
    {
      title: "Deficiencia en señal de internet",
      process: "Conectividad",
      description:
        "51 de 169 CE presentan señal de internet deficiente, limitando el acceso estable a la plataforma LXP.",
      impact: 30,
    },
  ],
},
  gestionEscolar: {
    kpis: [
      {title:"Matrícula",value:"38,240",description:"Estudiantes registrados",style:"blue"},
      {title:"Docentes",value:"1824",description:"Docentes registrados",style:"purple"},
      {title:"Centros escolares",value:"870",description:"Centros con matrícula",style:"green"},
      {title:"Docentes sin acceso",value:"37",description:"Docentes únicos sin acceso",style:"orange"},
    ],
    asistenciaTarjetas: [["Estudiantes - KIRA","88%","19,518 de 22,179 estudiantes","blue"],["Estudiantes - IHFB","92%","14,776 de 16,061 estudiantes","purple"],["Docentes - KIRA","93%","984 de 1058 docentes","blue"],["Docentes - IHFB","95%","728 de 766 docentes","purple"]],
    asistenciaDiaria: [{day:"Lun",kira:86,ihfb:86},{day:"Mar",kira:89,ihfb:89},{day:"Mié",kira:87,ihfb:87},{day:"Jue",kira:91,ihfb:91},{day:"Vie",kira:88,ihfb:88}],
    observacionesPorBloque: [{block:"B1",value:174},{block:"B2",value:171},{block:"B3",value:176},{block:"B4",value:168},{block:"B5",value:170}],
    formacionPorBloque: [{block:"B1",value:405},{block:"B2",value:393},{block:"B3",value:424},{block:"B4",value:379},{block:"B5",value:396}],
    centrosProyecto: [["B1","Fase 1","Activo",120],["B1","Fase 2","Activo",48],["B1","Fase 2","Pausa",4],["B1","Fase 2","Sustituto",6],["B2","Fase 1","Activo",108],["B2","Fase 2","Activo",57],["B2","Fase 2","Pausa",5],["B2","Fase 2","Sustituto",7],["B3","Fase 1","Activo",92],["B3","Fase 2","Activo",79],["B3","Fase 2","Pausa",4],["B3","Fase 2","Sustituto",5],["B4","Fase 1","Activo",85],["B4","Fase 2","Activo",78],["B4","Fase 2","Pausa",6],["B4","Fase 2","Sustituto",7],["B5","Fase 1","Activo",74],["B5","Fase 3","Activo",92],["B5","Fase 3","Pausa",5],["B5","Fase 3","Sustituto",6]],
    gestionOperativa: { directoresActivos:"859",observaciones:"803",realimentaciones:"745",ticketsSinAcceso:"99",ticketsN2:"36",directoresFormados:"1997",bloques:"5" },
  },
  aprendizaje: {
    estadoLxp: [
      {id:"ihfb",name:"IHFB",accent:"blue",estatus:{trimestre:3,estado:"En producción y publicación",hastaClase:139,descripcion:"Trimestre 3 en producción y publicación hasta clase 139."},pendiente:{title:"Completar producción",description:"Completar producción, revisión y publicación del T3 completo."},barrera:{title:"Tiempos de revisión",description:"Los tiempos de revisión se traslapan con otros flujos de contenido."}},
      {id:"kira",name:"Kira",accent:"green",estatus:{trimestrePublicado:2,trimestreEnProceso:3,hastaClase:120,descripcion:"Trimestre 2 publicado; Trimestre 3 en proceso hasta clase 120."},pendiente:{title:"Avanzar producción",description:"Avanzar producción y publicación del T3 completo."},barrera:{title:"Equipo compartido",description:"Equipo compartido con xAI, lo que limita la capacidad de producción simultánea."}},
      {id:"xai",name:"xAI",accent:"purple",estatus:{trimestre:2,estado:"En desarrollo",hastaClase:70,descripcion:"Trimestre 2 en desarrollo; hasta clase 70."},pendiente:{title:"Retomar desarrollo",description:"Retomar y completar el desarrollo del Ciclo 1."},barrera:{title:"Alto tiempo de producción",description:"Alto tiempo de producción por clase y necesidad de optimizar el flujo de creación de contenido.",tiempoPorClase:{minHoras:15,maxHoras:18,descripcion:"Sigue tomando entre 15 y 18 horas crear 1 clase."}}},
    ],
  },
  evaluacion: {
    pruebas: {
        cml: {
          title: "Prueba CML",

          // Cobertura del operativo
          schoolPercentage: 95.7,
          schoolUniverse: "752",
          schoolApplied: "720",
          schoolPending: "32",

          // Participación global del operativo
          enrollmentPercentage: 85.8,
          enrollmentUniverse: "226,001",
          enrollmentApplied: "193,875",
          enrollmentPending: "32,126",
        },
      progreso:{title:"Prueba Progreso",schoolPercentage:76,schoolApplied:"574",schoolPending:"180",enrollmentPercentage:68,enrollmentApplied:"9638",enrollmentPending:"4522"},
    },
    bloquesCentros: [{block:"B1",universe:150,applied:136,pending:14,percentage:91},{block:"B2",universe:160,applied:139,pending:21,percentage:87},{block:"B3",universe:150,applied:127,pending:23,percentage:85},{block:"B4",universe:144,applied:111,pending:33,percentage:77},{block:"B5",universe:150,applied:99,pending:51,percentage:66}],
    bloquesMatricula: [{block:"B1",universe:2840,applied:2450,pending:390,percentage:86},{block:"B2",universe:2960,applied:2398,pending:562,percentage:81},{block:"B3",universe:2810,applied:2179,pending:631,percentage:78},{block:"B4",universe:2740,applied:1985,pending:755,percentage:72},{block:"B5",universe:2810,applied:1830,pending:980,percentage:65}],
    composicionUniverso: {
      lengua: {
        total: [{title:"Se mantienen",value:272,percentage:73.1,type:"neutral"},{title:"Mejoran / suben",value:61,percentage:16.4,type:"positive"},{title:"Bajan",value:39,percentage:10.5,type:"negative"}],
        grupos: {
          B2_Rezago: [{title:"Se mantienen",value:43,percentage:67.2,type:"neutral"},{title:"Mejoran / suben",value:17,percentage:26.6,type:"positive"},{title:"Bajan",value:4,percentage:6.3,type:"negative"}],
          B2: [{title:"Se mantienen",value:86,percentage:70.5,type:"neutral"},{title:"Mejoran / suben",value:20,percentage:16.4,type:"positive"},{title:"Bajan",value:16,percentage:13.1,type:"negative"}],
          B1: [{title:"Se mantienen",value:143,percentage:76.9,type:"neutral"},{title:"Mejoran / suben",value:24,percentage:12.9,type:"positive"},{title:"Bajan",value:19,percentage:10.2,type:"negative"}],
        },
      },
      matematica: {
        total: [{title:"Se mantienen",value:267,percentage:71.8,type:"neutral"},{title:"Mejoran / suben",value:82,percentage:22,type:"positive"},{title:"Bajan",value:23,percentage:6.2,type:"negative"}],
        grupos: {
          B2_Rezago: [{title:"Se mantienen",value:39,percentage:60,type:"neutral"},{title:"Mejoran / suben",value:20,percentage:30.8,type:"positive"},{title:"Bajan",value:6,percentage:9.2,type:"negative"}],
          B2: [{title:"Se mantienen",value:75,percentage:62,type:"neutral"},{title:"Mejoran / suben",value:37,percentage:30.6,type:"positive"},{title:"Bajan",value:9,percentage:7.4,type:"negative"}],
          B1: [{title:"Se mantienen",value:153,percentage:82.3,type:"neutral"},{title:"Mejoran / suben",value:25,percentage:13.4,type:"positive"},{title:"Bajan",value:8,percentage:4.3,type:"negative"}],
        },
      },
    },
    trayectoria: [{label:"Excelente",value:126,percentage:"17%",color:"bg-[#16a34a]",text:"text-[#16a34a]"},{label:"Bueno",value:247,percentage:"33%",color:"bg-[#65a30d]",text:"text-[#65a30d]"},{label:"Medio",value:222,percentage:"29%",color:"bg-[#eab308]",text:"text-[#d69b00]"},{label:"Bajo",value:105,percentage:"14%",color:"bg-[#f97316]",text:"text-[#f97316]"},{label:"Crítico",value:54,percentage:"7%",color:"bg-[#ef4444]",text:"text-[#ef4444]"}],
  },
  tutoriaFormacion: {
  accesos: {
    centros: "600",
    docentes: "6,095",
    docentesConAcceso: "5,974",
    porcentajeDocentes: 98.0,
    estudiantes: "180,177",
    estudiantesConAcceso: "168,326",
    porcentajeEstudiantes: 93.0,
  },

  modelamientos: {
    totalDocentes: "6,095",

    claseRegularRemediacion: {
      totalEsperados: "7,468",
      realizados: "4,988",
      porcentaje: 66.8,
    },

    soloClaseRegular: {
      totalDocentes: "962",
      realizados: "842",
      porcentaje: 87.5,
    },

    soloRemediacion: {
      totalDocentes: "1,097",
      realizados: "880",
      porcentaje: 80.2,
    },

    meta: {
      total: "9,437",
      realizados: "6,710",
      porcentaje: 71.1,
    },
  },

  diagnosticos: {
    docentesDiagnosticados: "983",
    totalDocentes: "6,095",
    porcentaje: 16.1,
  },

  tutoriaVirtual: {
    bloques1y2: [
      {
        tipo: "Clase regular",
        bloque1: 1565,
        bloque2: 1205,
        total: 2770,
        cumplimiento: {
          bloque1: {
            realizados: 1565,
            universo: 1866,
            porcentaje: 84,
          },
          bloque2: {
            realizados: 1205,
            universo: 1488,
            porcentaje: 81,
          },
        },
      },
      {
        tipo: "Refuerzo",
        bloque1: 149,
        bloque2: 349,
        total: 498,
        cumplimiento: {
          realizados: 498,
          universo: 735,
          porcentaje: 67,
        },
      },
      {
        tipo: "Remediación",
        bloque1: 822,
        bloque2: 0,
        total: 822,
        cumplimiento: {
          realizados: 822,
          universo: 1134,
          porcentaje: 73,
        },
      },
    ],

    resumenBloques1y2: {
      bloque1: 1974,
      bloque2: 1547,
      total: 3521,
    },

    grupos345: [
      {
        tipo: "Clase regular",
        total: 4151,
        cumplimiento: {
          realizados: 4151,
          universo: 4719,
          porcentaje: 88,
        },
      },
      {
        tipo: "Remediación",
        total: 4028,
        cumplimiento: {
          realizados: 4028,
          universo: 4855,
          porcentaje: 83,
        },
      },
    ],

    resumenGrupos345: {
      total: 5201,
    },
  },
},
};

export default dashboardDatabase;
