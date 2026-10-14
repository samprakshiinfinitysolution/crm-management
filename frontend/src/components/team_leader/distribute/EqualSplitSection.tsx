"use client";

import React, { useState, useMemo } from "react";
import { CheckSquare, Square, Info, AlertCircle } from "lucide-react";
import { SalesExecutiveSummary } from "@/types/api.types";

interface EqualSplitSectionProps {
  executives: SalesExecutiveSummary[];
  selectedExecutiveIds: string[];
  onToggleExecutive: (id: string) => void;
  onSelectAllExecutives: () => void;
  onDeselectAllExecutives: () => void;
  totalUnassignedCount: number;
  quantity: number;
  onQuantityChange: (qty: number) => void;
}

export const EqualSplitSection: React.FC<EqualSplitSectionProps> = ({
  executives,
  selectedExecutiveIds,
  onToggleExecutive,
  onSelectAllExecutives,
  onDeselectAllExecutives,
  totalUnassignedCount,
  quantity,
  onQuantityChange,
}) => {
  const [isCustomQty, setIsCustomQty] = useState(false);
  const [customInputVal, setCustomInputVal] = useState<string>(
    quantity > 0 ? String(quantity) : "",
  );

  // Compute preset options (e.g. 10, 20, 30, 50, and All Unassigned)
  const presetOptions = useMemo(() => {
    const base = [10, 20, 30, 50].filter((n) => n <= totalUnassignedCount);
    if (totalUnassignedCount > 0 && !base.includes(totalUnassignedCount)) {
      base.push(totalUnassignedCount);
    }
    return Array.from(new Set(base)).sort((a, b) => a - b);
  }, [totalUnassignedCount]);

  // Selected executives list
  const selectedExecs = useMemo(() => {
    return executives.filter((e) => selectedExecutiveIds.includes(e.id));
  }, [executives, selectedExecutiveIds]);

  const selectedCount = selectedExecs.length;

  // Manual input parsing & validation - only evaluate when custom mode is active and user has entered a value
  const parsedCustomQty = parseInt(customInputVal, 10);
  const isInputOverTotal =
    isCustomQty &&
    customInputVal.trim() !== "" &&
    !isNaN(parsedCustomQty) &&
    parsedCustomQty > totalUnassignedCount;
  const isInputUnderExecs =
    isCustomQty &&
    customInputVal.trim() !== "" &&
    !isNaN(parsedCustomQty) &&
    selectedCount > 0 &&
    parsedCustomQty > 0 &&
    parsedCustomQty < selectedCount;

  // Mathematical Distribution Calculation (No lead records)
  const effectiveQty = isInputOverTotal ? 0 : quantity;
  const baseCount =
    selectedCount > 0 && effectiveQty > 0
      ? Math.floor(effectiveQty / selectedCount)
      : 0;
  const remainder =
    selectedCount > 0 && effectiveQty > 0 ? effectiveQty % selectedCount : 0;

  const distributionPreview = useMemo(() => {
    return selectedExecs.map((exec, index) => {
      const allocated = baseCount + (index < remainder ? 1 : 0);
      return {
        id: exec.id,
        name: exec.name,
        allocated,
      };
    });
  }, [selectedExecs, baseCount, remainder]);

  const handleSelectPreset = (val: number) => {
    setIsCustomQty(false);
    onQuantityChange(val);
    setCustomInputVal(String(val));
  };

  const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setCustomInputVal(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      onQuantityChange(parsed);
    } else if (raw === "") {
      onQuantityChange(0);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "SE";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const isAllSelected =
    executives.length > 0 && selectedExecutiveIds.length === executives.length;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* 1. EXECUTIVE SELECTED / TABLE (First in Step 2) */}
      <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Selected Sales Executives
            </h2>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
              Executives who will receive an equal portion of the leads.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {selectedCount} executives selected
            </span>
            <button
              type="button"
              onClick={
                isAllSelected ? onDeselectAllExecutives : onSelectAllExecutives
              }
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
            >
              {isAllSelected ? "Deselect All" : "Select All"}
            </button>
          </div>
        </div>

        {/* Compact List of Selected/Available Executives */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-4">
          {executives.map((exec) => {
            const isSelected = selectedExecutiveIds.includes(exec.id);

            return (
              <div
                key={exec.id}
                onClick={() => onToggleExecutive(exec.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-blue-50/50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 shadow-2xs"
                    : "bg-card border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                }`}
              >
                {/* Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExecutive(exec.id);
                  }}
                  className="text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                  )}
                </button>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(exec.name)}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {exec.name}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                    {exec.totalAssignedLeads ?? exec.activeLeads ?? 0} currently assigned
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. LEAD QUANTITY & POOL (Then Lead) */}
      <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs flex flex-col gap-3">
        {/* Unassigned Leads Pool Summary */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              Unassigned Leads Pool
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight mt-0.5">
              {totalUnassignedCount.toLocaleString()}
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-0.5">
              Available for equal split distribution
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
              Distribution Engine
            </span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-100 dark:border-blue-800 mt-1">
              Equal Division Algorithm
            </span>
          </div>
        </div>

        {/* Lead Quantity Control */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                How many leads do you want to distribute?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose a preset option or enter a custom number from available unassigned leads.
              </p>
            </div>
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${
                isInputOverTotal
                  ? "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                  : isInputUnderExecs
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                    : quantity > 0
                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800"
                      : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700"
              }`}
            >
              {quantity > 0
                ? `Selected: ${quantity} leads`
                : "No quantity selected"}
            </span>
          </div>

          {/* Quantity Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {presetOptions.map((preset) => {
              const isSelected = !isCustomQty && quantity === preset;

              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {preset === totalUnassignedCount
                    ? `All (${preset})`
                    : `${preset} Leads`}
                </button>
              );
            })}

            {/* Custom Option Toggle */}
            <button
              type="button"
              onClick={() => setIsCustomQty(true)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                isCustomQty
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-card text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              Custom Number
            </button>

            {/* Custom Numeric Input */}
            {isCustomQty && (
              <div className="flex items-center gap-2 pl-1">
                <input
                  type="number"
                  min={1}
                  value={customInputVal}
                  onChange={handleCustomInputChange}
                  placeholder="Enter quantity"
                  className={`w-32 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border focus:outline-none focus:ring-2 bg-card text-slate-900 dark:text-slate-100 transition-all ${
                    isInputOverTotal
                      ? "border-rose-400 text-rose-700 dark:text-rose-300 focus:ring-rose-500 bg-rose-50/30 dark:bg-rose-950/30"
                      : isInputUnderExecs
                        ? "border-amber-400 text-amber-700 dark:text-amber-300 focus:ring-amber-500"
                        : "border-blue-300 dark:border-blue-700 text-slate-900 dark:text-slate-100 focus:ring-blue-500"
                  }`}
                />
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  of {totalUnassignedCount.toLocaleString()} max
                </span>
              </div>
            )}
          </div>

          {/* Over-capacity and under-capacity alert banners */}
          {isInputOverTotal && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs mt-3 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Quantity exceeds available leads</p>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-0.5">
                  You selected <strong>{parsedCustomQty} leads</strong>, but
                  only <strong>{totalUnassignedCount} unassigned leads</strong> exist in the pool. Please reduce your quantity to {totalUnassignedCount} or fewer.
                </p>
              </div>
            </div>
          )}

          {isInputUnderExecs && !isInputOverTotal && (
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs mt-3 animate-in fade-in-50">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  Lead quantity is less than selected executives
                </p>
                <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                  You selected <strong>{parsedCustomQty} leads</strong> for <strong>{selectedCount} executives</strong>. For equal distribution, each executive must receive at least 1 lead (minimum {selectedCount} leads required).
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. EQUAL DISTRIBUTION PREVIEW (Mathematical only) */}
      <div className="bg-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Distribution Preview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mathematical allocation summary across selected executives.
            </p>
          </div>
          {selectedCount > 0 && quantity > 0 && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200">
                {quantity} leads
              </span>
              <span>·</span>
              <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-800 dark:text-slate-200">
                {selectedCount} executives
              </span>
            </div>
          )}
        </div>

        {selectedCount === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
            Select sales executives above to preview equal distribution.
          </div>
        ) : quantity <= 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Please choose a preset option (e.g. 10, 20, 30, All) or enter a custom number above to preview equal distribution.
          </div>
        ) : (
          <div className="pt-3 flex flex-col gap-3">
            {/* Clean mathematical distribution summary */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden">
              {distributionPreview.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2.5 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                      {getInitials(item.name)}
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded">
                    {item.allocated} leads
                  </span>
                </div>
              ))}
            </div>

            {/* Remainder Explanation Note */}
            {remainder > 0 && (
              <div className="flex items-start gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-300">
                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {remainder} lead{remainder > 1 ? "s" : ""}
                  </span>{" "}
                  will be allocated to the first{" "}
                  {remainder === 1 ? "executive" : `${remainder} executives`}{" "}
                  based on the selected distribution order.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

