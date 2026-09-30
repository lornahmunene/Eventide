"use client";

import React from "react";
import { EventItem } from "@/types";
import { useApp } from "@/context/AppContext";

interface EventMarqueeStripProps {
  events: EventItem[];
}

export const EventMarqueeStrip: React.FC<EventMarqueeStripProps> = ({ events }) => {
  const { setSelectedEvent } = useApp();

  if (events.length === 0) return null;

  // Duplicate events array so the marquee loops infinitely without gap
  const marqueeEvents = [...events, ...events];

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-ink-200 dark:border-ink-800 bg-ink-950 p-2 shadow-2xl group">
      {/* Side gradient blur overlays for smooth edge fading */}
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-ink-950 to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 bg-gradient-to-l from-ink-950 to-transparent z-20 pointer-events-none" />

      {/* Infinite Looping Right-to-Left Marquee Track */}
      <div className="animate-marquee flex items-center gap-4 py-1">
        {marqueeEvents.map((evt, idx) => (
          <div
            key={`${evt.id}-${idx}`}
            onClick={() => setSelectedEvent(evt)}
            className="group/item relative shrink-0 h-44 sm:h-52 lg:h-60 w-64 sm:w-80 rounded-2xl overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:z-30 border border-white/10"
          >
            <img
              src={evt.bannerImage}
              alt={evt.title}
              className="w-full h-full object-cover brightness-105 group-hover/item:brightness-110 group-hover/item:scale-110 transition-all duration-500"
            />
            {/* Subtle hover ring */}
            <div className="absolute inset-0 ring-2 ring-transparent group-hover/item:ring-marigold-500 rounded-2xl transition-all" />
          </div>
        ))}
      </div>
    </div>
  );
};
