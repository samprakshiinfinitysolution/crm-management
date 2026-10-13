"use client";

import React from "react";
import { CheckCircle2, ArrowRight, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export interface AllocationSummaryItem {
  executiveName: string;
  count: number;
}

interface DistributionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalDistributed: number;
  allocations: AllocationSummaryItem[];
  mode: string;
}

export const DistributionSuccessModal: React.FC<
  DistributionSuccessModalProps
> = ({ isOpen, onClose, totalDistributed, allocations = [], mode }) => {
  const router = useRouter();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <DialogHeader className="text-center sm:text-left space-y-2">
          <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Distribution Successful!
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Successfully committed{" "}
            <strong className="text-slate-900 dark:text-white">
              {totalDistributed} leads
            </strong>{" "}
            to {allocations.length} sales executives via{" "}
            {mode.replace("_", " ")}.
          </DialogDescription>
        </DialogHeader>

        {/* Allocation Breakdown List */}
        <div className="space-y-2 py-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quota Breakdown:
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {allocations.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-[10px]">
                    {item.executiveName.slice(0, 1)}
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {item.executiveName}
                  </span>
                </div>
                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-md">
                  +{item.count} leads
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300 font-medium border border-emerald-100 dark:border-emerald-900">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>ACID transaction confirmed. Lead histories updated.</span>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto text-xs font-semibold rounded-lg border-slate-300 dark:border-slate-700"
          >
            Distribute More
          </Button>
          <Button
            onClick={() => {
              onClose();
              router.push("/dashboard/users");
            }}
            className="w-full sm:w-auto text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 shadow-xs"
          >
            <span>View Executive Queues</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
