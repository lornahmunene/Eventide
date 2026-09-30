"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Sun,
  Moon,
  Ticket,
  Store,
  PlusCircle,
  Compass,
  User,
} from "lucide-react";

const TABS = [
  { id: "home", label: "Home", icon: Compass },
  { id: "all-events", label: "All events", icon: Ticket },
  { id: "vending", label: "Vending hub", icon: Store },
  { id: "tickets", label: "My tickets", icon: Ticket },
] as const;

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    user,
    isRegistered,
    setShowRegistrationModal,
    activeTab,
    setActiveTab,
    purchasedTickets,
    isBackendConnected,
  } = useApp();

  const isOrganizer = user?.accountType === "Planner";

  const isActive = (id: string) =>
    activeTab === id || (id === "all-events" && activeTab === "event-details");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-ink-200 dark:border-ink-800 bg-paper/95 dark:bg-ink-950/95 backdrop-blur-md">
      <div className="h-1 w-full bg-marigold-500" />

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Wordmark */}
        <button
          onClick={() => setActiveTab("home")}
          className="flex items-center gap-2.5 group"
        >
          <span className="flex h-9 w-9 items-center justify-center bg-ink-900 dark:bg-marigold-500 text-marigold-400 dark:text-ink-950 font-display text-xl transition-transform group-hover:-rotate-3">
            E
          </span>
          <div className="flex flex-col items-start leading-none">
            <span className="font-artistic text-2xl tracking-tight text-ink-900 dark:text-paper">
              Eventide
            </span>
            <span className="text-[10px] font-medium text-ink-500 dark:text-ink-400 tracking-wide">
              East Africa&apos;s live event &amp; stall hub
            </span>
          </div>
        </button>

        {/* Primary nav - sharp tabs with a rule under the active one, no pill soup */}
        <nav className="hidden md:flex items-center gap-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive(id)
                  ? "text-ink-900 dark:text-paper"
                  : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {id === "tickets" && purchasedTickets.length > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-hibiscus-600 px-1 text-[10px] font-bold text-white">
                  {purchasedTickets.length}
                </span>
              )}
              {isActive(id) && (
                <span className="absolute -bottom-[1px] left-3.5 right-3.5 h-0.5 bg-marigold-500" />
              )}
            </button>
          ))}

          {isOrganizer && (
            <button
              onClick={() => setActiveTab("vendor-messages")}
              className={`relative ml-2 flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === "vendor-messages"
                  ? "text-ink-900 dark:text-paper"
                  : "text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-100"
              }`}
            >
              <Store className="h-4 w-4" />
              Vendor messages
              {activeTab === "vendor-messages" && (
                <span className="absolute -bottom-[1px] left-3.5 right-3.5 h-0.5 bg-marigold-500" />
              )}
            </button>
          )}

          {isOrganizer && (
            <button
            onClick={() => setActiveTab("create-event")}
            className={`ml-2 flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold transition-colors ${
              activeTab === "create-event"
                ? "bg-marigold-500 text-ink-950"
                : "border border-marigold-500 text-marigold-700 dark:text-marigold-400 hover:bg-marigold-500 hover:text-ink-950"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            Create event
            </button>
          )}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span
            title={isBackendConnected ? "Connected to the Eventide backend" : "Backend unreachable - showing demo data"}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium border ${
              isBackendConnected
                ? "border-savanna-600/40 text-savanna-700 dark:text-savanna-400"
                : "border-hibiscus-500/40 text-hibiscus-600 dark:text-hibiscus-400"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isBackendConnected ? "bg-savanna-600" : "bg-hibiscus-500"
              }`}
            />
            {isBackendConnected ? "Live" : "Demo data"}
          </span>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="flex h-9 w-9 items-center justify-center border border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:border-marigold-500 hover:text-marigold-600 transition-colors"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {isRegistered && user ? (
            <button
              onClick={() => setActiveTab("tickets")}
              className="flex items-center gap-2 border border-ink-200 dark:border-ink-800 px-3 py-1.5 text-sm font-medium text-ink-800 dark:text-ink-100 hover:border-marigold-500 transition-colors"
            >
              <span className="flex h-6 w-6 items-center justify-center bg-marigold-500 text-ink-950 text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowRegistrationModal(true)}
              className="flex items-center gap-1.5 bg-ink-900 dark:bg-marigold-500 px-3.5 py-1.5 text-sm font-semibold text-paper dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-marigold-400 transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              Register / sign in
            </button>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      <div className="md:hidden flex justify-around border-t border-ink-200 dark:border-ink-800 py-2 bg-paper dark:bg-ink-950">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
              isActive(id) ? "text-marigold-600 dark:text-marigold-400" : "text-ink-500"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </button>
        ))}
        {isOrganizer && (
          <button
          onClick={() => setActiveTab("create-event")}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors ${
            activeTab === "create-event" ? "text-marigold-600 dark:text-marigold-400" : "text-ink-500"
          }`}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Create</span>
          </button>
        )}
      </div>
    </header>
  );
};
