"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DocumentItem, DashboardData } from "@/types/analysis";
import { api } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { UploadModal } from "@/components/UploadModal";
import { ExecutiveSummary } from "@/components/dashboard/ExecutiveSummary";
import { SentimentChart } from "@/components/dashboard/SentimentChart";
import { ClauseTable } from "@/components/dashboard/ClauseTable";
import { StakeholderView } from "@/components/dashboard/StakeholderView";
import { ConsensusMatrix } from "@/components/dashboard/ConsensusMatrix";
import { CommentExplorer } from "@/components/dashboard/CommentExplorer";
import { TopicCloud } from "@/components/dashboard/TopicCloud";
import {
  UploadCloud,
  Sparkles,
  FileText,
  Scale,
  Users,
  Compass,
  MessageSquare,
  Loader2,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  const [loadingDocs, setLoadingDocs] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(false);

  // Filters
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(null);
  const [selectedClause, setSelectedClause] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "clauses" | "stakeholders" | "consensus" | "comments"
  >("overview");

  // Load document list
  const loadDocuments = useCallback(async () => {
    try {
      const docs = await api.listDocuments();
      setDocuments(docs);
      setBackendOnline(true);
      return docs;
    } catch {
      setBackendOnline(false);
      return [];
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  // Load dashboard for selected document
  const loadDashboard = useCallback(async (docId: string) => {
    setLoadingDashboard(true);
    try {
      try {
        const data = await api.getDashboard(docId);
        setDashboardData(data);
      } catch (err: unknown) {
        // If analysis hasn't been generated yet for this doc, run analysis automatically
        const isNotFound = err && typeof err === "object" && "response" in err && (err as { response?: { status?: number } }).response?.status === 404;
        if (isNotFound) {
          setIsAnalyzing(true);
          setAnalysisStep("Running consultation analysis pipeline...");
          await api.startAnalysis(docId);
          const data = await api.getDashboard(docId);
          setDashboardData(data);
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setDashboardData(null);
    } finally {
      setLoadingDashboard(false);
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDocuments().then((docs) => {
      if (docs.length > 0) {
        setSelectedDocId(docs[0].document_id);
        loadDashboard(docs[0].document_id);
      }
    });
  }, [loadDocuments, loadDashboard]);

  // Handle select doc
  const handleSelectDoc = (id: string) => {
    setSelectedDocId(id);
    setSelectedStakeholder(null);
    setSelectedClause(null);
    loadDashboard(id);
  };

  // Upload and analyze flow
  const handleUploadAndAnalyze = async (file: File) => {
    setIsAnalyzing(true);
    try {
      setAnalysisStep("Step 1/3: Uploading consultation document...");
      const uploadedDoc = await api.uploadDocument(file);

      setAnalysisStep("Step 2/3: Extracting clauses, sentiment & stakeholder comments...");
      await api.startAnalysis(uploadedDoc.document_id);

      setAnalysisStep("Step 3/3: Synthesizing consensus & generating dashboard...");
      const dash = await api.getDashboard(uploadedDoc.document_id);

      const docs = await api.listDocuments();
      setDocuments(docs);
      setSelectedDocId(uploadedDoc.document_id);
      setDashboardData(dash);
      setUploadModalOpen(false);
    } catch (err: unknown) {
      console.error("Analysis pipeline error:", err);
      const message = err instanceof Error ? err.message : "Analysis failed";
      throw new Error(message);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  // One-click demo benchmark loader
  const handleLoadSample = async () => {
    try {
      setIsAnalyzing(true);
      setUploadModalOpen(true);
      setAnalysisStep("Loading sample MCA consultation document...");
      const res = await fetch("/sample_consultation.pdf");
      const blob = await res.blob();
      const sampleFile = new File([blob], "mca_companies_amendment_2026.pdf", {
        type: "application/pdf",
      });
      await handleUploadAndAnalyze(sampleFile);
    } catch (err) {
      console.error("Failed to load sample:", err);
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  // Delete document
  const handleDeleteDoc = async (id: string) => {
    try {
      await api.deleteDocument(id);
      const updated = documents.filter((d) => d.document_id !== id);
      setDocuments(updated);
      if (selectedDocId === id) {
        if (updated.length > 0) {
          setSelectedDocId(updated[0].document_id);
          loadDashboard(updated[0].document_id);
        } else {
          setSelectedDocId(null);
          setDashboardData(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  // Export report as JSON/Print
  const handleExport = () => {
    if (!dashboardData) return;
    window.print();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f19] text-slate-100 antialiased selection:bg-emerald-500 selection:text-black">
      {/* Navbar */}
      <Navbar
        documents={documents}
        selectedDocId={selectedDocId}
        onSelectDoc={handleSelectDoc}
        onOpenUpload={() => setUploadModalOpen(true)}
        onLoadSample={handleLoadSample}
        onDeleteDoc={handleDeleteDoc}
        backendOnline={backendOnline}
        isAnalyzing={isAnalyzing}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          {/* Loading initial documents state */}
          {loadingDocs ? (
            <div className="flex h-96 flex-col items-center justify-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-sm font-medium text-slate-400">
                Connecting to CiviSense Engine...
              </p>
            </div>
          ) : dashboardData ? (
            /* Active Dashboard View */
            <div className="space-y-6">
              {/* Executive Summary & KPI metrics */}
              <ExecutiveSummary data={dashboardData} />

              {/* Navigation Tabs & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {[
                    { id: "overview", label: "Executive Overview", icon: Sparkles },
                    { id: "clauses", label: "Clause Intelligence", icon: Scale },
                    { id: "stakeholders", label: "Stakeholders", icon: Users },
                    { id: "consensus", label: "Consensus Matrix", icon: Compass },
                    { id: "comments", label: "Submissions Explorer", icon: MessageSquare },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => selectedDocId && loadDashboard(selectedDocId)}
                    disabled={loadingDashboard}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${loadingDashboard ? "animate-spin" : ""}`} />
                    <span>Refresh</span>
                  </button>

                  <button
                    onClick={handleExport}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition"
                  >
                    <Download className="h-3 w-3" />
                    <span>Export / Print</span>
                  </button>
                </div>
              </div>

              {/* Tab Content Display */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Row 1: Sentiment breakdown + Topic Discovery */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SentimentChart overview={dashboardData.sentiment_overview} />
                    <TopicCloud topics={dashboardData.topics} />
                  </div>

                  {/* Row 2: Clause Intelligence */}
                  <ClauseTable
                    clauses={dashboardData.clauses}
                    selectedClause={selectedClause}
                    onSelectClause={(c) => {
                      setSelectedClause(c);
                      setActiveTab("comments");
                    }}
                  />

                  {/* Row 3: Consensus Matrix */}
                  <ConsensusMatrix consensus={dashboardData.consensus} />
                </div>
              )}

              {activeTab === "clauses" && (
                <div className="space-y-6">
                  <ClauseTable
                    clauses={dashboardData.clauses}
                    selectedClause={selectedClause}
                    onSelectClause={(c) => {
                      setSelectedClause(c);
                      setActiveTab("comments");
                    }}
                  />
                  {/* Topic breakdown */}
                  <TopicCloud topics={dashboardData.topics} />
                </div>
              )}

              {activeTab === "stakeholders" && (
                <div className="space-y-6">
                  <StakeholderView
                    stakeholders={dashboardData.stakeholders}
                    selectedStakeholder={selectedStakeholder}
                    onSelectStakeholder={(st) => {
                      setSelectedStakeholder(st);
                      setActiveTab("comments");
                    }}
                  />
                </div>
              )}

              {activeTab === "consensus" && (
                <div className="space-y-6">
                  <ConsensusMatrix consensus={dashboardData.consensus} />
                </div>
              )}

              {activeTab === "comments" && (
                <div className="space-y-6">
                  <CommentExplorer
                    comments={dashboardData.comments}
                    selectedStakeholder={selectedStakeholder}
                    selectedClause={selectedClause}
                    onClearFilters={() => {
                      setSelectedStakeholder(null);
                      setSelectedClause(null);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Empty State / Welcome Hero */
            <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-2xl" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/30 bg-gradient-to-tr from-slate-900 to-slate-800 text-emerald-400 shadow-2xl">
                  <Scale className="h-10 w-10" />
                </div>
              </div>

              <h1 className="max-w-xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                AI-Powered Legislative Consultation Analysis
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-slate-400">
                Transform hundreds of pages of stakeholder feedback, legal representations,
                and regulatory submissions into clause-level insights, sentiment intelligence, and policy consensus.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-400"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Upload Consultation PDF</span>
                </button>

                <button
                  onClick={handleLoadSample}
                  className="flex h-11 items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-6 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Try Demo Consultation PDF</span>
                </button>
              </div>

              {/* Feature Highlights Grid */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl text-left">
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 mb-2">
                    <Scale className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">
                    Clause-Level Intelligence
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Automatically extracts citations like Section 135(5) and tracks sentiment per clause.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 mb-2">
                    <Users className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">
                    Stakeholder Categorization
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Separates perspectives from Chartered Accountants, Corporate Lawyers, Industry, and Citizens.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 mb-2">
                    <Compass className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-semibold text-white">
                    Consensus Generation
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Identifies common agreements, points of friction, and actionable policy amendments.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Upload & Pipeline Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadAndAnalyze={handleUploadAndAnalyze}
        onLoadSample={handleLoadSample}
        isAnalyzing={isAnalyzing}
        analysisStep={analysisStep}
      />
    </div>
  );
}
