"use client";

import { useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type { Tool, TextAnnotation } from "@/types";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  activeTool: Tool;
  annotations: TextAnnotation[];
  onAddAnnotation: (annotation: TextAnnotation) => void;
  onUpdateAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
}

export default function PDFViewer({
  file,
  activeTool,
  annotations,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool !== "text" || !pageRef.current) return;

      // Don't add if clicking on an existing annotation
      if ((e.target as HTMLElement).closest("[data-annotation]")) return;

      const rect = pageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      const id = `text-${Date.now()}`;
      onAddAnnotation({
        id,
        page: pageNumber,
        x,
        y,
        text: "",
        fontSize: 16,
        color: "#000000",
      });
      setEditingId(id);
    },
    [activeTool, pageNumber, onAddAnnotation]
  );

  const pageAnnotations = annotations.filter((a) => a.page === pageNumber);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-muted min-w-[80px] text-center">
            {pageNumber} / {numPages || "—"}
          </span>

          <button
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          {activeTool === "text" && (
            <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
              Click on PDF to add text
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-sm text-muted min-w-[50px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(2.5, s + 0.1))}
              className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ZoomIn size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Page */}
      <div className="flex-1 overflow-auto flex justify-center p-6 bg-background">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-muted text-sm animate-pulse">Loading PDF...</div>
          }
          error={
            <div className="text-danger text-sm">Failed to load PDF.</div>
          }
        >
          <div
            ref={pageRef}
            className={`relative shadow-2xl rounded-lg overflow-hidden ${
              activeTool === "text" ? "cursor-crosshair" : ""
            }`}
            onClick={handlePageClick}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />

            {/* Text Annotations Overlay */}
            {pageAnnotations.map((ann) => (
              <div
                key={ann.id}
                data-annotation
                className="absolute group"
                style={{
                  left: `${ann.x}%`,
                  top: `${ann.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {editingId === ann.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={ann.text}
                    placeholder="Type here..."
                    className="bg-white/95 text-black border-2 border-primary rounded px-2 py-1 outline-none min-w-[120px] shadow-lg"
                    style={{ fontSize: ann.fontSize * scale }}
                    onChange={(e) => onUpdateAnnotation(ann.id, e.target.value)}
                    onBlur={() => {
                      if (!ann.text.trim()) {
                        onDeleteAnnotation(ann.id);
                      }
                      setEditingId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (!ann.text.trim()) {
                          onDeleteAnnotation(ann.id);
                        }
                        setEditingId(null);
                      }
                      if (e.key === "Escape") {
                        onDeleteAnnotation(ann.id);
                        setEditingId(null);
                      }
                    }}
                  />
                ) : (
                  <div
                    className="cursor-pointer px-1 rounded hover:bg-primary/20 transition-colors"
                    style={{
                      fontSize: ann.fontSize * scale,
                      color: ann.color,
                      fontWeight: 500,
                      textShadow: "0 0 2px rgba(255,255,255,0.8)",
                    }}
                    onDoubleClick={() => setEditingId(ann.id)}
                  >
                    {ann.text || (
                      <span className="text-muted italic text-sm">Empty</span>
                    )}
                  </div>
                )}

                {/* Delete button on hover */}
                {editingId !== ann.id && (
                  <button
                    className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    onClick={() => onDeleteAnnotation(ann.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </Document>
      </div>
    </div>
  );
}
