import React from "react";
import DrawingApp from "./components/DrawingApp";
import PdfAsHtmlViewer from "./components/PdfAsHtmlViewer";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <DrawingApp />
      <PdfAsHtmlViewer url="./Document.html" />
    </div>
  );
}

export default App;
