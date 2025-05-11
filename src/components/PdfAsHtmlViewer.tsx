import React, { useEffect, useState, useRef } from "react";
import Canvas from "./Canvas";
import { DrawingHistory, Line } from "../types/drawing";

interface PdfAsHtmlViewerProps {
  url: string;
  settings: {
    color: string;
    lineWidth: number;
    opacity: number;
    isEraser: boolean;
  };
  history: DrawingHistory;
  setHistory: React.Dispatch<React.SetStateAction<DrawingHistory>>;
  currentHistoryIndex: number;
  setCurrentHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
  isDrawingEnabled: boolean;
  cursorStyle: string;
  // Add chronological history prop
  chronologicalHistory: { lineId: number; pageNumber: number }[];
  // Add callback for when a new line is added
  onLineAdded: (line: Line) => void;
}

export default function PdfAsHtmlViewer({
  url,
  settings,
  history,
  setHistory,
  currentHistoryIndex,
  setCurrentHistoryIndex,
  isDrawingEnabled,
  cursorStyle,
  chronologicalHistory,
  onLineAdded,
}: PdfAsHtmlViewerProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [pageRects, setPageRects] = useState<(DOMRect | null)[]>([]);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  // Fetch HTML content
  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setHtml)
      .catch((err) => console.error("Error loading HTML:", err));
  }, [url]);

  // Get page element references when HTML is loaded
  useEffect(() => {
    if (!html || !pdfContainerRef.current) return;

    // Use setTimeout to ensure the DOM has been updated
    const timer = setTimeout(() => {
      const pageElements = pdfContainerRef.current?.querySelectorAll(".page");
      const rects = Array.from(pageElements || []).map((el) =>
        el.getBoundingClientRect()
      );
      setPageRects(rects);

      // Setup intersection observer to update page rects when scrolling
      const observer = new IntersectionObserver(
        (entries) => {
          const newRects = Array.from(pageElements || []).map((el) =>
            el.getBoundingClientRect()
          );
          setPageRects(newRects);
        },
        { threshold: 0.1 }
      );

      pageElements.forEach((el) => observer.observe(el));

      return () => {
        pageElements.forEach((el) => observer.unobserve(el));
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [html]);

  // Update page rects on scroll and resize
  useEffect(() => {
    if (!html || !pdfContainerRef.current) return;

    const updatePageRects = () => {
      const pageElements = pdfContainerRef.current?.querySelectorAll(".page");
      const rects = Array.from(pageElements || []).map((el) =>
        el.getBoundingClientRect()
      );
      setPageRects(rects);
    };

    window.addEventListener("scroll", updatePageRects);
    window.addEventListener("resize", updatePageRects);

    return () => {
      window.removeEventListener("scroll", updatePageRects);
      window.removeEventListener("resize", updatePageRects);
    };
  }, [html]);

  if (!html) return <p>Loading...</p>;

  return (
    <div ref={pdfContainerRef} className="pdf-container relative w-full">
      {/* HTML content with pages */}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="flex flex-col items-center justify-center"
        style={{ padding: "1rem", backgroundColor: "#eee" }}
      />

      {/* Canvas layers for each page */}
      {pageRects.map((rect, index) => (
        <div
          key={`page-canvas-${index}`}
          className="absolute pointer-events-none"
          style={{
            top: rect?.top ? `${rect.top}px` : "0px",
            left: rect?.left ? `${rect.left}px` : "0px",
            width: rect?.width ? `${rect.width}px` : "100%",
            height: rect?.height ? `${rect.height}px` : "100%",
            position: "absolute",
          }}
        >
          <Canvas
            settings={settings}
            history={history}
            setHistory={setHistory}
            currentHistoryIndex={currentHistoryIndex}
            setCurrentHistoryIndex={setCurrentHistoryIndex}
            isDrawingEnabled={isDrawingEnabled}
            cursorStyle={cursorStyle}
            pageNumber={index}
            pageRect={rect}
            chronologicalHistory={chronologicalHistory}
            onLineAdded={onLineAdded}
          />
        </div>
      ))}
    </div>
  );
}
