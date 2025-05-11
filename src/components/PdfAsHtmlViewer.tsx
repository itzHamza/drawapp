import React, { useEffect, useState, useRef, useCallback } from "react";
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
  chronologicalHistory: { lineId: number; pageNumber: number }[];
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
  const pageElementsRef = useRef<NodeListOf<Element> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch HTML content
  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setHtml)
      .catch((err) => console.error("Error loading HTML:", err));
  }, [url]);

  // Create a memoized function to update page rects
  const updatePageRects = useCallback(() => {
    if (!pdfContainerRef.current) return;

    // Use the cached page elements or query for them
    const pageElements =
      pageElementsRef.current ||
      pdfContainerRef.current.querySelectorAll(".page");

    // Cache the page elements for future use
    if (!pageElementsRef.current) {
      pageElementsRef.current = pageElements;
    }

    // Calculate DOMRects for all pages
    const rects = Array.from(pageElements || []).map((el) => {
      const rect = el.getBoundingClientRect();
      // Create a new DOMRect with fixed positions relative to the page
      return new DOMRect(
        rect.left + window.scrollX,
        rect.top + window.scrollY,
        rect.width,
        rect.height
      );
    });

    setPageRects(rects);
  }, []);

  // Get page element references when HTML is loaded and setup positioning
  useEffect(() => {
    if (!html || !pdfContainerRef.current) return;

    // Use a slight delay to ensure the DOM has been updated
    const timer = setTimeout(() => {
      updatePageRects();

      // Setup intersection observer to detect when pages come into view
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            updatePageRects();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current = observer;

      // Observe all page elements
      const pageElements = pdfContainerRef.current?.querySelectorAll(".page");
      pageElementsRef.current = pageElements;

      if (pageElements) {
        pageElements.forEach((el) => observer.observe(el));
      }

      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, 500);

    return () => clearTimeout(timer);
  }, [html, updatePageRects]);

  // Add thorough scroll and resize event listeners
  useEffect(() => {
    if (!html) return;

    // Debounce function to limit update frequency
    let timeout: NodeJS.Timeout | null = null;
    const debouncedUpdateRects = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        updatePageRects();
      }, 50); // Adjust debounce time as needed
    };

    // Events to track
    window.addEventListener("scroll", debouncedUpdateRects, { passive: true });
    window.addEventListener("resize", debouncedUpdateRects);
    document.addEventListener("touchmove", debouncedUpdateRects, {
      passive: true,
    });
    document.addEventListener("mousemove", debouncedUpdateRects, {
      passive: true,
    });

    // Initial update
    updatePageRects();

    return () => {
      window.removeEventListener("scroll", debouncedUpdateRects);
      window.removeEventListener("resize", debouncedUpdateRects);
      document.removeEventListener("touchmove", debouncedUpdateRects);
      document.removeEventListener("mousemove", debouncedUpdateRects);
      if (timeout) clearTimeout(timeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [html, updatePageRects]);

  // Function to convert fixed page rect to viewport-relative position for rendering
  const getViewportPosition = (rect: DOMRect | null) => {
    if (!rect) return { top: 0, left: 0, width: "100%", height: "100%" };

    return {
      top: `${rect.top - window.scrollY}px`,
      left: `${rect.left - window.scrollX}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  };

  if (!html) return <p>Loading...</p>;

  return (
    <div ref={pdfContainerRef} className="pdf-container relative w-full">
      {/* HTML content with pages */}
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="flex flex-col items-center justify-center"
        style={{ padding: "1rem", backgroundColor: "#eee" }}
      />

      {/* Canvas layers for each page with fixed positioning */}
      {pageRects.map((rect, index) => (
        <div
          key={`page-canvas-${index}`}
          className="fixed pointer-events-none"
          style={{
            top: getViewportPosition(rect).top,
            left: getViewportPosition(rect).left,
            width: getViewportPosition(rect).width,
            height: getViewportPosition(rect).height,
            zIndex: 10,
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
            updatePageRect={updatePageRects}
          />
        </div>
      ))}
    </div>
  );
}
