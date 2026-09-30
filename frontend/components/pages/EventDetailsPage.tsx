"use client";

import React, { useState } from "react";
import { TicketTier, EventItem } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Share2,
  Heart,
  Navigation,
  Flame,
  Clock,
  Store,
  Ticket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

interface EventDetailsPageProps {
  overrideEvent?: EventItem;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ overrideEvent }) => {
  const { selectedEvent, setSelectedEvent, buyTicket, triggerToast, setActiveTab, events } = useApp();
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  const event = overrideEvent || selectedEvent;

  // Prevent blank page bug: if no event is selected, render a clean fallback
  if (!event) {
    return (
      <div className="py-20 text-center space-y-5 max-w-md mx-auto animate-in fade-in">
        <Sparkles className="h-12 w-12 text-marigold-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black text-ink-900 dark:text-white">
          No Event Selected
        </h2>
        <p className="text-xs text-ink-500 leading-relaxed">
          Please select an event from the marketplace to view full experience details, pricing tiers, and venue locations.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <button
            onClick={() => setActiveTab("all-events")}
            className="px-5 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white text-xs font-bold shadow-md shadow-marigold-600/20 transition-all"
          >
            Explore All Events
          </button>
          <button
            onClick={() => setActiveTab("home")}
            className="px-5 py-2.5 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 text-xs font-bold hover:bg-ink-200 dark:hover:bg-ink-700 transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

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
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      triggerToast("Event link copied to clipboard!");
    }
  };

  // Filter related events matching the same category (e.g., Tech events for Tech)
  const categoryRelated = events.filter((e) => e.id !== event.id && e.category === event.category);
  const otherRelated = events.filter((e) => e.id !== event.id && e.category !== event.category && !e.isPassed);
  const relatedEvents = [...categoryRelated, ...otherRelated].slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-ink-200 dark:border-ink-800">
        <button
          onClick={() => {
            setSelectedEvent(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-100 dark:bg-ink-800 hover:bg-marigold-600 hover:text-white text-ink-700 dark:text-ink-300 text-xs font-bold transition-all shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsFavorited(!isFavorited);
              triggerToast(isFavorited ? "Removed from saved events" : "Saved to your favorites!");
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all ${
              isFavorited
                ? "border-hibiscus-500 bg-hibiscus-500/10 text-hibiscus-500"
                : "border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800"
            }`}
          >
            <Heart className={`h-4 w-4 ${isFavorited ? "fill-hibiscus-500" : ""}`} />
          </button>

          <button
            onClick={handleShare}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 dark:border-ink-800 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 transition-all"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Hero Banner Section */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl bg-ink-950 group">
        <img
          src={event.bannerImage}
          alt={event.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-black/20" />

        {/* Status Badges Overlay */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-10">
          <div className="flex flex-wrap items-center gap-2">
            {isPassed ? (
              <span className="flex items-center gap-1 rounded-full bg-ink-800/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-ink-300 border border-ink-700">
                <Clock className="h-3.5 w-3.5 text-ink-400" />
                Event Concluded
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-marigold-600/90 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white shadow-md border border-marigold-400/30">
                <Flame className="h-3.5 w-3.5 fill-marigold-200" />
                {event.category}
              </span>
            )}

            <span className="px-3.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
              {event.city}, Kenya
            </span>
          </div>
        </div>

        {/* Title & Location Banner Footer */}
        <div className="absolute bottom-6 left-6 right-6 z-10 text-white space-y-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-md">
            {event.title}
          </h1>
          <p className="text-sm sm:text-lg text-ink-200 max-w-3xl font-medium drop-shadow-sm">
            {event.tagline || event.description}
          </p>
        </div>
      </div>

      {/* Main Grid: Details + Ticket Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Event Info & Story */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-3xl bg-ink-50 dark:bg-ink-900/60 border border-ink-200/80 dark:border-ink-800">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marigold-500/10 text-marigold-600 dark:text-marigold-400 shrink-0">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Date &amp; Time</span>
                <p className="text-sm font-extrabold text-ink-900 dark:text-white">{event.date}</p>
                <p className="text-xs text-ink-500 font-semibold">{event.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-hibiscus-500/10 text-hibiscus-600 dark:text-hibiscus-400 shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">Venue Location</span>
                <p className="text-sm font-extrabold text-ink-900 dark:text-white line-clamp-1">{event.venue}</p>
                <p className="text-xs text-ink-500 font-semibold">{event.city}, Kenya</p>
              </div>
            </div>
          </div>

          {/* Experience Description */}
          <div className="space-y-4">
            <h3 className="text-xl font-black tracking-tight text-ink-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-marigold-500" />
              About This {event.category} Experience
            </h3>
            <p className="text-sm sm:text-base text-ink-600 dark:text-ink-300 leading-relaxed font-normal">
              {event.description}
            </p>
          </div>

          {/* Vendor Opportunity Banner if Vendor Calls Open */}
          {event.vendorOpening && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-ink-900 to-ink-950 text-white space-y-4 border border-emerald-500/30 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                  <Store className="h-4 w-4" />
                  Open Vendor Slots Available
                </span>
                <span className="text-xs text-emerald-400 font-bold">
                  {event.vendorOpening.spotsRemaining} Spots Remaining
                </span>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{event.vendorOpening.title}</h4>
                <p className="text-xs text-ink-300 mt-1">
                  Booth Fee: KES {event.vendorOpening.boothFee.toLocaleString()} • Size: {event.vendorOpening.boothSize}
                </p>
              </div>
              <button
                onClick={() => setActiveTab("vending")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
              >
                Apply for Vendor Stall on Vending Hub →
              </button>
            </div>
          )}

          {/* Location Map Directions Placeholder */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-ink-900 dark:text-white flex items-center gap-2">
              <Navigation className="h-5 w-5 text-marigold-500" />
              Venue &amp; Map Navigation
            </h3>
            <div className="h-48 rounded-3xl bg-ink-100 dark:bg-ink-800/80 border border-ink-200 dark:border-ink-700 p-6 flex flex-col items-center justify-center text-center space-y-2">
              <MapPin className="h-8 w-8 text-marigold-500 animate-bounce" />
              <p className="text-sm font-bold text-ink-800 dark:text-ink-200">{event.venue}</p>
              <p className="text-xs text-ink-500">{event.city}, Kenya • GPS Verified Location</p>
            </div>
          </div>

          {/* Event Tags */}
          <div className="flex flex-wrap gap-2 pt-4">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-3.5 py-1.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400 text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right Column (1 Col): Ticket Tier Selector & Booking Card */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl bg-white dark:bg-ink-900 border border-ink-200/90 dark:border-ink-800 p-6 space-y-6 shadow-xl">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-marigold-600 block">
                Official Passes &amp; Tickets
              </span>
              <h3 className="text-xl font-extrabold text-ink-900 dark:text-white mt-0.5">
                Select Ticket Tier
              </h3>
            </div>

            {/* Ticket Tier Options */}
            <div className="space-y-3">
              {event.ticketTiers.map((tier) => {
                const isSelected = activeTier.id === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? "border-marigold-500 bg-marigold-50 dark:bg-marigold-950/30 shadow-md"
                        : "border-ink-200 dark:border-ink-800 hover:border-marigold-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-ink-900 dark:text-white">{tier.name}</span>
                      <span className="text-sm font-black text-marigold-600 dark:text-marigold-400">
                        KES {tier.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 mt-1">{tier.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-ink-700 dark:text-ink-300">Quantity</span>
              <div className="flex items-center gap-3 bg-ink-100 dark:bg-ink-800 rounded-xl p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-7 w-7 rounded-lg bg-white dark:bg-ink-700 font-bold text-sm shadow-xs"
                >
                  -
                </button>
                <span className="text-sm font-black px-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-7 w-7 rounded-lg bg-white dark:bg-ink-700 font-bold text-sm shadow-xs"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total Calculation */}
            <div className="pt-4 border-t border-ink-200 dark:border-ink-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink-400 block">Total Amount</span>
                <span className="text-2xl font-black text-ink-900 dark:text-white">
                  KES {(activeTier.price * quantity).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Booking CTA Button */}
            {isPassed ? (
              <button
                disabled
                className="w-full py-3.5 rounded-2xl bg-ink-200 dark:bg-ink-800 text-ink-400 text-xs font-bold cursor-not-allowed"
              >
                Event Concluded
              </button>
            ) : (
              <button
                onClick={handleBuyNow}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-marigold-600 via-marigold-600 to-hibiscus-600 hover:from-marigold-500 hover:to-hibiscus-500 text-white font-extrabold text-sm shadow-xl shadow-marigold-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Ticket className="h-5 w-5" />
                <span>Book Tickets Now</span>
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-ink-400 text-center">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Instant Digital QR Pass • Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related / More Events Section Showcase */}
      <div className="pt-12 border-t border-ink-200 dark:border-ink-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-marigold-600">
              Explore Related Experiences
            </span>
            <h3 className="text-2xl font-black text-ink-900 dark:text-white mt-0.5">
              More Events in {event.category}
            </h3>
          </div>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setActiveTab("all-events");
            }}
            className="text-xs font-bold text-marigold-600 hover:text-marigold-500 flex items-center gap-1"
          >
            View All Catalogue ({events.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {relatedEvents.map((relatedEvt) => (
            <div
              key={relatedEvt.id}
              onClick={() => setSelectedEvent(relatedEvt)}
              className="group cursor-pointer rounded-2xl border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={relatedEvt.bannerImage}
                  alt={relatedEvt.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-marigold-600/90 text-white text-[10px] font-bold shadow-md">
                  {relatedEvt.category}
                </span>
                <div className="absolute bottom-3 left-3 right-3 text-white text-xs font-semibold flex items-center justify-between">
                  <span>{relatedEvt.date}</span>
                  <span>KES {relatedEvt.priceFrom.toLocaleString()}</span>
                </div>
              </div>
              <div className="p-4 space-y-1">
                <h4 className="font-bold text-sm text-ink-900 dark:text-white group-hover:text-marigold-600 transition-colors line-clamp-1">
                  {relatedEvt.title}
                </h4>
                <p className="text-xs text-ink-500 line-clamp-2">{relatedEvt.tagline || relatedEvt.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
