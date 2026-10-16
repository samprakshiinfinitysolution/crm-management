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
    <div className="bg-white dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-3.5 sm:p-4 shadow-2xs">
      <div className="flex items-center justify-between max-w-2xl mx-auto relative">
        {/* Step 1: Select Executives */}
        <button
          type="button"
          onClick={() => onSelectStep?.(1)}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div
            className={`w-6 h-6 rounded-xs flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
              currentStep > 1
                ? "bg-emerald-600 text-white"
                : currentStep === 1
                  ? "bg-[#2874f0] text-white shadow-xs"
                  : "bg-slate-100 text-slate-400 border border-[#e0e0e0]"
            }`}
          >
            {currentStep > 1 ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              "1"
            )}
          </div>
          <div>
            <span
              className={`text-xs block ${
                currentStep === 1
                  ? "text-[#2874f0] font-bold"
                  : "text-slate-800 dark:text-slate-200 font-semibold"
              }`}
            >
              1. Select Representatives
            </span>
            <p
              className={`text-[10px] uppercase font-bold tracking-wider ${
                currentStep > 1
                  ? "text-emerald-600"
                  : currentStep === 1
                    ? "text-[#2874f0]"
                    : "text-slate-400"
              }`}
            >
              {currentStep > 1
                ? "Completed"
                : currentStep === 1
                  ? "Active Step"
                  : "Pending"}
            </p>
          </div>
        </button>

        {/* Stepper Connector 1 -> 2 */}
        <div
          className={`flex-1 mx-3 sm:mx-6 h-[2px] transition-colors ${
            currentStep >= 2 ? "bg-[#2874f0]" : "bg-[#e0e0e0] dark:bg-slate-800"
          }`}
        />

        {/* Step 2: Set Allocations */}
        <button
          type="button"
          onClick={() => onSelectStep?.(2)}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div
            className={`w-6 h-6 rounded-xs flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
              currentStep > 2
                ? "bg-emerald-600 text-white"
                : currentStep === 2
                  ? "bg-[#2874f0] text-white shadow-xs"
                  : "bg-slate-100 text-slate-400 border border-[#e0e0e0]"
            }`}
          >
            {currentStep > 2 ? (
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            ) : (
              "2"
            )}
          </div>
          <div>
            <span
              className={`text-xs block ${
                currentStep === 2
                  ? "text-[#2874f0] font-bold"
                  : "text-slate-800 dark:text-slate-200 font-semibold"
              }`}
            >
              2. Distribution Strategy
            </span>
            <p
              className={`text-[10px] uppercase font-bold tracking-wider ${
                currentStep > 2
                  ? "text-emerald-600"
                  : currentStep === 2
                    ? "text-[#2874f0]"
                    : "text-slate-400"
              }`}
            >
              {currentStep > 2
                ? "Completed"
                : currentStep === 2
                  ? "Active Step"
                  : "Pending"}
            </p>
          </div>
        </button>

        {/* Stepper Connector 2 -> 3 */}
        <div
          className={`flex-1 mx-3 sm:mx-6 h-[2px] transition-colors ${
            currentStep >= 3 ? "bg-[#2874f0]" : "bg-[#e0e0e0] dark:bg-slate-800"
          }`}
        />

        {/* Step 3: Review & Execute */}
        <button
          type="button"
          onClick={() => onSelectStep?.(3)}
          className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
        >
          <div
            className={`w-6 h-6 rounded-xs flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
              currentStep === 3
                ? "bg-[#2874f0] text-white shadow-xs"
                : "bg-slate-100 text-slate-400 border border-[#e0e0e0]"
            }`}
          >
            3
          </div>
          <div>
            <span
              className={`text-xs block ${
                currentStep === 3
                  ? "text-[#2874f0] font-bold"
                  : "text-slate-600 dark:text-slate-400 font-semibold"
              }`}
            >
              3. Review & Execute
            </span>
            <p
              className={`text-[10px] uppercase font-bold tracking-wider ${
                currentStep === 3 ? "text-[#2874f0]" : "text-slate-400"
              }`}
            >
              {currentStep === 3 ? "Ready" : "Final Step"}
            </p>
          </div>
        </button>
      </div>
    </div>
  );
};
