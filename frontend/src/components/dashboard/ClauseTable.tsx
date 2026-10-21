"use client";

import React from "react";
import { ClauseStat } from "@/types/analysis";
import { Scale, ChevronRight } from "lucide-react";

interface ClauseTableProps {
  clauses: ClauseStat[];
  selectedClause: string | null;
  onSelectClause: (clause: string | null) => void;
}

export const ClauseTable: React.FC<ClauseTableProps> = ({
  clauses,
  selectedClause,
  onSelectClause,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Scale className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Clause-Level Intelligence
            </h3>
            <p className="text-xs text-slate-400">
              Specific sections, provisions, and rules cited in stakeholder submissions
            </p>
          </div>
        </div>
        {selectedClause && (
          <button
            onClick={() => onSelectClause(null)}
            className="text-xs text-emerald-400 hover:underline"
          >
            Clear Filter
          </button>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-2.5 font-medium">Provision / Clause</th>
              <th className="pb-2.5 font-medium text-center">Mentions</th>
              <th className="pb-2.5 font-medium">Sentiment Split</th>
              <th className="pb-2.5 font-medium">Stance</th>
              <th className="pb-2.5 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {clauses.map((c) => {
              const isSelected = selectedClause === c.clause;
              const posPct = (c.positive / c.mention_count) * 100;
              const neuPct = (c.neutral / c.mention_count) * 100;
              const negPct = (c.negative / c.mention_count) * 100;

              return (
                <tr
                  key={c.clause}
                  onClick={() => onSelectClause(isSelected ? null : c.clause)}
                  className={`cursor-pointer transition ${
                    isSelected
                      ? "bg-emerald-500/10 text-emerald-300"
                      : "hover:bg-slate-800/50 text-slate-300"
                  }`}
                >
                  <td className="py-3 font-semibold text-white flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {c.clause}
                  </td>
                  <td className="py-3 text-center font-bold text-slate-200">
                    {c.mention_count}
                  </td>
                  <td className="py-3 w-40">
                    <div className="flex h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="bg-emerald-500"
                        style={{ width: `${posPct}%` }}
                        title={`Positive: ${c.positive}`}
                      />
                      <div
                        className="bg-amber-500"
                        style={{ width: `${neuPct}%` }}
                        title={`Neutral: ${c.neutral}`}
                      />
                      <div
                        className="bg-rose-500"
                        style={{ width: `${negPct}%` }}
                        title={`Negative: ${c.negative}`}
                      />
                    </div>
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                        c.dominant_sentiment === "positive"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : c.dominant_sentiment === "negative"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {c.dominant_sentiment === "negative"
                        ? "Friction Point"
                        : c.dominant_sentiment === "positive"
                        ? "Supported"
                        : "Mixed Feedback"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      className={`p-1 rounded transition ${
                        isSelected ? "text-emerald-400" : "text-slate-500 hover:text-white"
                      }`}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
