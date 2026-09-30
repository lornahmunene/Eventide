"use client";

import React from "react";

export const VendingCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 space-y-4 shadow-sm animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-5 w-24 rounded bg-ink-200 dark:bg-ink-800" />
        <div className="h-5 w-16 rounded-full bg-ink-200 dark:bg-ink-800" />
      </div>
      <div className="h-6 w-3/4 rounded-lg bg-ink-200 dark:bg-ink-800" />
      <div className="h-4 w-1/2 rounded bg-ink-200 dark:bg-ink-800" />

      <div className="p-4 rounded-2xl bg-ink-100 dark:bg-ink-800/50 space-y-2">
        <div className="h-4 w-full rounded bg-ink-200 dark:bg-ink-800" />
        <div className="h-4 w-4/5 rounded bg-ink-200 dark:bg-ink-800" />
      </div>

      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-24 rounded bg-ink-200 dark:bg-ink-800" />
        <div className="h-10 w-32 rounded-xl bg-ink-200 dark:bg-ink-800" />
      </div>
    </div>
  );
};
