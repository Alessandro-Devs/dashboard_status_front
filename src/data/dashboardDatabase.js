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
    actividades: {
      periodo: "10/08/2026 — 12/08/2026",
      observacion: [
        {label:"Directores Activos",value:162,percentage:42.3},
        {label:"Observaciones Realizadas",value:467,percentage:24.4},
        {label:"Realimentaciones Realizadas",value:245,percentage:12.8},
      ],
      formacion: [
        {label:"Grupo 1",value:183,percentage:99.7},
        {label:"Grupo 2",value:196,percentage:100},
        {label:"Grupo 3",value:192,percentage:96.5},
        {label:"Grupo 4",value:198,percentage:98.5},
        {label:"Grupo 5",value:189,percentage:94.5},
      ],
      horariosG12: [{label:"CE Verificados/Aprobados",value:383,percentage:100}],
      horariosG345: [
        {label:"CE Verificados/Aprobados",value:555,percentage:92.5},
        {label:"Con observaciones",value:25,percentage:4.2},
        {label:"Casos especiales",value:5,percentage:0.8},
        {label:"No aplica",value:1,percentage:0.2},
        {label:"Nuevos centros escolares",value:14,percentage:2.3},
      ],
      accionesObservacion: [
        "Llamadas de monitoreo a directores de G1 y G2.",
        "Capacitación de Técnicos de Gestión Escolar en el uso del aplicativo de observación.",
        "Técnicos del SDP solucionan las incidencias del aplicativo de observación.",
      ],
      accionesHorarios: [
        "Videollamadas con el director para ajustar el horario escolar.",
        "Monitoreo diario por medio de WhatsApp.",
      ],
    },
    noAccesos: {
      historialDocentes: [
        {fecha:"2026-08-07",valor:1743},
        {fecha:"2026-08-10",valor:1102},
        {fecha:"2026-08-11",valor:1043},
      ],
      historialClases: [
        {fecha:"2026-08-07",valor:5044},
        {fecha:"2026-08-10",valor:2995},
        {fecha:"2026-08-11",valor:2915},
      ],
      resumen: [
        {title:"DOCENTES NO ACCESOS",value:"88",subtitle:"Docentes únicos",color:"orange",icon:"shield"},
        {title:"NÚMERO DE CLASES",value:"156",subtitle:"Clases asociadas a docentes sin acceso",color:"blue",icon:"clipboard"},
      ],
      evolucion: [
        {day:"Viernes 7",ihfb:1442,kira:3612},
        {day:"Lunes 10",ihfb:1084,kira:1911},
        {day:"Martes 11",ihfb:1062,kira:1853},
      ],
      acciones: [
        {title:"Campaña para Directores",description:"Comunicación y seguimiento dirigido a directores.",icon:"users"},
        {title:"Campaña para Docentes",description:"Contacto directo para promover y recuperar accesos.",icon:"headphones"},
        {title:"Llamadas a Directores",description:"Call Center y registro de incidencias en SDP.",icon:"phone"},
        {title:"Monitoreo diario del TGE",description:"Seguimiento diario del comportamiento de accesos.",icon:"check"},
        {title:"Formación para Directores",description:"Acompañamiento y orientación a equipos directivos.",icon:"users"},
      ],
      limitaciones: [
        "Centros escolares con internet no funcional o sin internet.",
        "Requerimiento de personal técnico en la coordinación.",
        "Rotación y movilidad de docentes en centros escolares.",
      ],
    },
    kpis: [
      {title:"Matrícula",value:"38,240",description:"Estudiantes registrados",style:"blue"},
      {title:"Docentes",value:"1824",description:"Docentes registrados",style:"purple"},
      {title:"Centros escolares",value:"870",description:"Centros con matrícula",style:"green"},
      {title:"Docentes sin acceso",value:"37",description:"Docentes únicos sin acceso",style:"orange"},
    ],
    asistenciaTarjetas: [["Estudiantes - KIRA","88%","19,518 de 22,179 estudiantes","blue"],["Estudiantes - IHFB","92%","14,776 de 16,061 estudiantes","purple"],["Docentes - KIRA","93%","984 de 1058 docentes","blue"],["Docentes - IHFB","95%","728 de 766 docentes","purple"]],
    asistenciaDiaria: [{day:"Lun",kira:86,ihfb:86},{day:"Mar",kira:89,ihfb:89},{day:"Mié",kira:87,ihfb:87},{day:"Jue",kira:91,ihfb:91},{day:"Vie",kira:88,ihfb:88}],
    observacionesPorBloque: [{block:"B1",value:174},{block:"B2",value:171},{block:"B3",value:176},{block:"B4",value:168},{block:"B5",value:170}],
    gestionOperativa: {
      formacion: {
        participantes: "958",
        secciones: "36",
        grupos: [
          {name:"Grupo 1",value:183,percentage:99.7},
          {name:"Grupo 2",value:196,percentage:100},
          {name:"Grupo 3",value:192,percentage:96.5},
          {name:"Grupo 4",value:198,percentage:98.5},
          {name:"Grupo 5",value:189,percentage:94.5},
        ],
      },
      observaciones: {
        resumen: {directoresActivos:"859",observacionesRealizadas:"803",retroalimentacionesRealizadas:"745"},
        bloques: [
          {block:"B1",activeDirectors:174,observations:162,observationsTarget:870,observationsPercentage:19,feedback:151,feedbackTarget:870,feedbackPercentage:17},
          {block:"B2",activeDirectors:171,observations:158,observationsTarget:855,observationsPercentage:18,feedback:146,feedbackTarget:855,feedbackPercentage:17},
          {block:"B3",activeDirectors:176,observations:169,observationsTarget:880,observationsPercentage:19,feedback:158,feedbackTarget:880,feedbackPercentage:18},
          {block:"B4",activeDirectors:168,observations:154,observationsTarget:840,observationsPercentage:18,feedback:141,feedbackTarget:840,feedbackPercentage:17},
          {block:"B5",activeDirectors:170,observations:160,observationsTarget:850,observationsPercentage:19,feedback:149,feedbackTarget:850,feedbackPercentage:18},
        ],
      },
    },
    centrosProyecto: [["B1","Fase 1","Activo",120],["B1","Fase 2","Activo",48],["B1","Fase 2","Pausa",4],["B1","Fase 2","Sustituto",6],["B2","Fase 1","Activo",108],["B2","Fase 2","Activo",57],["B2","Fase 2","Pausa",5],["B2","Fase 2","Sustituto",7],["B3","Fase 1","Activo",92],["B3","Fase 2","Activo",79],["B3","Fase 2","Pausa",4],["B3","Fase 2","Sustituto",5],["B4","Fase 1","Activo",85],["B4","Fase 2","Activo",78],["B4","Fase 2","Pausa",6],["B4","Fase 2","Sustituto",7],["B5","Fase 1","Activo",74],["B5","Fase 3","Activo",92],["B5","Fase 3","Pausa",5],["B5","Fase 3","Sustituto",6]],
  },
  aprendizaje: {
    estadoLxp: [
      {id:"ihfb",name:"IHFB",accent:"blue",estatus:{trimestre:3,estado:"En producción y publicación",hastaClase:139,descripcion:"Trimestre 3 en producción y publicación hasta clase 139."},pendiente:{title:"Completar producción",description:"Completar producción, revisión y publicación del T3 completo."},barrera:{title:"Tiempos de revisión",description:"Los tiempos de revisión se traslapan con otros flujos de contenido."}},
      {id:"kira",name:"Kira",accent:"green",estatus:{trimestrePublicado:2,trimestreEnProceso:3,hastaClase:120,descripcion:"Trimestre 2 publicado; Trimestre 3 en proceso hasta clase 120."},pendiente:{title:"Avanzar producción",description:"Avanzar producción y publicación del T3 completo."},barrera:{title:"Equipo compartido",description:"Equipo compartido con xAI, lo que limita la capacidad de producción simultánea."}},
      {id:"xai",name:"xAI",accent:"purple",estatus:{trimestre:2,estado:"En desarrollo",hastaClase:70,descripcion:"Trimestre 2 en desarrollo; hasta clase 70."},pendiente:{title:"Retomar desarrollo",description:"Retomar y completar el desarrollo del Ciclo 1."},barrera:{title:"Alto tiempo de producción",description:"Alto tiempo de producción por clase y necesidad de optimizar el flujo de creación de contenido.",tiempoPorClase:{minHoras:15,maxHoras:18,descripcion:"Sigue tomando entre 15 y 18 horas crear 1 clase."}}},
    ],
  },
  evaluacion: {
    comparativasNiveles: {
      matematica: {
        promedio:50, variacion:-2.7,
        junio:[15.9,25.4,19,14.9,24.8],
        julio:[22,22.7,21.4,15.1,18.8],
      },
      lengua: {
        promedio:49.7, variacion:-2.9,
        junio:[18,19.1,19.3,20.1,23.5],
        julio:[23.7,21.5,17.6,18.6,18.6],
      },
    },
    portalResultados: {
      etiqueta:"Actualización del portal",
      entrada:"Entrada en funcionamiento del portal 10 de agosto",
      incidencias:"43 reportes de incidencias de ingreso o falta de datos, hasta el 13 de agosto",
      barrera:"Para fase 1 solo se contempló ingreso a directores y docentes, no hay acceso para usuarios “administradores”, esto se dará en fase 2 de desarrollo",
    },
    aplicacionCml: {
      etiqueta:"Aplicación CML",
      programados:"Programados 55 centros (No aplicación y baja participación)",
      aplicaciones:[
        "Aplicación en 31 centros 12 de agosto, 1 pendiente por finalizar. 14 CE aplicación con Starlink",
        "24 centros en aplicación 13 de agosto. 10 CE aplicación con Starlink",
      ],
      barrera:"El contrato con SOTE se ha vencido, aplicaciones están por fuera de contrato",
    },
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

  tutoriaVirtual: [
  {
    title: "Clase regular",
    percentage: 86,
    accent: "blue",
    rows: [
      {
        block: "B1",
        invited: 1866,
        attended: 1565,
        percentage: 84,
      },
      {
        block: "B2",
        invited: 1488,
        attended: 1205,
        percentage: 81,
      },
      {
        block: "G3, G4 y G5",
        invited: 4719,
        attended: 4151,
        percentage: 88,
      },
    ],
  },

  {
    title: "Refuerzo",
    percentage: 67,
    accent: "purple",
    rows: [
      {
        block: "B1 y B2",
        invited: 735,
        attended: 498,
        percentage: 67,
      },
    ],
  },

  {
    title: "Remediación",
    percentage: 81,
    accent: "orange",
    rows: [
      {
        block: "B1 y B2",
        invited: 1134,
        attended: 822,
        percentage: 73,
      },
      {
        block: "G3, G4 y G5",
        invited: 4855,
        attended: 4028,
        percentage: 83,
      },
    ],
  },
],
},
};

export default dashboardDatabase;
