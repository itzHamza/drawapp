import React from "react";
import DrawingApp from "./components/DrawingApp";
import PDFViewer from "./components/pdfv";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <PDFViewer />
    </div>
  );
}

export default App;
