"use client";

import React, { useState, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { CategoryType } from "@/types";
import { EventCard } from "@/components/cards/EventCard";
import { EventCardSkeleton } from "@/components/cards/EventCardSkeleton";
import { EventCalendarTop } from "@/components/sections/EventCalendarTop";
import { EventMarqueeStrip } from "@/components/sections/EventMarqueeStrip";
import {
  Search,
  Music,
  Laptop,
  Palette,
  GraduationCap,
  Utensils,
  Shirt,
  Sparkles,
  ArrowUpDown,
  X,
  Filter,
  Calendar as CalendarIcon,
} from "lucide-react";

export const AllEventsPage: React.FC = () => {
  const { events, isSkeletonLoading } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | "All">("All");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<"high-to-low" | "low-to-high" | "date-soonest">("high-to-low");
  const [statusFilter, setStatusFilter] = useState<"all" | "upcoming" | "passed">("all");

  const categories: { name: CategoryType | "All"; label: string; icon: React.ReactNode }[] = [
    { name: "All", label: "All Categories", icon: <Sparkles className="h-4 w-4" /> },
    { name: "Fashion", label: "Fashion", icon: <Shirt className="h-4 w-4" /> },
    { name: "Concerts", label: "Concerts", icon: <Music className="h-4 w-4" /> },
    { name: "Tech", label: "Tech", icon: <Laptop className="h-4 w-4" /> },
    { name: "Arts", label: "Arts", icon: <Palette className="h-4 w-4" /> },
    { name: "Food", label: "Food", icon: <Utensils className="h-4 w-4" /> },
    { name: "Education", label: "Education", icon: <GraduationCap className="h-4 w-4" /> },
  ];

  // Process filtering and sorting
  const processedEvents = useMemo(() => {
    let result = [...events];

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.venue.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.tags.some((t: string) => t.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (selectedCategory !== "All") {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // 3. Date Filter (From Top Calendar Bar)
    if (selectedDate) {
      result = result.filter((e) => e.date === selectedDate);
    }

    // 4. Status Filter (Live vs Passed)
    if (statusFilter === "upcoming") {
      result = result.filter((e) => !e.isPassed);
    } else if (statusFilter === "passed") {
      result = result.filter((e) => e.isPassed);
    }

    // 5. Price Sorting
    if (sortOption === "high-to-low") {
      result.sort((a, b) => b.priceFrom - a.priceFrom);
    } else if (sortOption === "low-to-high") {
      result.sort((a, b) => a.priceFrom - b.priceFrom);
    } else if (sortOption === "date-soonest") {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    return result;
  }, [events, searchQuery, selectedCategory, selectedDate, sortOption, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16">
      {/* 1. Picture-Only Looping Right-to-Left Marquee Strip (No details, moving loop!) */}
      <EventMarqueeStrip events={events} />

      {/* 2. Top Event Calendar Widget */}
      <EventCalendarTop
        events={events}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      {/* 3. Search & Category Filters Bar */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-marigold-600" />
            <h2 className="text-xl font-extrabold text-ink-900 dark:text-white">
              Filter &amp; Search Catalogue
            </h2>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
            <input
              type="text"
              placeholder="Search by title, venue, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 pl-10 pr-4 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none focus:ring-2 focus:ring-marigold-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-ink-400 hover:text-ink-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${selectedCategory === cat.name
                  ? "bg-marigold-600 text-white shadow-md shadow-marigold-600/20 scale-105"
                  : "bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-800 border border-ink-200/50 dark:border-ink-800/50"
                }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Status Filters & Sorting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-ink-200/60 dark:border-ink-800/60 bg-ink-50/50 dark:bg-ink-900/30">
          <div className="flex items-center gap-1 bg-white dark:bg-ink-900 p-1 rounded-xl border border-ink-200 dark:border-ink-800">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "all"
                  ? "bg-marigold-600 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
                }`}
            >
              All ({events.length})
            </button>
            <button
              onClick={() => setStatusFilter("upcoming")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "upcoming"
                  ? "bg-marigold-600 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
                }`}
            >
              Live &amp; Upcoming
            </button>
            <button
              onClick={() => setStatusFilter("passed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "passed"
                  ? "bg-marigold-600 text-white shadow-sm"
                  : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
                }`}
            >
              Passed (Greyed Out)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-marigold-500" />
            <span className="text-xs font-bold text-ink-500">Sort By:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as "high-to-low" | "low-to-high" | "date-soonest")}
              className="rounded-xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 px-3 py-1.5 text-xs font-bold text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
            >
              <option value="high-to-low">Price: High to Low ↑</option>
              <option value="low-to-high">Price: Low to High ↓</option>
              <option value="date-soonest">Date: Soonest First 📅</option>
            </select>
          </div>
        </div>

        {/* Active Filter Badges Notification */}
        {(selectedDate || selectedCategory !== "All" || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-2xl bg-marigold-500/10 border border-marigold-500/20 text-xs font-bold text-ink-800 dark:text-ink-200">
            <span className="text-marigold-600 dark:text-marigold-400">Active Filters:</span>
            {selectedDate && (
              <span className="flex items-center gap-1 bg-white dark:bg-ink-900 px-3 py-1 rounded-xl border border-marigold-500/30 text-marigold-600 shadow-xs">
                <CalendarIcon className="h-3.5 w-3.5" />
                Date: {selectedDate}
                <button onClick={() => setSelectedDate(null)} className="hover:text-hibiscus-500 ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {selectedCategory !== "All" && (
              <span className="flex items-center gap-1 bg-white dark:bg-ink-900 px-3 py-1 rounded-xl border border-marigold-500/30 text-marigold-600 shadow-xs">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("All")} className="hover:text-hibiscus-500 ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="flex items-center gap-1 bg-white dark:bg-ink-900 px-3 py-1 rounded-xl border border-marigold-500/30 text-marigold-600 shadow-xs">
                Query: &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-hibiscus-500 ml-1">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSelectedDate(null);
                setSelectedCategory("All");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="text-xs text-marigold-600 hover:underline font-extrabold ml-auto"
            >
              Reset All Filters
            </button>
          </div>
        )}

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-ink-500 font-semibold px-1">
          <span>Showing {processedEvents.length} events</span>
        </div>

        {/* Full 4-Column Event Cards Grid */}
        {isSkeletonLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
            <EventCardSkeleton />
          </div>
        ) : processedEvents.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-ink-300 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/40 p-8 space-y-3">
            <Sparkles className="h-10 w-10 text-ink-400 mx-auto" />
            <h3 className="text-lg font-bold text-ink-700 dark:text-ink-300">
              No events found matching selected criteria
            </h3>
            <p className="text-xs text-ink-500 max-w-sm mx-auto">
              Try selecting a different date on the calendar above or resetting category filters.
            </p>
            <button
              onClick={() => {
                setSelectedDate(null);
                setSearchQuery("");
                setSelectedCategory("All");
                setStatusFilter("all");
              }}
              className="px-4 py-2 rounded-xl bg-marigold-600 text-white text-xs font-bold shadow-md shadow-marigold-600/20"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
