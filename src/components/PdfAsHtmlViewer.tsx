import { useEffect, useState } from "react";

export default function PdfAsHtmlViewer({ url }: { url: string }) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then((res) => res.text())
      .then(setHtml)
      .catch((err) => console.error("Error loading HTML:", err));
  }, [url]);

  if (!html) return <p>Loading...</p>;

  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
      className="flex flex-col items-center justify-center"
      style={{ padding: "1rem", backgroundColor: "#eee" }}
    />
  );
}
