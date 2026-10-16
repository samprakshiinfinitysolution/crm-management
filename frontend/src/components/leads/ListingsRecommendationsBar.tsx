"use client";

import React from "react";

interface ListingsRecommendationsBarProps {
  activePill: string;
  onPillChange: (pill: string) => void;
  counts: {
    all: number;
    stock: number;
    minOq: number;
  };
}

export function ListingsRecommendationsBar({
  activePill,
  onPillChange,
  counts,
}: ListingsRecommendationsBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
      <span className="font-semibold text-slate-800 dark:text-slate-200">
        Listings Recommendations:
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {/* All Listings Pill */}
        <button
          type="button"
          onClick={() => onPillChange("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            activePill === "all"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] dark:text-blue-300 border-[#2874f0] font-semibold shadow-2xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          All Listings <span className="font-bold ml-1">{counts.all}</span>
        </button>

        {/* Stock Pill */}
        <button
          type="button"
          onClick={() => onPillChange("stock")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            activePill === "stock"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] dark:text-blue-300 border-[#2874f0] font-semibold shadow-2xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          Stock <span className="font-bold ml-1">{counts.stock}</span>
        </button>

        {/* Minimum Order Quantity (MinOQ) Pill */}
        <button
          type="button"
          onClick={() => onPillChange("minOq")}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
            activePill === "minOq"
              ? "bg-[#f2f7fe] dark:bg-blue-950/60 text-[#2874f0] dark:text-blue-300 border-[#2874f0] font-semibold shadow-2xs"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-[#e0e0e0] dark:border-slate-800 hover:border-slate-400"
          }`}
        >
          Minimum Order Quantity (MinOQ) <span className="font-bold ml-1">{counts.minOq}</span>
        </button>
      </div>
    </div>
  );
}
