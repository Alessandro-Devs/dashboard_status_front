export type TestType = "cml" | "progreso";
export type BlockItem = { block:string;universe:number;applied:number;pending:number;percentage:number };
export const blockData: BlockItem[] = [
  {block:"B1",universe:150,applied:136,pending:14,percentage:91},{block:"B2",universe:160,applied:139,pending:21,percentage:87},{block:"B3",universe:150,applied:127,pending:23,percentage:85},{block:"B4",universe:144,applied:111,pending:33,percentage:77},{block:"B5",universe:150,applied:99,pending:51,percentage:66},
];
export const universeComposition = [{title:"Se mantienen",value:716,percentage:95,change:"↓ 1 pp",type:"neutral"},{title:"Mejoran / suben",value:38,percentage:5,change:"↗ 1 pp",type:"positive"},{title:"Bajan",value:0,percentage:0,change:"— 0 pp",type:"negative"}] as const;
export const trajectorySummary = [{label:"Excelente",value:126,percentage:"17%",color:"bg-[#16a34a]",text:"text-[#16a34a]"},{label:"Bueno",value:247,percentage:"33%",color:"bg-[#65a30d]",text:"text-[#65a30d]"},{label:"Medio",value:222,percentage:"29%",color:"bg-[#eab308]",text:"text-[#d69b00]"},{label:"Bajo",value:105,percentage:"14%",color:"bg-[#f97316]",text:"text-[#f97316]"},{label:"Crítico",value:54,percentage:"7%",color:"bg-[#ef4444]",text:"text-[#ef4444]"}];
