"use client";

import React, { useState, useEffect } from "react";
import { EventItem } from "@/types";
import { useApp } from "@/context/AppContext";
import { HeroSlideshowSkeleton } from "./HeroSlideshowSkeleton";
import { Calendar, MapPin, ChevronLeft, ChevronRight, Ticket, Flame, Sparkles, Store } from "lucide-react";

interface HeroSlideshowProps {
  events: EventItem[];
}

export const HeroSlideshow: React.FC<HeroSlideshowProps> = ({ events }) => {
  const { isSkeletonLoading, setSelectedEvent, setTicketModalEvent } = useApp();

  const slides = events;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  if (isSkeletonLoading) {
    return <HeroSlideshowSkeleton />;
  }

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full">
      {/* Main Hero Showcase Card */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative w-full h-[460px] sm:h-[500px] lg:h-[560px] rounded-3xl overflow-hidden shadow-2xl group border border-ink-200/80 dark:border-ink-800 bg-ink-950"
      >
        {/* Animated Progress Line */}
        <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
          <div
            key={currentIndex}
            className="h-full bg-gradient-to-r from-marigold-500 via-marigold-400 to-hibiscus-500 animate-progress"
            style={{ width: isHovered ? "100%" : undefined }}
          />
        </div>

        {/* Slide Images Background with crossfade transition */}
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              idx === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.bannerImage}
              alt={slide.title}
              className="w-full h-full object-cover object-center brightness-110 contrast-105 saturate-110 group-hover:scale-105 transition-transform duration-700"
            />
            {/* Lightweight gradient overlay for bright vibrant photos while preserving text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
          </div>
        ))}

        {/* Top Floating Badges & Slide Counter */}
        <div className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between text-white">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-marigold-600/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-marigold-600/30 border border-marigold-400/30">
              <Flame className="h-3.5 w-3.5 fill-marigold-200 animate-pulse" />
              Event Showcase #{currentIndex + 1} of {slides.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white text-xs font-semibold">
              {currentSlide.category}
            </span>
            {currentSlide.vendorOpening && (
              <span className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold border border-emerald-400/30">
                <Store className="h-3.5 w-3.5" />
                Vendors Wanted
              </span>
            )}
          </div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10 lg:p-12 text-white max-w-4xl">
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2 drop-shadow-lg bg-gradient-to-r from-white via-ink-100 to-ink-300 bg-clip-text text-transparent">
            {currentSlide.title}
          </h1>

          {/* Tagline */}
          <p className="text-xs sm:text-base text-ink-200 line-clamp-2 mb-4 max-w-2xl font-normal leading-relaxed">
            {currentSlide.tagline || currentSlide.description}
          </p>

          {/* Date & Location Info Pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-ink-200 mb-6">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
              <Calendar className="h-4 w-4 text-marigold-400" />
              <span className="font-semibold">{currentSlide.date} • {currentSlide.time}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15">
              <MapPin className="h-4 w-4 text-marigold-400" />
              <span className="font-semibold">{currentSlide.venue}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            {currentSlide.isPassed ? (
              <button
                disabled
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-ink-800 text-ink-400 font-bold text-xs cursor-not-allowed border border-ink-700"
              >
                Event Concluded
              </button>
            ) : (
              <button
                onClick={() => setTicketModalEvent(currentSlide)}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-marigold-600 via-marigold-600 to-hibiscus-600 hover:from-marigold-500 hover:to-hibiscus-500 text-white font-extrabold text-sm shadow-xl shadow-marigold-600/30 transition-all hover:scale-105 active:scale-95 border border-marigold-400/30"
              >
                <Ticket className="h-4 w-4" />
                Book Tickets (From KES {currentSlide.priceFrom.toLocaleString()})
              </button>
            )}

            <button
              onClick={() => setSelectedEvent(currentSlide)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/25 transition-all hover:scale-105"
            >
              <Sparkles className="h-4 w-4 text-marigold-300" />
              View Event Details
            </button>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/50 hover:bg-marigold-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/50 hover:bg-marigold-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
