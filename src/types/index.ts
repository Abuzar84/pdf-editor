export type Tool = "select" | "text" | "highlight" | "draw" | "delete";

export interface TextAnnotation {
  id: string;
  type: "text";
  page: number;
  x: number; // percentage of page width (0-100)
  y: number; // percentage of page height (0-100)
  text: string;
  fontSize: number;
  color: string;
}

export interface HighlightAnnotation {
  id: string;
  type: "highlight";
  page: number;
  x: number; // percentage (left)
  y: number; // percentage (top)
  width: number; // percentage
  height: number; // percentage
  color: string;
}

export type Annotation = TextAnnotation | HighlightAnnotation;
