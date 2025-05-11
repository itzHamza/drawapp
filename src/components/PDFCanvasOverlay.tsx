import React, { useState, useEffect, useRef } from "react";
import { Line, DrawingHistory } from "../types/drawing";
import Canvas from "./Canvas";
import { clearAllBodyScrollLocks, disableBodyScroll } from "body-scroll-lock";

interface PDFCanvasOverlayProps {
  settings: {
    color: string;
    lineWidth: number;
    opacity: number;
    isEraser: boolean;
  };
  isDrawingEnabled: boolean;
  cursorStyle: string;
}

const PDFCanvasOverlay: React.FC<PDFCanvasOverlayProps> = ({
  settings,
  isDrawingEnabled,
  cursorStyle,
}) => {
  const [pages, setPages] = useState<HTMLElement[]>([]);
  const [pageHistories, setPageHistories] = useState<
    Map<number, DrawingHistory>
  >(new Map());
  const [currentHistoryIndices, setCurrentHistoryIndices] = useState<
    Map<number, number>
  >(new Map());
  const [forceUpdate, setForceUpdate] = useState(0); // Used to force re-render on scroll
  const overlayContainerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  // Find PDF pages and set up observers
  useEffect(() => {
    // Function to find PDF pages in the document
    const findPDFPages = () => {
      const pdfContainer = document.querySelector(
        ".flex.flex-col.items-center.justify-center"
      );
      if (!pdfContainer) return [];

      // Find all page elements (this selector might need to be adjusted based on actual HTML structure)
      // First try to find elements with 'page' class, then fallback to any direct children
      let pageElements = Array.from(pdfContainer.querySelectorAll(".page"));

      // If no elements with 'page' class are found, use direct children as pages
      if (pageElements.length === 0) {
        pageElements = Array.from(pdfContainer.children);
      }

      return pageElements as HTMLElement[];
    };

    // Initialize the observer to watch for DOM changes
    if (!observerRef.current) {
      observerRef.current = new MutationObserver((mutations) => {
        const foundPages = findPDFPages();
        if (foundPages.length > 0 && foundPages.length !== pages.length) {
          setPages(foundPages);

          // Initialize histories for new pages
          const newHistories = new Map(pageHistories);
          const newIndices = new Map(currentHistoryIndices);

          foundPages.forEach((_, index) => {
            if (!newHistories.has(index)) {
              newHistories.set(index, []); // Ensure this is an array
              newIndices.set(index, -1);
            }
          });

          setPageHistories(newHistories);
          setCurrentHistoryIndices(newIndices);
        }
      });

      // Start observing
      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Initial check for pages
    const initialPages = findPDFPages();
    if (initialPages.length > 0) {
      setPages(initialPages);

      // Initialize histories for initial pages
      const initialHistories = new Map();
      const initialIndices = new Map();

      initialPages.forEach((_, index) => {
        initialHistories.set(index, []); // Ensure this is an array
        initialIndices.set(index, -1);
      });

      setPageHistories(initialHistories);
      setCurrentHistoryIndices(initialIndices);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearAllBodyScrollLocks();
    };
  }, []);

  // Handle scroll events to update canvas positions
  useEffect(() => {
    const handleScroll = () => {
      // Force a re-render to update positions
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Updates the history for a specific page
  const updatePageHistory = (pageIndex: number, newHistory: DrawingHistory) => {
    setPageHistories((prev) => {
      const updated = new Map(prev);
      updated.set(pageIndex, newHistory);
      return updated;
    });
  };

  // Updates the current history index for a specific page
  const updatePageHistoryIndex = (pageIndex: number, newIndex: number) => {
    setCurrentHistoryIndices((prev) => {
      const updated = new Map(prev);
      updated.set(pageIndex, newIndex);
      return updated;
    });
  };

  return (
    <div
      ref={overlayContainerRef}
      className="absolute top-0 left-0 w-full pointer-events-none"
    >
      {pages.map((page, index) => {
        const pageRect = page.getBoundingClientRect();
        // Ensure history is an array
        const history = pageHistories.has(index)
          ? pageHistories.get(index) || []
          : [];
        const currentHistoryIndex = currentHistoryIndices.has(index)
          ? currentHistoryIndices.get(index) || -1
          : -1;

        return (
          <div
            key={`canvas-overlay-${index}`}
            className="absolute pointer-events-auto"
            style={{
              top: `${pageRect.top + window.scrollY}px`,
              left: `${pageRect.left}px`,
              width: `${pageRect.width}px`,
              height: `${pageRect.height}px`,
              zIndex: 10,
            }}
          >
            <Canvas
              settings={settings}
              history={history}
              setHistory={(newHistory) => {
                const historyValue =
                  typeof newHistory === "function"
                    ? newHistory(history)
                    : newHistory;
                updatePageHistory(
                  index,
                  Array.isArray(historyValue) ? historyValue : []
                );
              }}
              currentHistoryIndex={currentHistoryIndex}
              setCurrentHistoryIndex={(newIndex) => {
                const indexValue =
                  typeof newIndex === "function"
                    ? newIndex(currentHistoryIndex)
                    : newIndex;
                updatePageHistoryIndex(index, indexValue);
              }}
              isDrawingEnabled={isDrawingEnabled}
              cursorStyle={cursorStyle}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PDFCanvasOverlay;
