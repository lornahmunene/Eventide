"use client";

import React from "react";
import { EventItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { Calendar, MapPin, Store, Ticket, Clock, AlertCircle } from "lucide-react";

interface EventCardProps {
  event: EventItem;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const { setSelectedEvent, setTicketModalEvent, setActiveTab } = useApp();

  const isPassed = event.isPassed;

  return (
    <div
      className={`ticket-notch flex flex-col h-full border overflow-hidden ${
        isPassed
          ? "border-ink-200 dark:border-ink-800 bg-ink-100/70 dark:bg-ink-900/50 grayscale opacity-80"
          : "border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900"
      }`}
    >
      {/* Poster half */}
      <div
        onClick={() => setSelectedEvent(event)}
        className="relative h-44 w-full overflow-hidden cursor-pointer bg-ink-100 dark:bg-ink-950"
      >
        <img
          src={event.bannerImage}
          alt={event.title}
          className={`h-full w-full object-cover ${isPassed ? "grayscale contrast-75" : ""}`}
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isPassed ? (
            <span className="flex items-center gap-1 bg-ink-800/90 px-2.5 py-1 text-[11px] font-medium text-ink-100">
              <Clock className="h-3 w-3" />
              Event ended
            </span>
          ) : (
            <span className="bg-marigold-500 px-2.5 py-1 text-[11px] font-semibold text-ink-950">
              {event.category}
            </span>
          )}

          {event.vendorOpening && !isPassed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab("vending");
              }}
              className="flex items-center gap-1 bg-ink-900/90 px-2 py-1 text-[10px] font-medium text-paper hover:bg-ink-800 transition-colors"
            >
              <Store className="h-3 w-3" />
              Vendors needed
            </button>
          )}
        </div>
      </div>

      {/* Perforation between poster and stub */}
      <div className="ticket-perforation mx-4" />

      {/* Stub */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <h3
            onClick={() => setSelectedEvent(event)}
            className={`font-artistic text-lg leading-tight cursor-pointer line-clamp-1 ${
              isPassed ? "text-ink-500 dark:text-ink-400" : "text-ink-900 dark:text-paper"
            }`}
          >
            {event.title}
          </h3>
          <p className="mt-1 text-xs text-ink-500 dark:text-ink-400 line-clamp-2 leading-relaxed">
            {event.tagline || event.description}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-marigold-600" />
            {event.date}
          </span>
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 text-marigold-600 shrink-0" />
            <span className="truncate">{event.city}</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[10px] font-medium text-ink-400 block">
              {isPassed ? "Pass status" : "Tickets from"}
            </span>
            <span
              className={`text-base font-bold ${
                isPassed ? "text-ink-400 line-through" : "text-ink-900 dark:text-paper"
              }`}
            >
              KES {event.priceFrom.toLocaleString()}
            </span>
          </div>

          {isPassed ? (
            <button
              disabled
              className="flex items-center gap-1.5 px-3.5 py-2 bg-ink-200 dark:bg-ink-800 text-ink-400 text-xs font-medium cursor-not-allowed"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              Passed
            </button>
          ) : (
            <button
              onClick={() => setTicketModalEvent(event)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-marigold-500 hover:bg-marigold-600 text-ink-950 text-xs font-semibold transition-colors"
            >
              <Ticket className="h-3.5 w-3.5" />
              Get tickets
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
