"use client";

import React from "react";
import { SentimentOverview } from "@/types/analysis";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Smile, Frown, MinusCircle } from "lucide-react";

interface SentimentChartProps {
  overview: SentimentOverview;
}

export const SentimentChart: React.FC<SentimentChartProps> = ({ overview }) => {
  const chartData = [
    {
      name: "Positive Support",
      value: overview.positive,
      pct: overview.positive_pct,
      color: "#10b981", // Emerald 500
    },
    {
      name: "Neutral / Inquiries",
      value: overview.neutral,
      pct: overview.neutral_pct,
      color: "#f59e0b", // Amber 500
    },
    {
      name: "Concerns / Negative",
      value: overview.negative,
      pct: overview.negative_pct,
      color: "#f43f5e", // Rose 500
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg flex flex-col justify-between">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Stakeholder Sentiment Breakdown
          </h3>
          <p className="text-xs text-slate-400">
            Automated sentiment classification & confidence weighting
          </p>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {overview.total} Comments
        </span>
      </div>

      {/* Donut Chart & Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4 py-4">
        <div className="relative h-44 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-slate-700 bg-slate-900 p-2 text-xs shadow-xl text-slate-200">
                        <span className="font-semibold">{data.name}: </span>
                        <span>{data.value} comments ({data.pct}%)</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={68}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-lg font-bold text-white">
              {overview.total}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-slate-400">
              Total
            </span>
          </div>
        </div>

        {/* Legend with progress indicators */}
        <div className="space-y-3">
          {/* Positive */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <Smile className="h-3.5 w-3.5" />
                Positive Support
              </span>
              <span className="text-slate-300 font-semibold">
                {overview.positive} ({overview.positive_pct}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${overview.positive_pct}%` }}
              />
            </div>
          </div>

          {/* Neutral */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-amber-400">
                <MinusCircle className="h-3.5 w-3.5" />
                Neutral / Balanced
              </span>
              <span className="text-slate-300 font-semibold">
                {overview.neutral} ({overview.neutral_pct}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-amber-500"
                style={{ width: `${overview.neutral_pct}%` }}
              />
            </div>
          </div>

          {/* Negative */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-rose-400">
                <Frown className="h-3.5 w-3.5" />
                Concerns Raised
              </span>
              <span className="text-slate-300 font-semibold">
                {overview.negative} ({overview.negative_pct}%)
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-rose-500"
                style={{ width: `${overview.negative_pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
