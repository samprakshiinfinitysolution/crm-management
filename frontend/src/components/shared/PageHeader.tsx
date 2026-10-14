"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  breadcrumbs,
  actions,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-200 dark:border-slate-800 ${className}`}
    >
      <div className="min-w-0">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 mb-1 text-xs">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className={`font-semibold ${
                        isLast
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {crumb.label}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Title with Icon */}
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h1>

        {/* Subtitle / Description */}
        {description && (
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 mt-1 font-medium max-w-3xl">
            {description}
          </p>
        )}
      </div>

      {/* Action Buttons / CTA Slots */}
      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
