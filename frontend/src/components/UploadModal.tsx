"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadAndAnalyze: (file: File) => Promise<void>;
  onLoadSample: () => void;
  isAnalyzing: boolean;
  analysisStep: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadAndAnalyze,
  onLoadSample,
  isAnalyzing,
  analysisStep,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: isAnalyzing,
    onDrop: (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError("Please upload a valid PDF document.");
        return;
      }
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setError(null);
      }
    },
  });

  if (!isOpen) return null;

  const handleStart = async () => {
    if (!selectedFile) return;
    try {
      setError(null);
      await onUploadAndAnalyze(selectedFile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze document";
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0f172a] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <UploadCloud className="h-5 w-5 text-emerald-400" />
              Upload Consultation Document
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Analyze public comments, legal clauses, and stakeholder consensus.
            </p>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="mt-5 space-y-4">
          {!isAnalyzing ? (
            <>
              {/* Dropzone */}
              <div
                {...getRootProps()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition cursor-pointer ${
                  isDragActive
                    ? "border-emerald-500 bg-emerald-500/10"
                    : selectedFile
                    ? "border-emerald-500/50 bg-slate-900/80"
                    : "border-slate-700 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60"
                }`}
              >
                <input {...getInputProps()} />

                {selectedFile ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • PDF Document
                      </p>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">
                      Click or drag another file to replace
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Drop your consultation PDF here, or{" "}
                        <span className="text-emerald-400 underline">browse</span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Supports Ministry notifications, public comments, and regulatory feedback
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-rose-500/10 border border-rose-500/20 px-3 py-2 text-xs text-rose-300">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Sample Trigger */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-200">
                      No document at hand?
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Try our MCA Companies Act consultation benchmark
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onLoadSample();
                    onClose();
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition"
                >
                  Load Demo PDF
                </button>
              </div>
            </>
          ) : (
            /* Analysis Pipeline Status */
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 space-y-5">
              <div className="flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
              </div>

              <div className="text-center space-y-1">
                <h4 className="text-sm font-semibold text-white">
                  AI Consultation Processing Pipeline Active
                </h4>
                <p className="text-xs text-emerald-400 font-medium">
                  {analysisStep || "Extracting stakeholder comments..."}
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>PDF Document Parsing & Chunking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>LLM Stakeholder & Clause Extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Sentiment Classification & Confidence Scoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Consensus & Policy Matrix Synthesis</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isAnalyzing && (
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              disabled={!selectedFile}
              onClick={handleStart}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 transition"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Run AI Analysis</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
