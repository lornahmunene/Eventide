"use client";

import React, { useState } from "react";
import { TicketTier } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  X,
  Calendar,
  MapPin,
  Share2,
  Heart,
  Navigation,
  Flame,
  Clock,
  ShoppingBag,
} from "lucide-react";

export const EventDetailsModal: React.FC = () => {
  const { selectedEvent, setSelectedEvent, buyTicket, triggerToast } = useApp();
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  if (!selectedEvent) return null;

  const event = selectedEvent;
  const isPassed = event.isPassed;
  const activeTier = selectedTier || event.ticketTiers[0] || {
    id: "default",
    name: "General Admission",
    price: event.priceFrom,
    description: "Standard Entry Pass",
    availableQuantity: 100,
  };

  const handleBuyNow = () => {
    if (isPassed) {
      triggerToast("This event has already passed.");
      return;
    }
    buyTicket(event, activeTier.name, activeTier.price, quantity);
    setSelectedEvent(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Event link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl my-8 overflow-hidden rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-2xl text-ink-900 dark:text-white max-h-[90vh] flex flex-col">
        {/* Top Header Controls */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-ink-900/90 backdrop-blur-md border-b border-ink-200 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-widest bg-gradient-to-r from-marigold-600 to-marigold-500 bg-clip-text text-transparent">
              Eventide Experience
            </span>
          </div>
          <button
            onClick={() => setSelectedEvent(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 hover:text-ink-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8 space-y-8">
          {/* Hero Banner Section */}
          <div className="relative h-64 sm:h-96 rounded-2xl overflow-hidden shadow-xl bg-ink-950">
            <img
              src={event.bannerImage}
              alt={event.title}
              className={`w-full h-full object-cover ${isPassed ? "grayscale opacity-75" : ""}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {isPassed ? (
                  <span className="flex items-center gap-1 rounded-full bg-ink-700/90 px-3 py-1 text-xs font-bold uppercase text-ink-200">
                    <Clock className="h-3.5 w-3.5" />
                    Passed Event
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-marigold-600 px-3 py-1 text-xs font-bold uppercase text-white">
                    <Flame className="h-3.5 w-3.5" />
                    Live Event
                  </span>
                )}
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-medium text-white border border-white/20">
                  {event.category}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                {event.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-ink-300">
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <Calendar className="h-4 w-4 text-marigold-400" />
                  <span>{event.date} • {event.time}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                  <MapPin className="h-4 w-4 text-marigold-400" />
                  <span>{event.venue}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Details & Map */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Event */}
              <div className="space-y-3">
                <h3 className="text-lg font-extrabold flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-marigold-600 rounded-full" />
                  About the Event
                </h3>
                <p className="text-sm text-ink-600 dark:text-ink-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.tags.map((tag: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-marigold-500/10 text-marigold-600 dark:text-marigold-400 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Location & Map Card */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-marigold-600 rounded-full" />
                    Venue & Location
                  </h3>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs font-bold text-marigold-600 dark:text-marigold-400 hover:underline"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get Directions
                  </a>
                </div>

                <div className="relative h-48 rounded-2xl overflow-hidden border border-ink-200 dark:border-ink-800 bg-ink-100 dark:bg-ink-800 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px]" />
                  <div className="relative z-10 text-center space-y-2 p-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-marigold-600 text-white shadow-lg shadow-marigold-600/30">
                      <MapPin className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-ink-800 dark:text-ink-200">{event.venue}</p>
                    <p className="text-xs text-ink-500 dark:text-ink-400">{event.city}, Kenya</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Ticket Purchase Box (Sticky) */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950 p-6 space-y-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold">Select Tickets</h3>
                  {isPassed && (
                    <span className="text-xs font-bold text-red-500 uppercase">Sales Closed</span>
                  )}
                </div>

                {/* Ticket Tiers */}
                <div className="space-y-3">
                  {event.ticketTiers.map((tier: TicketTier) => {
                    const isSelected = activeTier.id === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => !isPassed && setSelectedTier(tier)}
                        className={`p-4 rounded-2xl border transition-all ${
                          isPassed
                            ? "border-ink-200 dark:border-ink-800 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-marigold-500 bg-marigold-500/10 ring-2 ring-marigold-500/20 cursor-pointer"
                            : "border-ink-200 dark:border-ink-800 hover:border-ink-400 dark:hover:border-ink-700 cursor-pointer bg-white dark:bg-ink-900"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">{tier.name}</span>
                              {tier.isPopular && (
                                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-marigold-600 text-white">
                                  Popular
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
                              {tier.description}
                            </p>
                          </div>
                          <span className="font-black text-base text-marigold-600 dark:text-marigold-400">
                            KES {tier.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quantity Control */}
                {!isPassed && (
                  <div className="pt-2 flex items-center justify-between border-t border-ink-200 dark:border-ink-800">
                    <span className="text-xs font-bold text-ink-600 dark:text-ink-400">Quantity</span>
                    <div className="flex items-center gap-3 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800 text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-sm font-extrabold">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-ink-100 dark:bg-ink-800 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Total & Checkout Button */}
                <div className="space-y-3 pt-2">
                  {!isPassed && (
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-ink-500">Total Price</span>
                      <span className="text-lg text-marigold-600 dark:text-marigold-400">
                        KES {(activeTier.price * quantity).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <button
                    disabled={isPassed}
                    onClick={handleBuyNow}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                      isPassed
                        ? "bg-ink-300 dark:bg-ink-800 text-ink-500 cursor-not-allowed"
                        : "bg-marigold-600 hover:bg-marigold-700 text-white shadow-marigold-600/25 hover:scale-[1.01] active:scale-[0.99]"
                    }`}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isPassed ? "Event Has Concluded" : "Buy Now"}
                  </button>
                </div>

                {/* Action Buttons: Share / Favorite */}
                <div className="flex justify-around pt-3 border-t border-ink-200 dark:border-ink-800 text-xs font-semibold text-ink-500 dark:text-ink-400">
                  <button onClick={handleShare} className="flex items-center gap-1.5 hover:text-marigold-600">
                    <Share2 className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={() => {
                      setIsFavorited(!isFavorited);
                      triggerToast(isFavorited ? "Removed from favorites" : "Saved to favorites!");
                    }}
                    className={`flex items-center gap-1.5 ${isFavorited ? "text-hibiscus-500 font-bold" : "hover:text-marigold-600"}`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? "fill-hibiscus-500" : ""}`} />
                    Favorite
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
