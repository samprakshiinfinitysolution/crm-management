"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?:
    | ReactNode
    | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
  title?: string;
  description?: string;
  variant?: "default" | "card" | "inline";
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);
    console.error(
      "[ErrorBoundary caught an unhandled error]:",
      error,
      errorInfo,
    );
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps): void {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && resetKeys && prevProps.resetKeys) {
      const hasKeyChanged = resetKeys.some(
        (key, index) => !Object.is(key, prevProps.resetKeys?.[index]),
      );
      if (hasKeyChanged) {
        this.reset();
      }
    }
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  toggleDetails = (): void => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render(): ReactNode {
    const { hasError, error, showDetails } = this.state;
    const {
      children,
      fallback,
      title,
      description,
      variant = "default",
    } = this.props;

    if (!hasError) {
      return children;
    }

    if (typeof fallback === "function") {
      return fallback({
        error: error ?? new Error("Unknown error"),
        reset: this.reset,
      });
    }

    if (fallback) {
      return fallback;
    }

    // Inline variant
    if (variant === "inline") {
      return (
        <div className="flex h-fit items-center justify-between gap-3 p-3 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs my-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="truncate font-medium">
              {description ||
                error?.message ||
                "Failed to load this component."}
            </span>
          </div>
          <button
            type="button"
            onClick={this.reset}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300 dark:border-amber-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      );
    }

    // Default & Card variants - Centered vertically and horizontally
    return (
      <div className="w-full min-h-[calc(100vh-50px)] flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div
          className={`w-full max-w-lg rounded-xl border bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm dark:shadow-2xl flex flex-col items-center text-center transition-all ${
            variant === "card"
              ? "border-slate-200 dark:border-slate-800"
              : "border-slate-200/80 dark:border-slate-800"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            {title || "Something went wrong in this section"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-1.5 mb-5 leading-relaxed">
            {description ||
              "An unexpected client-side error occurred while rendering this module. You can try refreshing this section without reloading the entire page."}
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={this.reset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try again
            </button>

            {error && (
              <button
                type="button"
                onClick={this.toggleDetails}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>{showDetails ? "Hide details" : "Show details"}</span>
                {showDetails ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {showDetails && error && (
            <div className="w-full text-left mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono overflow-x-auto max-h-48">
              <div className="font-bold text-rose-400 mb-1">
                {error.name}: {error.message}
              </div>
              {error.stack && (
                <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}
