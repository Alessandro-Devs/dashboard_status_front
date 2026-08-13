export type LineProgress = { id: string; name: string; accent: "blue" | "purple" | "green"; authoring: number; authoringRange: string; production: number; productionRange: string; publication: number; publicationRange: string };
export const lineProgress: LineProgress[] = [
  { id:"ihfb",name:"IHFB",accent:"blue",authoring:100,authoringRange:"101-160",production:58,productionRange:"110-139",publication:38,publicationRange:"110-129" },
  { id:"kira",name:"Kira",accent:"purple",authoring:96,authoringRange:"101-160",production:63,productionRange:"101-138",publication:44,publicationRange:"101-127" },
  { id:"xai",name:"xAI",accent:"green",authoring:92,authoringRange:"101-160",production:57,productionRange:"101-135",publication:36,publicationRange:"101-122" },
];
