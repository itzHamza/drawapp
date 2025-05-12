// Enhanced React component to fetch and display a PDF as HTML
import React, { useState, useEffect } from "react";

const PDFViewer = ({ pdfUrl }) => {
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  // Update this to your actual backend URL
  const BACKEND_URL = "https://pdftohtml-production-c12d.up.railway.app";

  useEffect(() => {
    const convertPdfToHtml = async () => {
      try {
        setLoading(true);
        console.log(`Starting conversion for PDF: ${pdfUrl}`);

        // First, fetch the PDF from your storage
        console.log("Fetching PDF document...");
        const pdfResponse = await fetch(pdfUrl);

        if (!pdfResponse.ok) {
          throw new Error(
            `Failed to fetch PDF: ${pdfResponse.statusText} (${pdfResponse.status})`
          );
        }

        console.log("PDF fetch successful, creating blob...");
        const pdfBlob = await pdfResponse.blob();
        console.log(
          `PDF blob created, size: ${pdfBlob.size} bytes, type: ${pdfBlob.type}`
        );

        // Create form data
        const formData = new FormData();
        formData.append("file", pdfBlob, "document.pdf");

        // Send to conversion API
        console.log(`Sending PDF to conversion API at ${BACKEND_URL}/convert`);
        const conversionResponse = await fetch(`${BACKEND_URL}/convert`, {
          method: "POST",
          body: formData,
          // No need to set Content-Type with FormData
        });

        // Save response details for debugging
        const responseDetails = {
          status: conversionResponse.status,
          statusText: conversionResponse.statusText,
          headers: Object.fromEntries([
            ...conversionResponse.headers.entries(),
          ]),
        };

        console.log("Conversion API response:", responseDetails);
        setDebugInfo(responseDetails);

        if (!conversionResponse.ok) {
          let errorDetails = "";
          // Try to get error details from response
          try {
            const errorData = await conversionResponse.json();
            errorDetails = errorData.error || JSON.stringify(errorData);
          } catch (e) {
            // If not JSON, try to get text
            try {
              errorDetails = await conversionResponse.text();
            } catch (e2) {
              errorDetails = "Could not parse error response";
            }
          }

          throw new Error(
            `Conversion failed (${conversionResponse.status}): ${errorDetails}`
          );
        }

        // Get the HTML content
        console.log("Reading HTML content from response...");
        const html = await conversionResponse.text();
        console.log(`Received HTML content, length: ${html.length} characters`);
        setHtmlContent(html);
      } catch (err) {
        console.error("Error converting PDF:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (pdfUrl) {
      convertPdfToHtml();
    }
  }, [pdfUrl]);

  // Try alternative method using direct binary upload
  const tryAlternativeMethod = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Trying alternative conversion method...");
      const html = await convertPdfUsingBinary(pdfUrl);
      setHtmlContent(html);
    } catch (err) {
      console.error("Alternative method failed:", err);
      setError(`Both conversion methods failed. Last error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Alternative implementation using raw binary data
  const convertPdfUsingBinary = async (pdfUrl) => {
    // Fetch the PDF as ArrayBuffer
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();
    console.log(
      `Sending PDF as binary data, size: ${pdfBuffer.byteLength} bytes`
    );

    // Send the binary data directly
    const conversionResponse = await fetch(`${BACKEND_URL}/convert`, {
      method: "POST",
      body: pdfBuffer,
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (!conversionResponse.ok) {
      let errorDetails = "";
      try {
        const errorData = await conversionResponse.json();
        errorDetails = errorData.error || JSON.stringify(errorData);
      } catch (e) {
        try {
          errorDetails = await conversionResponse.text();
        } catch (e2) {
          errorDetails = "Could not parse error response";
        }
      }

      throw new Error(`Binary conversion failed: ${errorDetails}`);
    }

    const html = await conversionResponse.text();
    console.log(`Binary method successful, received ${html.length} characters`);
    return html;
  };

  if (loading) {
    return <div>Loading document...</div>;
  }

  return (
    <div className="pdf-viewer-container">
      {error ? (
        <div className="error-container">
          <div className="error-message">Error loading document: {error}</div>
          <button onClick={tryAlternativeMethod} className="retry-button">
            Try alternative method
          </button>

          {debugInfo && (
            <div className="debug-info">
              <h4>Debug Information:</h4>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      ) : (
        <div
          className="pdf-content flex flex-col items-center justify-center"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      )}
    </div>
  );
};

export default PDFViewer;
