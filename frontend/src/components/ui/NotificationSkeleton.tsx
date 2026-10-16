import React from "react";

interface NotificationSkeletonProps {
  count?: number;
}

export function NotificationSkeleton({ count = 5 }: NotificationSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-4 flex items-start justify-between gap-4 animate-pulse"
        >
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Icon */}
            <div className="w-8 h-8 rounded-lg bg-card/70 shrink-0 mt-0.5" />

            <div className="flex flex-col min-w-0 flex-1 gap-2">
              {/* Title + category */}
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-40 rounded bg-card/70" />
                <div className="h-2 w-2 rounded-full bg-card/70" />
                <div className="h-5 w-16 rounded-md bg-card" />
              </div>

              {/* Message */}
              <div className="h-3 w-3/4 max-w-lg rounded bg-card/70" />

              {/* Date */}
              <div className="h-2.5 w-28 rounded bg-card" />
            </div>
          </div>

          {/* Action */}
          <div className="flex items-center gap-2 shrink-0 self-center">
            <div className="h-7 w-20 rounded-lg bg-card" />
            <div className="h-4 w-4 rounded bg-card" />
          </div>
        </div>
      ))}
    </>
  );
}
