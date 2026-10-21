"use client";

import React from "react";
import { DocumentItem } from "@/types/analysis";
import {
  FileText,
  Upload,
  Sparkles,
  ChevronDown,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface NavbarProps {
  documents: DocumentItem[];
  selectedDocId: string | null;
  onSelectDoc: (id: string) => void;
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onDeleteDoc: (id: string) => void;
  backendOnline: boolean;
  isAnalyzing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  documents,
  selectedDocId,
  onSelectDoc,
  onOpenUpload,
  onLoadSample,
  onDeleteDoc,
  backendOnline,
  isAnalyzing,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const currentDoc = documents.find((d) => d.document_id === selectedDocId);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0b0f19]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white">
                Civi<span className="text-emerald-400">Sense</span>
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                v1.0 AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Legislative Consultation & Stakeholder Analytics
            </p>
          </div>
        </div>

        {/* Center: Document selector */}
        <div className="flex items-center gap-3">
          {documents.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-400" />
                <span className="max-w-[160px] truncate sm:max-w-[220px]">
                  {currentDoc ? currentDoc.filename : "Select Consultation"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl backdrop-blur-xl z-50">
                  <div className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Consultation Documents
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {documents.map((doc) => (
                      <div
                        key={doc.document_id}
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition ${
                          doc.document_id === selectedDocId
                            ? "bg-emerald-500/15 text-emerald-300 font-medium border border-emerald-500/30"
                            : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <button
                          onClick={() => {
                            onSelectDoc(doc.document_id);
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 truncate text-left flex-1"
                        >
                          <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate">{doc.filename}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDoc(doc.document_id);
                          }}
                          title="Delete document"
                          className="text-slate-500 hover:text-rose-400 p-1 transition"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Backend Status indicator */}
          <div
            className="hidden md:flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-900/60 px-2.5 py-1 text-[11px] text-slate-400"
            title={backendOnline ? "Backend is running and connected" : "Backend unreachable"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                backendOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{backendOnline ? "Engine Ready" : "Connecting..."}</span>
          </div>

          <button
            onClick={onLoadSample}
            disabled={isAnalyzing}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Load Demo PDF</span>
          </button>

          <button
            onClick={onOpenUpload}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
