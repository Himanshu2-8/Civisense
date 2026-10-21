"use client";

import React, { useState, useMemo } from "react";
import { CommentItem } from "@/types/analysis";
import {
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  Smile,
  Frown,
  MinusCircle,
  Tag,
  Scale,
} from "lucide-react";

interface CommentExplorerProps {
  comments: CommentItem[];
  selectedStakeholder: string | null;
  selectedClause: string | null;
  onClearFilters: () => void;
}

export const CommentExplorer: React.FC<CommentExplorerProps> = ({
  comments,
  selectedStakeholder,
  selectedClause,
  onClearFilters,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const filteredComments = useMemo(() => {
    return comments.filter((c) => {
      // Stakeholder filter
      if (selectedStakeholder && c.stakeholder_type !== selectedStakeholder) {
        return false;
      }
      // Clause filter
      if (selectedClause && c.clause !== selectedClause) {
        return false;
      }
      // Sentiment filter
      if (sentimentFilter !== "all" && c.sentiment !== sentimentFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const contentMatch = c.content?.toLowerCase().includes(query);
        const topicMatch = c.topic?.toLowerCase().includes(query);
        const issueMatch = c.canonical_issue?.toLowerCase().includes(query);
        const recMatch = c.recommendation?.toLowerCase().includes(query);
        if (!contentMatch && !topicMatch && !issueMatch && !recMatch) {
          return false;
        }
      }
      return true;
    });
  }, [comments, selectedStakeholder, selectedClause, sentimentFilter, searchQuery]);

  const hasActiveFilters = Boolean(
    selectedStakeholder || selectedClause || sentimentFilter !== "all" || searchQuery
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Consultation Submissions Explorer
            </h3>
            <p className="text-xs text-slate-400">
              Search, filter, and inspect verified stakeholder comments and recommendations
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Showing {filteredComments.length} of {comments.length}
        </span>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search keywords, recommendations, or issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none transition"
          />
        </div>

        {/* Sentiment Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800 text-xs">
          {["all", "positive", "neutral", "negative"].map((s) => (
            <button
              key={s}
              onClick={() => setSentimentFilter(s)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition ${
                sentimentFilter === s
                  ? s === "positive"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : s === "negative"
                    ? "bg-rose-500 text-white shadow"
                    : s === "neutral"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "bg-slate-700 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSentimentFilter("all");
              onClearFilters();
            }}
            className="text-xs text-rose-400 hover:text-rose-300 transition whitespace-nowrap self-center font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Active Filter Tags */}
      {(selectedStakeholder || selectedClause) && (
        <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
          <span>Active Filters:</span>
          {selectedStakeholder && (
            <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-teal-300 flex items-center gap-1 text-[11px]">
              Stakeholder: {selectedStakeholder}
            </span>
          )}
          {selectedClause && (
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-300 flex items-center gap-1 text-[11px]">
              Clause: {selectedClause}
            </span>
          )}
        </div>
      )}

      {/* Comment Cards */}
      <div className="space-y-3 pt-1">
        {filteredComments.length > 0 ? (
          filteredComments.map((comment) => {
            const sentiment = comment.sentiment || "neutral";
            const sentimentColor =
              sentiment === "positive"
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : sentiment === "negative"
                ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                : "text-amber-400 bg-amber-500/10 border-amber-500/20";

            const SentimentIcon =
              sentiment === "positive"
                ? Smile
                : sentiment === "negative"
                ? Frown
                : MinusCircle;

            return (
              <div
                key={comment.id}
                className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 transition hover:border-slate-700/80 space-y-3"
              >
                {/* Meta row */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-xs text-white">
                      {comment.stakeholder_type}
                    </span>
                    {comment.clause && (
                      <span className="flex items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 font-medium">
                        <Scale className="h-3 w-3 text-emerald-400" />
                        {comment.clause}
                      </span>
                    )}
                    {comment.topic && (
                      <span className="flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-400">
                        <Tag className="h-2.5 w-2.5" />
                        {comment.topic}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${sentimentColor}`}
                    >
                      <SentimentIcon className="h-3 w-3" />
                      {sentiment}
                    </span>
                    {comment.sentiment_score && (
                      <span className="text-[10px] text-slate-500">
                        {(comment.sentiment_score * 100).toFixed(0)}% conf
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs leading-relaxed text-slate-200">
                  {comment.content}
                </p>

                {/* Recommendation Callout */}
                {comment.recommendation && (
                  <div className="flex items-start gap-2 rounded-lg border border-emerald-500/15 bg-emerald-500/5 p-2.5 text-[11px] text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-emerald-400">
                        Stakeholder Recommendation:{" "}
                      </span>
                      <span>{comment.recommendation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-slate-400">
            <p className="text-sm font-medium">No comments match the selected filters.</p>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search query or reset active filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
