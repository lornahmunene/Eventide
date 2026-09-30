"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EventItem, VendorRequirement } from "@/types";
import { VendingCardSkeleton } from "@/components/sections/VendingCardSkeleton";
import { VendorApplicationForm } from "@/components/forms/VendorApplicationForm";
import {
  Store,
  Calendar,
  MapPin,
  CheckCircle,
  Clock,
  Send,
  Zap,
  Tag,
  X,
} from "lucide-react";

export const VendingSection: React.FC = () => {
  const { events, isSkeletonLoading } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [selectedOpening, setSelectedOpening] = useState<{ event: EventItem; opening: VendorRequirement } | null>(null);

  const eventsWithVendors = events.filter((e) => e.vendorOpening && !e.isPassed);

  const filteredEvents = categoryFilter === "All"
    ? eventsWithVendors
    : eventsWithVendors.filter((e) => e.vendorOpening?.category === categoryFilter);

  const categories = [
    "All",
    "Food & Beverage",
    "Tech Demos",
    "Art & Craft",
    "Merch & Retail",
    "Services & Sound",
  ];

  const handleOpenApplication = (event: EventItem, opening: VendorRequirement) => {
    setSelectedOpening({ event, opening });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Vending Hub Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-marigold-600 via-marigold-600 to-hibiscus-600 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider">
            <Store className="h-4 w-4" />
            Eventide Vendor Opportunities Portal
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Partner & Sell at Top Live Events
          </h1>
          <p className="text-sm sm:text-base text-marigold-100 font-normal leading-relaxed">
            Connect your business with thousands of event attendees. Browse open vendor calls for food stalls, tech demo zones, craft booths & equipment services.
          </p>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-ink-200 dark:border-ink-800">
        <span className="text-xs font-bold text-ink-400 uppercase mr-2">Filter by Service:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${categoryFilter === cat
                ? "bg-marigold-600 text-white shadow-md shadow-marigold-600/20"
                : "bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-200 dark:hover:bg-ink-700"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Vending Openings Grid */}
      {isSkeletonLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VendingCardSkeleton />
          <VendingCardSkeleton />
          <VendingCardSkeleton />
          <VendingCardSkeleton />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-ink-300 dark:border-ink-800 bg-ink-50 dark:bg-ink-900/50 p-8 space-y-3">
          <Store className="h-10 w-10 text-ink-400 mx-auto" />
          <h3 className="text-lg font-bold text-ink-700 dark:text-ink-300">
            No active vendor calls in &quot;{categoryFilter}&quot;
          </h3>
          <p className="text-xs text-ink-500 max-w-sm mx-auto">
            Check back soon or select &quot;All&quot; to view available event vendor openings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const v = event.vendorOpening!;
            return (
              <div
                key={event.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold border border-emerald-500/20">
                      <Tag className="h-3.5 w-3.5" />
                      {v.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold text-marigold-600 dark:text-marigold-400 bg-marigold-500/10 px-2.5 py-1 rounded-full">
                      <Clock className="h-3.5 w-3.5" />
                      {v.spotsRemaining} Spots Left
                    </span>
                  </div>

                  {/* Title & Event context */}
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-ink-900 dark:text-white group-hover:text-marigold-600 dark:group-hover:text-marigold-400 transition-colors">
                      {v.title}
                    </h3>
                    <p className="text-xs font-semibold text-ink-500 dark:text-ink-400 mt-1 flex items-center gap-1">
                      Event: <span className="text-ink-800 dark:text-ink-200">{event.title}</span>
                    </p>
                  </div>

                  {/* Event Details snippet */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-ink-500 dark:text-ink-400 py-2 border-y border-ink-100 dark:border-ink-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-marigold-500" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-marigold-500" />
                      {event.venue}
                    </span>
                  </div>

                  {/* Booth Perks */}
                  <div className="space-y-1.5 bg-ink-50 dark:bg-ink-800/40 p-3.5 rounded-2xl">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400 block mb-1">
                      Included Booth Amenities & Specs:
                    </span>
                    <div className="text-xs font-medium text-ink-700 dark:text-ink-300 space-y-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-marigold-500 shrink-0" />
                        <span>Booth Size: <strong>{v.boothSize}</strong></span>
                      </div>
                      {v.perks.map((perk, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer: Fee & Action */}
                <div className="pt-5 mt-4 border-t border-ink-100 dark:border-ink-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-ink-400 block">Booth Reservation Fee</span>
                    <span className="text-xl font-black text-ink-900 dark:text-white">
                      KES {v.boothFee.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenApplication(event, v)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-bold text-xs shadow-md shadow-marigold-600/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Apply as Vendor
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vendor Application Modal */}
      {selectedOpening && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-2xl p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-ink-200 dark:border-ink-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-marigold-600">
                  Vendor Application Portal
                </span>
                <h3 className="text-xl font-black text-ink-900 dark:text-white mt-0.5">
                  {selectedOpening.opening.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOpening(null)}
                className="h-8 w-8 flex items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 hover:text-ink-900 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <VendorApplicationForm
              event={selectedOpening.event}
              opening={selectedOpening.opening}
              onSuccess={() => {}}
              onCancel={() => setSelectedOpening(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
