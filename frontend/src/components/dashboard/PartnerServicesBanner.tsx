"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Users,
  ShieldCheck,
  Clock,
  ArrowRight,
  UploadCloud,
  CalendarClock,
  Briefcase,
} from "lucide-react";

interface PartnerServicesBannerProps {
  isSE?: boolean;
}

export function PartnerServicesBanner({ isSE = false }: PartnerServicesBannerProps) {
  if (isSE) {
    return (
      <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 sm:p-5 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Left Information */}
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <div className="rounded-xs py-1 px-2 bg-[#2874f0] border border-[#2874f0] flex items-center justify-center">
                <span className="font-black text-white text-xs italic font-serif">
                  CRM
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Sales Execution & Follow-up Workspace
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[#2874f0] dark:text-blue-400 tracking-tight leading-snug">
              Accelerate Deal Closure with Priority Follow-ups & Real-time Action Logs.
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                Zero SLA Breach Commitment
              </span>{" "}
              with real-time customer interaction logging, timely call schedules, and stage-by-stage pipeline advancement.
            </p>

            {/* Core Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Scheduled Follow-ups</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                <FileText className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Call & Note Logging</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>Deal Stage Progression</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
                <Users className="w-3.5 h-3.5 text-[#2874f0]" />
                <span>SLA Response Window</span>
              </div>
            </div>
          </div>

          {/* Right CTA Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/dashboard/follow-ups"
              className="px-3.5 py-2 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[#2874f0] font-bold text-xs uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CalendarClock className="w-4 h-4 text-[#2874f0]" />
              <span>Follow-up Queue</span>
            </Link>

            <Link
              href="/dashboard/my-leads"
              className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide transition-colors shadow-xs flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4 text-white" />
              <span>My Assigned Leads</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>

        {/* Carousel dots below */}
        <div className="flex items-center justify-center gap-1.5 pt-3">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
          <div className="w-2 h-2 rounded-full bg-[#2874f0]" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card dark:bg-slate-900 border border-[#e0e0e0] dark:border-slate-800 rounded-sm p-4 sm:p-5 relative overflow-hidden shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
        {/* Left Information */}
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            {/* CRM Engine Badge */}
            <div className="rounded-xs py-1 px-2 bg-[#2874f0] border border-[#2874f0] flex items-center justify-center">
              <span className="font-black text-white text-xs italic font-serif">
                CRM
              </span>
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Lead Ingestion & Sales Distribution Engine
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#2874f0] dark:text-blue-400 tracking-tight leading-snug">
            Scale Sales Throughput with Bulk Intake & Intelligent Lead Distribution.
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-100">
              Zero Duplicate Guarantee
            </span>{" "}
            with atomic database transactions, staged preview confirmation, and automated team quota allocation.
          </p>

          {/* Core Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Excel Import (.xlsx / .csv)</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
              <Users className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Equal & Custom Distribution</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Duplicate Prevention</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-[#2874f0]" />
              <span>Dynamic Recall & Reassignment</span>
            </div>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/dashboard/imports/upload"
            className="px-3.5 py-2 rounded-sm bg-white dark:bg-slate-800 border border-[#e0e0e0] dark:border-slate-700 text-[#2874f0] font-bold text-xs uppercase tracking-wide hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 text-[#2874f0]" />
            <span>Upload Sheet</span>
          </Link>

          <Link
            href="/dashboard/distributions/create"
            className="px-4 py-2 rounded-sm bg-[#2874f0] hover:bg-[#1a5bb8] text-white font-bold text-xs uppercase tracking-wide transition-colors shadow-xs flex items-center gap-2"
          >
            <span>Distribute Leads</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </Link>
        </div>
      </div>

      {/* Carousel dots below */}
      <div className="flex items-center justify-center gap-1.5 pt-3">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
        <div className="w-2 h-2 rounded-full bg-[#2874f0]" />
        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
      </div>
    </div>
  );
}

// Named alias for cleaner imports
export const PlatformActionBanner = PartnerServicesBanner;

