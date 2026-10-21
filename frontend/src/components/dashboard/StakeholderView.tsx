"use client";

import React from "react";
import { StakeholderBreakdown } from "@/types/analysis";
import { Users, Briefcase, Building2, BookOpen, User } from "lucide-react";

interface StakeholderViewProps {
  stakeholders: StakeholderBreakdown[];
  selectedStakeholder: string | null;
  onSelectStakeholder: (type: string | null) => void;
}

const getStakeholderIcon = (name: string) => {
  const low = name.toLowerCase();
  if (low.includes("accountant") || low.includes("ca")) return <Briefcase className="h-4 w-4" />;
  if (low.includes("lawyer") || low.includes("legal")) return <BookOpen className="h-4 w-4" />;
  if (low.includes("industry") || low.includes("commerce")) return <Building2 className="h-4 w-4" />;
  if (low.includes("citizen") || low.includes("public")) return <User className="h-4 w-4" />;
  return <Users className="h-4 w-4" />;
};

export const StakeholderView: React.FC<StakeholderViewProps> = ({
  stakeholders,
  selectedStakeholder,
  onSelectStakeholder,
}) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Stakeholder Perspectives
            </h3>
            <p className="text-xs text-slate-400">
              Summaries and sentiment distribution categorized by professional body
            </p>
          </div>
        </div>
        {selectedStakeholder && (
          <button
            onClick={() => onSelectStakeholder(null)}
            className="text-xs text-teal-400 hover:underline"
          >
            Show All Groups
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stakeholders.map((s) => {
          const isSelected = selectedStakeholder === s.stakeholder_type;

          return (
            <div
              key={s.stakeholder_type}
              onClick={() =>
                onSelectStakeholder(isSelected ? null : s.stakeholder_type)
              }
              className={`cursor-pointer rounded-xl border p-4 transition ${
                isSelected
                  ? "border-teal-500/50 bg-teal-500/10 shadow-lg shadow-teal-500/10"
                  : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-teal-400">
                  <div className="p-1.5 rounded-lg bg-slate-800">
                    {getStakeholderIcon(s.stakeholder_type)}
                  </div>
                  <span className="text-xs font-semibold text-white truncate">
                    {s.stakeholder_type}
                  </span>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
                  {s.count} {s.count === 1 ? "comment" : "comments"}
                </span>
              </div>

              {s.summary ? (
                <p className="mt-2 text-xs leading-relaxed text-slate-300 line-clamp-3">
                  {s.summary}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-400 italic">
                  Representations submitted regarding compliance timelines and procedures.
                </p>
              )}

              <div className="mt-3 flex items-center justify-between text-[11px] border-t border-slate-800/80 pt-2 text-slate-400">
                <span className="text-emerald-400">{s.positive} pos</span>
                <span className="text-amber-400">{s.neutral} neu</span>
                <span className="text-rose-400">{s.negative} neg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
