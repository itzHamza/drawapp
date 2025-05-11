import React, { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewer = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setIsLoading(false);
  };

  const onDocumentLoadError = (error) => {
    setError("Failed to load PDF: " + error.message);
    setIsLoading(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      setError(null);
      setIsLoading(true);
      setPdfUrl("");
      setPdfFile(file);
    } else {
      setError("Please select a valid PDF file");
    }
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (pdfUrl) {
      setError(null);
      setIsLoading(true);
      setPdfFile(null);
      // No need to set pdfUrl as it's already set by the input
    }
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const renderPdf = useCallback(() => {
    if (pdfFile) {
      return (
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading PDF file...</div>}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      );
    } else if (pdfUrl) {
      return (
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div>Loading PDF from URL...</div>}
        >
          <Page pageNumber={pageNumber} />
        </Document>
      );
    }
    return null;
  }, [pdfFile, pdfUrl, pageNumber]);

  return (
    <div className="pdf-viewer-container">
      <h2>PDF Viewer</h2>

      <div className="pdf-input-options">
        <div className="file-upload">
          <h3>Upload PDF File</h3>
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>

        <div className="or-separator">OR</div>

        <div className="url-input">
          <h3>Load PDF from URL</h3>
          <form onSubmit={handleUrlSubmit}>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="Enter PDF URL"
            />
            <button type="submit">Load</button>
          </form>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="pdf-display">
        {isLoading ? (
          <div>Loading PDF...</div>
        ) : (
          <>
            {renderPdf()}
            {numPages && (
              <div className="pdf-controls">
                <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
                  Previous
                </button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .pdf-viewer-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: Arial, sans-serif;
        }

        .pdf-input-options {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .file-upload,
        .url-input {
          flex: 1;
        }

        .or-separator {
          font-weight: bold;
        }

        input[type="file"],
        input[type="text"] {
          width: 100%;
          padding: 8px;
          margin-top: 5px;
        }

        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          cursor: pointer;
          margin-left: 10px;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .pdf-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          margin-top: 10px;
        }

        .error-message {
          color: red;
          margin-bottom: 20px;
        }

        .pdf-display {
          border: 1px solid #ddd;
          min-height: 500px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default PDFViewer;
