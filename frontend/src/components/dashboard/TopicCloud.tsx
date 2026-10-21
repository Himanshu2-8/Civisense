"use client";

import React from "react";
import { TopicBreakdown } from "@/types/analysis";
import { Tag } from "lucide-react";

interface TopicCloudProps {
  topics: TopicBreakdown[];
}

export const TopicCloud: React.FC<TopicCloudProps> = ({ topics }) => {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Tag className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">
            Topic & Issue Discovery
          </h3>
          <p className="text-xs text-slate-400">
            High-frequency thematic clusters detected across submissions
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {topics.map((t) => (
          <div
            key={t.topic}
            className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs transition hover:border-slate-700"
          >
            <span className="font-medium text-slate-200">{t.topic}</span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              {t.count} ({t.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
