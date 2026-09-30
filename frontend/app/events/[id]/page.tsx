"use client";

import React, { use } from "react";
import { useApp } from "@/context/AppContext";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { EventDetailsPage } from "@/components/pages/EventDetailsPage";

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { events, setSelectedEvent } = useApp();

  const foundEvent = events.find((e) => e.id === id);

  React.useEffect(() => {
    if (foundEvent) {
      setSelectedEvent(foundEvent);
    }
  }, [foundEvent, setSelectedEvent]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100 transition-colors">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <EventDetailsPage />
      </main>
      <Footer />
    </div>
  );
}
