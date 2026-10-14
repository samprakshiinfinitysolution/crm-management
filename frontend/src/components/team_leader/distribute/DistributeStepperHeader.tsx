"use client";

import React from "react";
import { Check } from "lucide-react";

interface DistributeStepperHeaderProps {
  currentStep?: 1 | 2 | 3;
  onSelectStep?: (step: 1 | 2 | 3) => void;
  selectedExecCount?: number;
  totalExecCount?: number;
  selectedLeadCount?: number;
  activeMode?: string;
}

export const DistributeStepperHeader: React.FC<
  DistributeStepperHeaderProps
> = ({ currentStep = 1, onSelectStep }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* 1. Horizontal Stepper Card */}

      {/* 2. Page Structure Header */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold tracking-wider text-blue-600 dark:text-blue-400 uppercase">
          STEP {currentStep} OF 3
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {currentStep === 1 && "Select Sales Executives"}
          {currentStep === 2 && "Distribute Leads"}
          {currentStep === 3 && "Review & Confirm Distribution"}
        </h1>
        <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">
          {currentStep === 1 &&
            "Choose which sales executives will participate in this lead distribution."}
          {currentStep === 2 &&
            "Choose how you want to distribute the selected leads across your sales executives."}
          {currentStep === 3 &&
            "Review the selected executives and lead allocations before executing."}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between max-w-xl mx-auto relative">
          {/* Step 1: Select Executives */}
          <button
            type="button"
            onClick={() => onSelectStep?.(1)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                currentStep > 1
                  ? "bg-emerald-600 text-white"
                  : currentStep === 1
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-950/60"
                    : "bg-slate-100 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {currentStep > 1 ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                "1"
              )}
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 1
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                1. Select Reps
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep > 1
                    ? "text-emerald-600 dark:text-emerald-400"
                    : currentStep === 1
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {currentStep > 1
                  ? "Completed"
                  : currentStep === 1
                    ? "In Progress"
                    : "Pending"}
              </p>
            </div>
          </button>

          {/* Stepper Connector 1 -> 2 */}
          <div
            className={`flex-1 mx-3 sm:mx-5 h-[2px] rounded-full transition-all ${
              currentStep >= 2 ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />

          {/* Step 2: Distribute Strategy */}
          <button
            type="button"
            onClick={() => onSelectStep?.(2)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs shrink-0 transition-all ${
                currentStep > 2
                  ? "bg-emerald-600 text-white"
                  : currentStep === 2
                    ? "bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-950/60"
                    : "bg-slate-100 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {currentStep > 2 ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : (
                "2"
              )}
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 2
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-800 dark:text-slate-200"
                }`}
              >
                2. Set Allocations
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep > 2
                    ? "text-emerald-600 dark:text-emerald-400"
                    : currentStep === 2
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {currentStep > 2
                  ? "Completed"
                  : currentStep === 2
                    ? "In Progress"
                    : "Next"}
              </p>
            </div>
          </button>

          {/* Stepper Connector 2 -> 3 */}
          <div
            className={`flex-1 mx-3 sm:mx-5 h-[2px] rounded-full transition-all ${
              currentStep >= 3 ? "bg-blue-600 dark:bg-blue-500" : "bg-slate-200 dark:bg-slate-800"
            }`}
          />

          {/* Step 3: Review & Confirm */}
          <button
            type="button"
            onClick={() => onSelectStep?.(3)}
            className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-medium text-xs shrink-0 transition-all ${
                currentStep === 3
                  ? "bg-blue-600 text-white font-bold ring-4 ring-blue-50 dark:ring-blue-950/60 shadow-xs"
                  : "bg-slate-100 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
              }`}
            >
              3
            </div>
            <div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === 3
                    ? "text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                3. Review & Confirm
              </span>
              <p
                className={`text-[11px] font-medium ${
                  currentStep === 3 ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                }`}
              >
                {currentStep === 3 ? "Ready" : "Final Step"}
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
