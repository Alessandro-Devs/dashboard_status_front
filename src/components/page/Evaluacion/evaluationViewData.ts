import { dashboardDatabase } from "@/data/dashboardDatabase";

export type ResumenComposicion = { estado:string;centrosEscolares:number|null;porcentajeDelTotal:number|null;variacionRespectoEtapaAnterior:number|null };
export type NivelDesempeno = { id:string;nombre:string;colorHexadecimal:string };
export type EtapaTrayectoria = { nombre:string;centrosPorNivel:Record<string,number> };
export type PruebaEvaluacion = { titulo:string;centrosEscolares:{aplicados:string;pendientes:string;universo:string;porcentaje:number|null};matricula:{aplicados:string;pendientes:string;universo:string;porcentaje:number|null} };
export type DetalleBloqueItem = { bloque:string;aplicados:number;pendientes:number;universo:number;porcentaje:number };
export type DetalleBloque = { centrosEscolares:DetalleBloqueItem[];matricula:DetalleBloqueItem[] };
export type DetallePorPrueba = Partial<Record<"cml" | "progreso", DetalleBloque>>;
export type DistribucionNivelPorBloque = { bloque:string;nivel1:number|null;nivel2:number|null;nivel3:number|null;nivel4:number|null;nivel5:number|null };
type VistaResultados = {
  materiasDisponibles:string[];
  materiaSeleccionadaPorDefecto:string;
  composicionDelUniverso:Record<string,ResumenComposicion[]>;
  trayectoriaDeResultados:{nivelesDeDesempeno:NivelDesempeno[];resumenPorNivel:Array<{idNivel:string;centrosEscolares:number|null;porcentajeDelTotal:number|null}>;etapas:EtapaTrayectoria[];distribucionPorcentualDeLosFlujos:Partial<{permaneceEnElMismoNivel:number;subeUnNivel:number;bajaUnNivel:number}>;lecturaPrincipal:string;descripcionLectura:string};
};

type EvaluacionNueva = {
  pruebas?:Record<string,PruebaEvaluacion>;
  seguimientoAplicacionCml?:{etiqueta:string;programados:string;aplicaciones:string[];barrera:string};
  detallePorBloque?:DetalleBloque | DetallePorPrueba;
  actualizacionPortalResultados?:{etiqueta:string;entrada:string;incidencias:string;barrera:string};
  comparativasPorMateria?:Record<string,{promedio:number|null;variacionRespectoJunio:number|null;porcentajesJunio:number[];porcentajesJulio:number[]}>;
  distribucionPorBloqueMateriaNiveles?:Record<string,DistribucionNivelPorBloque[]>;
  vistaResultados?:VistaResultados;
};

export const getEvaluacion = () => dashboardDatabase.evaluacion as unknown as EvaluacionNueva;
export const tieneTexto = (value:unknown):value is string => typeof value === "string" && value.trim().length > 0;
export const tieneNumero = (value:unknown):value is number => typeof value === "number" && Number.isFinite(value);
