// types/drawing.ts

export interface Point {
  x: number;
  y: number;
}

export interface DrawingSettings {
  color: string;
  lineWidth: number;
  opacity: number;
  isEraser: boolean;
}

export interface Line {
  points: Point[];
  color: string;
  lineWidth: number;
  opacity: number;
  isEraser: boolean;
  pageNumber?: number; // Added page number to track which page the line belongs to
}

export type DrawingHistory = Line[];

export interface PageDrawingState {
  history: DrawingHistory;
  currentHistoryIndex: number;
}
