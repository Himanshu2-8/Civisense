"use client";

import React from "react";
import { ConsensusData } from "@/types/analysis";
import { CheckCircle2, AlertTriangle, Lightbulb, Compass } from "lucide-react";

interface ConsensusMatrixProps {
  consensus: ConsensusData;
}

export const ConsensusMatrix: React.FC<ConsensusMatrixProps> = ({ consensus }) => {
  const agreements = consensus.agreements || [];
  const disagreements = consensus.disagreements || [];
  const recommendations = consensus.recommendations || [];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
          <Compass className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Consensus & Policy Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Synthesized areas of consensus, primary friction points, and actionable amendments
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Agreements */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>Shared Agreements ({agreements.length})</span>
          </div>
          <div className="space-y-2">
            {agreements.length > 0 ? (
              agreements.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-emerald-500/10 bg-slate-950/60 p-2.5 text-xs text-slate-200 leading-relaxed"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No universal agreements detected.</p>
            )}
          </div>
        </div>

        {/* Disagreements */}
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Friction Points ({disagreements.length})</span>
          </div>
          <div className="space-y-2">
            {disagreements.length > 0 ? (
              disagreements.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-rose-500/10 bg-slate-950/60 p-2.5 text-xs text-slate-200 leading-relaxed"
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No major contention areas identified.</p>
            )}
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
            <Lightbulb className="h-4 w-4 flex-shrink-0" />
            <span>Recommended Actions ({recommendations.length})</span>
          </div>
          <div className="space-y-2">
            {recommendations.length > 0 ? (
              recommendations.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-sky-500/10 bg-slate-950/60 p-2.5 text-xs text-slate-200 leading-relaxed flex items-start gap-2"
                >
                  <span className="font-bold text-sky-400 flex-shrink-0 mt-0.5">•</span>
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No specific recommendations extracted.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
