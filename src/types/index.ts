export type Tool = "select" | "text" | "highlight" | "draw" | "delete";

export interface TextAnnotation {
  id: string;
  type: "text";
  page: number;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export interface HighlightAnnotation {
  id: string;
  type: "highlight";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export interface DrawAnnotation {
  id: string;
  type: "draw";
  page: number;
  points: { x: number; y: number }[]; // percentages 0-100
  color: string;
  strokeWidth: number;
}

export type Annotation = TextAnnotation | HighlightAnnotation | DrawAnnotation;
