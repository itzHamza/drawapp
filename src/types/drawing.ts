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
  pageNumber?: number; // Page number the line belongs to
  id?: number; // Unique identifier for the line
}

export type DrawingHistory = Line[];

export interface PageDrawingState {
  history: DrawingHistory;
  currentHistoryIndex: number;
}

// Track the order of lines across all pages
export interface ChronologicalLineRef {
  lineId: number;
  pageNumber: number;
}
