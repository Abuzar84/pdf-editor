"use client";

import { useState, useCallback } from "react";
import {
  FileUp,
  FileText,
  Download,
  Trash2,
  Type,
  Highlighter,
  PenTool,
  X,
} from "lucide-react";
import PDFViewer from "@/components/PDFViewer";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((selectedFile: File) => {
    if (selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      alert("Please upload a PDF file only.");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="text-primary" size={22} />
            <h1 className="font-bold text-lg">
              PDF <span className="gradient-text">Editor</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {file && (
              <>
                <button
                  onClick={clearFile}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:border-white/20 text-sm text-muted hover:text-white transition-all"
                >
                  <X size={16} />
                  Close
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium transition-all glow-purple">
                  <Download size={16} />
                  Download
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar - Tools */}
        <aside className="w-16 md:w-56 border-r border-white/5 bg-surface/30 p-3 flex flex-col gap-2 shrink-0">
          <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2 hidden md:block">
            Tools
          </p>

          <ToolButton icon={<Type size={18} />} label="Add Text" active={false} />
          <ToolButton icon={<Highlighter size={18} />} label="Highlight" active={false} />
          <ToolButton icon={<PenTool size={18} />} label="Draw" active={false} />
          <ToolButton icon={<Trash2 size={18} />} label="Delete Page" active={false} />
        </aside>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden">
          {!file ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="w-full max-w-lg">
                <label
                  htmlFor="pdf-upload"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={`flex flex-col items-center justify-center w-full h-72 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
                    isDragging
                      ? "border-primary bg-primary/10"
                      : "border-white/10 hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <FileUp className="text-primary" size={28} />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-medium mb-1">Upload PDF</p>
                      <p className="text-sm text-muted">
                        Drag & drop or click to select a PDF file
                      </p>
                    </div>
                  </div>
                  <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
          ) : (
            <PDFViewer file={file} />
          )}
        </div>
      </main>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <button
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
        active
          ? "bg-primary/20 text-primary"
          : "text-muted hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
