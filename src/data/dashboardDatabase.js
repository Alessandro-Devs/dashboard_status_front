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
    lineas: [
      {id:"ihfb",name:"IHFB",accent:"blue",authoring:100,authoringRange:"101-160",production:58,productionRange:"110-139",publication:38,publicationRange:"110-129"},
      {id:"kira",name:"Kira",accent:"purple",authoring:96,authoringRange:"101-160",production:63,productionRange:"101-138",publication:44,publicationRange:"101-127"},
      {id:"xai",name:"xAI",accent:"green",authoring:92,authoringRange:"101-160",production:57,productionRange:"101-135",publication:36,publicationRange:"101-122"},
    ],
  },
  evaluacion: {
    pruebas: {
      cml:{title:"Prueba CML",schoolPercentage:81,schoolApplied:"612",schoolPending:"142",enrollmentPercentage:77,enrollmentApplied:"10,842",enrollmentPending:"3318"},
      progreso:{title:"Prueba Progreso",schoolPercentage:76,schoolApplied:"574",schoolPending:"180",enrollmentPercentage:68,enrollmentApplied:"9638",enrollmentPending:"4522"},
    },
    bloquesCentros: [{block:"B1",universe:150,applied:136,pending:14,percentage:91},{block:"B2",universe:160,applied:139,pending:21,percentage:87},{block:"B3",universe:150,applied:127,pending:23,percentage:85},{block:"B4",universe:144,applied:111,pending:33,percentage:77},{block:"B5",universe:150,applied:99,pending:51,percentage:66}],
    bloquesMatricula: [{block:"B1",universe:2840,applied:2450,pending:390,percentage:86},{block:"B2",universe:2960,applied:2398,pending:562,percentage:81},{block:"B3",universe:2810,applied:2179,pending:631,percentage:78},{block:"B4",universe:2740,applied:1985,pending:755,percentage:72},{block:"B5",universe:2810,applied:1830,pending:980,percentage:65}],
    composicionUniverso: [{title:"Se mantienen",value:716,percentage:95,change:"↓ 1 pp",type:"neutral"},{title:"Mejoran / suben",value:38,percentage:5,change:"↗ 1 pp",type:"positive"},{title:"Bajan",value:0,percentage:0,change:"— 0 pp",type:"negative"}],
    trayectoria: [{label:"Excelente",value:126,percentage:"17%",color:"bg-[#16a34a]",text:"text-[#16a34a]"},{label:"Bueno",value:247,percentage:"33%",color:"bg-[#65a30d]",text:"text-[#65a30d]"},{label:"Medio",value:222,percentage:"29%",color:"bg-[#eab308]",text:"text-[#d69b00]"},{label:"Bajo",value:105,percentage:"14%",color:"bg-[#f97316]",text:"text-[#f97316]"},{label:"Crítico",value:54,percentage:"7%",color:"bg-[#ef4444]",text:"text-[#ef4444]"}],
  },
  tutoriaFormacion: {
    accesos: {centros:"754",docentes:"6842",docentesConAcceso:"5847",porcentajeDocentes:85,estudiantes:"14.160",estudiantesConAcceso:"11.842",porcentajeEstudiantes:84},
    modelamientos: {totalDocentes:"6842",realizados:"4280",meta:"5000",porcentajeMeta:86,claseRegular:"2640",porcentajeClaseRegular:62,remediacion:"1640",porcentajeRemediacion:38},
    tutoriaVirtual: [
      {title:"Clase",percentage:88,accent:"blue",rows:[["B1",145,132,91],["B2",152,139,91],["B3",141,124,88],["B4",136,117,86],["B5",148,126,85]]},
      {title:"Refuerzo",percentage:87,accent:"purple",rows:[["B1",128,116,91],["B2",136,121,89],["B3",119,101,85],["B4",124,108,87],["B5",131,112,85]]},
      {title:"Remediación",percentage:85,accent:"orange",rows:[["B1",92,83,90],["B2",97,85,88],["B3",89,73,82],["B4",91,77,85],["B5",95,78,82]]},
    ],
  },
};

export default dashboardDatabase;
