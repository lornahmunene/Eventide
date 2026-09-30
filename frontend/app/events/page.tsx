"use client";

import React from "react";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { AllEventsPage } from "@/components/pages/AllEventsPage";
import { RegistrationGate } from "@/components/modals/RegistrationGate";

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-ink-950 text-ink-900 dark:text-ink-100 transition-colors">
      <Navbar />
      <RegistrationGate />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AllEventsPage />
      </main>
      <Footer />
    </div>
  );
}
