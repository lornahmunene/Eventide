"use client";

import React, { useState } from "react";
import { EventItem } from "@/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  Clock,
  CheckCircle,
} from "lucide-react";

interface EventCalendarSidebarProps {
  events: EventItem[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

export const EventCalendarSidebar: React.FC<EventCalendarSidebarProps> = ({
  events,
  selectedDate,
  onSelectDate,
}) => {
  // Current displayed month state (Defaulting to Nov 2026 based on mock dataset)
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)); // Nov 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Compute days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map events to YYYY-MM-DD
  const eventsByDate = React.useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    events.forEach((evt) => {
      const dateKey = evt.date; // e.g. "2026-11-12"
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(evt);
    });
    return map;
  }, [events]);

  // Construct calendar grid days
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    calendarCells.push({ day, dateStr, eventsOnDay: eventsByDate[dateStr] || [] });
  }

  // Quick Preset Filters
  const handleSelectThisMonth = () => {
    onSelectDate(null);
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card Container */}
      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-xl space-y-4">
        {/* Header: Title & Month Nav */}
        <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-marigold-500/10 text-marigold-600 dark:text-marigold-400">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-ink-900 dark:text-white">
                Event Calendar
              </h3>
              <p className="text-[10px] text-ink-400 font-semibold">Click a date to filter</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={prevMonth}
              aria-label="Previous Month"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-xs font-extrabold text-ink-800 dark:text-ink-200 px-1 min-w-[90px] text-center">
              {monthNames[month]} {year}
            </span>

            <button
              onClick={nextMonth}
              aria-label="Next Month"
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {daysOfWeek.map((day) => (
            <span key={day} className="text-[10px] font-bold uppercase tracking-wider text-ink-400 py-1">
              {day}
            </span>
          ))}
        </div>

        {/* Calendar Grid Days */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="h-9 w-full" />;
            }

            const isSelected = selectedDate === cell.dateStr;
            const hasEvents = cell.eventsOnDay.length > 0;
            const liveEventCount = cell.eventsOnDay.filter((e) => !e.isPassed).length;

            return (
              <button
                key={cell.dateStr}
                onClick={() => {
                  if (isSelected) {
                    onSelectDate(null);
                  } else {
                    onSelectDate(cell.dateStr);
                  }
                }}
                className={`group relative h-9 w-full rounded-xl text-xs font-extrabold transition-all duration-200 flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-gradient-to-tr from-marigold-600 to-marigold-500 text-white shadow-md shadow-marigold-600/30 scale-105 z-10"
                    : hasEvents
                    ? "bg-marigold-500/10 text-marigold-600 dark:text-marigold-400 hover:bg-marigold-500/20 border border-marigold-500/30"
                    : "text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                }`}
              >
                <span>{cell.day}</span>

                {/* Event Count Indicator Dot */}
                {hasEvents && !isSelected && (
                  <span className="absolute bottom-1 flex h-1.5 w-1.5 rounded-full bg-marigold-500 animate-pulse" />
                )}

                {/* Popover Hover Badge */}
                {hasEvents && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                    <div className="bg-ink-950 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-xl whitespace-nowrap border border-ink-800">
                      {liveEventCount} Event{liveEventCount === 1 ? "" : "s"} on {cell.dateStr}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Date Filter Active Bar */}
        {selectedDate && (
          <div className="pt-2 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between text-xs">
            <span className="text-marigold-600 dark:text-marigold-400 font-extrabold flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Date: {selectedDate}
            </span>
            <button
              onClick={() => onSelectDate(null)}
              className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-200 font-bold flex items-center gap-1 text-[11px]"
            >
              <X className="h-3.5 w-3.5" />
              Clear Date
            </button>
          </div>
        )}
      </div>

      {/* Quick Date Presets */}
      <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-5 shadow-sm space-y-3">
        <span className="text-[11px] font-black uppercase tracking-wider text-ink-400 block">
          Quick Date Ranges
        </span>
        <div className="space-y-2 text-xs font-bold">
          <button
            onClick={() => onSelectDate(null)}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              !selectedDate
                ? "border-marigold-500 bg-marigold-50 dark:bg-marigold-950/40 text-marigold-600 dark:text-marigold-400"
                : "border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
            }`}
          >
            <span>All Dates Catalogue</span>
            <span className="text-[10px] bg-ink-200 dark:bg-ink-700 px-2 py-0.5 rounded-full">
              {events.length}
            </span>
          </button>

          <button
            onClick={() => onSelectDate("2026-11-12")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              selectedDate === "2026-11-12"
                ? "border-marigold-500 bg-marigold-50 dark:bg-marigold-950/40 text-marigold-600 dark:text-marigold-400"
                : "border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-marigold-500" />
              Safari Tech Summit (Nov 12)
            </span>
            <span className="text-[10px] bg-marigold-500/20 text-marigold-600 px-2 py-0.5 rounded-full font-black">
              Featured
            </span>
          </button>

          <button
            onClick={() => onSelectDate("2026-12-19")}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${
              selectedDate === "2026-12-19"
                ? "border-marigold-500 bg-marigold-50 dark:bg-marigold-950/40 text-marigold-600 dark:text-marigold-400"
                : "border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-hibiscus-500" />
              Sun &amp; Stars Fest (Dec 19)
            </span>
            <span className="text-[10px] bg-marigold-500/20 text-marigold-600 px-2 py-0.5 rounded-full font-black">
              Concert
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
