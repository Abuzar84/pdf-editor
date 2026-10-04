export type Tool = "select" | "text" | "highlight" | "draw" | "delete";

export interface TextAnnotation {
  id: string;
  page: number;
  x: number; // percentage of page width (0-100)
  y: number; // percentage of page height (0-100)
  text: string;
  fontSize: number;
  color: string;
}
