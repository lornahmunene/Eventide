"use client";

import React from "react";

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm animate-pulse flex flex-col h-full">
      {/* Image Banner Skeleton */}
      <div className="relative h-48 w-full bg-ink-200 dark:bg-ink-800 animate-shimmer" />

      {/* Body Skeleton */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-ink-200 dark:bg-ink-800" />
            <div className="h-4 w-14 rounded bg-ink-200 dark:bg-ink-800" />
          </div>
          <div className="h-6 w-5/6 rounded-lg bg-ink-200 dark:bg-ink-800" />
          <div className="h-4 w-3/4 rounded bg-ink-200 dark:bg-ink-800" />
        </div>

        <div className="pt-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-ink-200 dark:bg-ink-800" />
          <div className="h-9 w-28 rounded-xl bg-ink-200 dark:bg-ink-800" />
        </div>
      </div>
    </div>
  );
};
