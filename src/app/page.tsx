"use client";

import { useState } from "react";
import { FileUp, FileText, Download, Trash2, Type, Highlighter, PenTool } from "lucide-react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
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
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-sm font-medium transition-all glow-purple">
                <Download size={16} />
                Download
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {/* Sidebar - Tools */}
        <aside className="w-16 md:w-56 border-r border-white/5 bg-surface/30 p-3 flex flex-col gap-2">
          <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2 hidden md:block">
            Tools
          </p>

          <ToolButton icon={<Type size={18} />} label="Add Text" />
          <ToolButton icon={<Highlighter size={18} />} label="Highlight" />
          <ToolButton icon={<PenTool size={18} />} label="Draw" />
          <ToolButton icon={<Trash2 size={18} />} label="Delete Page" />
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex items-center justify-center p-6">
          {!file ? (
            <div className="w-full max-w-lg">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center w-full h-72 border-2 border-dashed border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer group"
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
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="text-primary" size={32} />
              </div>
              <p className="text-lg font-medium mb-1">{file.name}</p>
              <p className="text-sm text-muted mb-6">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-muted text-sm">
                PDF Viewer + Annotation tools coming next...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function ToolButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-all text-sm">
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}
