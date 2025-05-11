import React, { useRef, useEffect, useState } from "react";
import { Point, DrawingSettings, Line, DrawingHistory } from "../types/drawing";

interface CanvasProps {
  settings: DrawingSettings;
  history: DrawingHistory;
  setHistory: React.Dispatch<React.SetStateAction<DrawingHistory>>;
  currentHistoryIndex: number;
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  isDrawingEnabled: boolean;
  cursorStyle: string;
  pageNumber: number;
  pageRect: DOMRect | null;
}

const Canvas: React.FC<CanvasProps> = ({
  settings,
  history,
  setHistory,
  currentHistoryIndex,
  setCurrentHistoryIndex,
  isDrawingEnabled,
  cursorStyle,
  pageNumber,
  pageRect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<Line>({
    points: [],
    color: settings.color,
    lineWidth: settings.lineWidth,
    opacity: settings.opacity,
    isEraser: settings.isEraser,
  });

  // Redraw canvas when history changes or current history index changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageRect) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter history for this specific page
    const pageHistory = history.filter(
      (line) => line.pageNumber === pageNumber
    );

    pageHistory.slice(0, currentHistoryIndex + 1).forEach((line) => {
      if (line.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);

      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }

      if (line.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.opacity;
      }

      ctx.lineWidth = line.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [history, currentHistoryIndex, pageRect, pageNumber]);

  // Update canvas size when page rect changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pageRect) return;

    canvas.width = pageRect.width;
    canvas.height = pageRect.height;

    // Redraw after resize
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Filter history for this specific page
    const pageHistory = history.filter(
      (line) => line.pageNumber === pageNumber
    );

    pageHistory.slice(0, currentHistoryIndex + 1).forEach((line) => {
      if (line.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(line.points[0].x, line.points[0].y);

      for (let i = 1; i < line.points.length; i++) {
        ctx.lineTo(line.points[i].x, line.points[i].y);
      }

      if (line.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = line.color;
        ctx.globalAlpha = line.opacity;
      }

      ctx.lineWidth = line.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    });

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }, [pageRect, history, currentHistoryIndex, pageNumber]);

  const getCanvasPoint = (
    e: React.MouseEvent | React.TouchEvent
  ): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleStartDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingEnabled) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);

    if (currentHistoryIndex < history.length - 1) {
      setHistory(history.slice(0, currentHistoryIndex + 1));
    }

    setCurrentLine({
      points: [point],
      color: settings.color,
      lineWidth: settings.lineWidth,
      opacity: settings.opacity,
      isEraser: settings.isEraser,
      pageNumber: pageNumber, // Store page number with line
    });
  };

  const handleDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingEnabled || !isDrawing) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentLine((prevLine) => {
      const updatedLine = {
        ...prevLine,
        points: [...prevLine.points, point],
      };

      const canvas = canvasRef.current;
      if (!canvas) return updatedLine;

      const ctx = canvas.getContext("2d");
      if (!ctx) return updatedLine;

      const points = updatedLine.points;
      const lastIndex = points.length - 1;

      if (lastIndex < 1) return updatedLine;

      ctx.beginPath();
      ctx.moveTo(points[lastIndex - 1].x, points[lastIndex - 1].y);
      ctx.lineTo(points[lastIndex].x, points[lastIndex].y);

      if (updatedLine.isEraser) {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
        ctx.globalAlpha = 1;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = updatedLine.color;
        ctx.globalAlpha = updatedLine.opacity;
      }

      ctx.lineWidth = updatedLine.lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      return updatedLine;
    });
  };

  const handleEndDrawing = () => {
    if (!isDrawingEnabled || !isDrawing) return;

    setIsDrawing(false);

    if (currentLine.points.length > 1) {
      setHistory((prevHistory) => [...prevHistory, currentLine]);
      setCurrentHistoryIndex((prevIndex) => prevIndex + 1);
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className={`absolute top-0 left-0 w-full h-full bg-transparent ${cursorStyle} ${
        isDrawingEnabled ? "pointer-events-auto" : "pointer-events-none"
      }`}
      onMouseDown={handleStartDrawing}
      onMouseMove={handleDraw}
      onMouseUp={handleEndDrawing}
      onMouseLeave={handleEndDrawing}
      onTouchStart={handleStartDrawing}
      onTouchMove={handleDraw}
      onTouchEnd={handleEndDrawing}
      style={{
        cursor: isDrawingEnabled ? "crosshair" : "default",
      }}
    />
  );
};

export default Canvas;
