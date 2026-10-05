"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Trash2 } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import type {
  Tool,
  Annotation,
  TextAnnotation,
  HighlightAnnotation,
  DrawAnnotation,
} from "@/types";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: File;
  activeTool: Tool;
  annotations: Annotation[];
  deletedPages: number[];
  onAddAnnotation: (annotation: Annotation) => void;
  onUpdateAnnotation: (id: string, text: string) => void;
  onDeleteAnnotation: (id: string) => void;
  onDeletePage: (page: number) => void;
  onRestorePage: (page: number) => void;
}

export default function PDFViewer({
  file,
  activeTool,
  annotations,
  deletedPages,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDeletePage,
  onRestorePage,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentStroke, setCurrentStroke] = useState<{ x: number; y: number }[]>(
    []
  );
  const [isDrawing, setIsDrawing] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Reset state when file changes
  useEffect(() => {
    setNumPages(0);
    setPageNumber(1);
    setScale(1.0);
    setEditingId(null);
    setCurrentStroke([]);
    setIsDrawing(false);
  }, [file]);

  const visiblePages = useMemo(() => {
    if (!numPages) return [];
    return Array.from({ length: numPages }, (_, i) => i + 1).filter(
      (p) => !deletedPages.includes(p)
    );
  }, [numPages, deletedPages]);

  useEffect(() => {
    if (visiblePages.length === 0) return;
    if (!visiblePages.includes(pageNumber)) {
      setPageNumber(visiblePages[0]);
    }
  }, [visiblePages, pageNumber]);

  function onDocumentLoadSuccess({ numPages: total }: { numPages: number }) {
    setNumPages(total);
    setPageNumber(1);
  }

  const getPercent = (e: React.MouseEvent | MouseEvent) => {
    if (!pageRef.current) return { x: 0, y: 0 };
    const rect = pageRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const goToPrev = () => {
    const idx = visiblePages.indexOf(pageNumber);
    if (idx > 0) setPageNumber(visiblePages[idx - 1]);
  };

  const goToNext = () => {
    const idx = visiblePages.indexOf(pageNumber);
    if (idx < visiblePages.length - 1) setPageNumber(visiblePages[idx + 1]);
  };

  useEffect(() => {
    if (activeTool !== "highlight") return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !pageRef.current) return;

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();
      if (!selectedText) return;
      if (!pageRef.current.contains(range.commonAncestorContainer)) return;

      const pageRect = pageRef.current.getBoundingClientRect();
      const rects = range.getClientRects();

      for (let i = 0; i < rects.length; i++) {
        const r = rects[i];
        if (r.width < 2 || r.height < 2) continue;

        onAddAnnotation({
          id: `hl-${Date.now()}-${i}`,
          type: "highlight",
          page: pageNumber,
          x: ((r.left - pageRect.left) / pageRect.width) * 100,
          y: ((r.top - pageRect.top) / pageRect.height) * 100,
          width: (r.width / pageRect.width) * 100,
          height: (r.height / pageRect.height) * 100,
          color: "#fef08a",
        } as HighlightAnnotation);
      }

      selection.removeAllRanges();
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, [activeTool, pageNumber, onAddAnnotation]);

  const handlePageClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (activeTool !== "text" || !pageRef.current) return;
      if ((e.target as HTMLElement).closest("[data-annotation]")) return;

      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      const { x, y } = getPercent(e);
      const id = `text-${Date.now()}`;
      onAddAnnotation({
        id,
        type: "text",
        page: pageNumber,
        x,
        y,
        text: "",
        fontSize: 16,
        color: "#000000",
      } as TextAnnotation);
      setEditingId(id);
    },
    [activeTool, pageNumber, onAddAnnotation]
  );

  const handleDrawStart = (e: React.MouseEvent) => {
    if (activeTool !== "draw") return;
    e.preventDefault();
    setIsDrawing(true);
    setCurrentStroke([getPercent(e)]);
  };

  const handleDrawMove = (e: React.MouseEvent) => {
    if (!isDrawing || activeTool !== "draw") return;
    e.preventDefault();
    setCurrentStroke((prev) => [...prev, getPercent(e)]);
  };

  const handleDrawEnd = () => {
    if (!isDrawing || activeTool !== "draw") return;
    setIsDrawing(false);

    if (currentStroke.length >= 2) {
      onAddAnnotation({
        id: `draw-${Date.now()}`,
        type: "draw",
        page: pageNumber,
        points: currentStroke,
        color: "#ef4444",
        strokeWidth: 2.5,
      } as DrawAnnotation);
    }
    setCurrentStroke([]);
  };

  const pageAnnotations = annotations.filter((a) => a.page === pageNumber);
  const isCurrentDeleted = deletedPages.includes(pageNumber);

  const pointsToSvgPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ");
  };

  const cursorClass =
    activeTool === "text"
      ? "cursor-crosshair"
      : activeTool === "highlight"
        ? "cursor-text"
        : activeTool === "draw"
          ? "cursor-crosshair"
          : "";

  const displayIndex = visiblePages.indexOf(pageNumber) + 1;
  const allDeleted = numPages > 0 && visiblePages.length === 0;

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-surface/50">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrev}
            disabled={visiblePages.indexOf(pageNumber) <= 0}
            className="p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="text-sm text-muted min-w-[100px] text-center">
            {visiblePages.length > 0
              ? `${displayIndex} / ${visiblePages.length}`
              : numPages > 0
                ? "—"
                : "Loading..."}
            {deletedPages.length > 0 && (
              <span className="text-danger text-xs ml-1">
                ({deletedPages.length} deleted)
              </span>
            )}
          </span>

          <button
            onClick={goToNext}
            disabled={
              visiblePages.indexOf(pageNumber) >= visiblePages.length - 1
            }
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
          {activeTool === "highlight" && (
            <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
              Select text to highlight
            </span>
          )}
          {activeTool === "draw" && (
            <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">
              Draw on the PDF
            </span>
          )}
          {activeTool === "delete" && numPages > 0 && (
            <button
              onClick={() => {
                if (isCurrentDeleted) {
                  onRestorePage(pageNumber);
                } else if (visiblePages.length > 1) {
                  onDeletePage(pageNumber);
                } else {
                  alert("Cannot delete the last remaining page.");
                }
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                isCurrentDeleted
                  ? "bg-success/20 text-success hover:bg-success/30"
                  : "bg-danger/20 text-danger hover:bg-danger/30"
              }`}
            >
              <Trash2 size={14} />
              {isCurrentDeleted ? "Restore Page" : "Delete This Page"}
            </button>
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

      {/* PDF Page - ALWAYS mount Document so load can succeed */}
      <div className="flex-1 overflow-auto flex justify-center p-6 bg-background">
        {allDeleted ? (
          <div className="text-muted text-sm text-center">
            <p className="mb-2">All pages deleted.</p>
            <p className="text-xs">
              Switch to Delete Page tool and restore pages, or upload a new PDF.
            </p>
          </div>
        ) : (
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
            {numPages > 0 && (
              <div
                ref={pageRef}
                className={`relative shadow-2xl rounded-lg overflow-hidden ${cursorClass} ${
                  activeTool === "highlight" ? "select-text" : "select-none"
                } ${isCurrentDeleted ? "opacity-40" : ""}`}
                onClick={handlePageClick}
                onMouseDown={handleDrawStart}
                onMouseMove={handleDrawMove}
                onMouseUp={handleDrawEnd}
                onMouseLeave={handleDrawEnd}
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />

                {isCurrentDeleted && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-danger font-semibold text-lg bg-black/60 px-4 py-2 rounded-lg">
                      Page marked for deletion
                    </span>
                  </div>
                )}

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {pageAnnotations
                    .filter((a): a is DrawAnnotation => a.type === "draw")
                    .map((ann) => (
                      <path
                        key={ann.id}
                        d={pointsToSvgPath(ann.points)}
                        fill="none"
                        stroke={ann.color}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ strokeWidth: ann.strokeWidth }}
                      />
                    ))}

                  {currentStroke.length >= 2 && (
                    <path
                      d={pointsToSvgPath(currentStroke)}
                      fill="none"
                      stroke="#ef4444"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ strokeWidth: 2.5 }}
                    />
                  )}
                </svg>

                {pageAnnotations.map((ann) => {
                  if (ann.type === "draw") return null;

                  if (ann.type === "highlight") {
                    return (
                      <div
                        key={ann.id}
                        data-annotation
                        className="absolute group pointer-events-auto"
                        style={{
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: `${ann.width}%`,
                          height: `${ann.height}%`,
                          backgroundColor: ann.color,
                          opacity: 0.45,
                          mixBlendMode: "multiply",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10"
                          onClick={() => onDeleteAnnotation(ann.id)}
                        >
                          ×
                        </button>
                      </div>
                    );
                  }

                  return (
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
                          onChange={(e) =>
                            onUpdateAnnotation(ann.id, e.target.value)
                          }
                          onBlur={() => {
                            if (!ann.text.trim()) onDeleteAnnotation(ann.id);
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (!ann.text.trim()) onDeleteAnnotation(ann.id);
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

                      {editingId !== ann.id && (
                        <button
                          className="absolute -top-2 -right-2 w-5 h-5 bg-danger text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          onClick={() => onDeleteAnnotation(ann.id)}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Document>
        )}
      </div>
    </div>
  );
}
