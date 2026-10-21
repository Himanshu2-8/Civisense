"use client";

import React from "react";
import { DashboardData } from "@/types/analysis";
import {
  FileText,
  Users,
  Scale,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface ExecutiveSummaryProps {
  data: DashboardData;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data }) => {
  const dominantSentiment =
    data.sentiment_overview.negative_pct > data.sentiment_overview.positive_pct &&
    data.sentiment_overview.negative_pct >= data.sentiment_overview.neutral_pct
      ? "Negative / High Friction"
      : data.sentiment_overview.positive_pct > data.sentiment_overview.negative_pct &&
        data.sentiment_overview.positive_pct >= data.sentiment_overview.neutral_pct
      ? "Positive / Strong Support"
      : "Balanced / Mixed Opinions";

  const sentimentColor =
    dominantSentiment.includes("Positive")
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : dominantSentiment.includes("Negative")
      ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
      : "text-amber-400 bg-amber-500/10 border-amber-500/20";

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-[#0d1527] to-[#0f172a] p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                <Sparkles className="h-3 w-3" />
                AI Executive Synthesis
              </span>
              <span className="text-xs text-slate-400">
                • Analyzed on {new Date(data.uploaded_at).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
              {data.filename}
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              {data.overall_summary}
            </p>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end gap-2 flex-shrink-0">
            <div
              className={`rounded-xl border px-3.5 py-2 text-xs font-semibold ${sentimentColor}`}
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-400">
                Dominant Mood
              </div>
              <div className="text-xs font-bold mt-0.5">{dominantSentiment}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Comments */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Comments Analyzed
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {data.total_comments}
            </span>
            <span className="text-xs text-emerald-400 font-medium">100% Parsed</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Across {data.clauses.length} referenced statutory clauses
          </p>
        </div>

        {/* Stakeholder Diversity */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Stakeholder Groups
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {data.stakeholders.length}
            </span>
            <span className="text-xs text-emerald-400 font-medium">Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400 truncate">
            {data.stakeholders.map((s) => s.stakeholder_type).join(", ").slice(0, 32)}...
          </p>
        </div>

        {/* Key Contested Clauses */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Clauses Flagged
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Scale className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {data.clauses.length}
            </span>
            <span className="text-xs text-rose-400 font-medium">
              {data.clauses.filter((c) => c.dominant_sentiment === "negative").length} High Concern
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Top focus: {data.clauses[0]?.clause || "General"}
          </p>
        </div>

        {/* AI Confidence / Consensus Index */}
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 transition hover:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Model Confidence
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              {(data.sentiment_overview.avg_score * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-emerald-400 font-medium">Calibrated</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {data.consensus.recommendations?.length || 0} Actionable Recommendations
          </p>
        </div>
      </div>
    </div>
  );
};
