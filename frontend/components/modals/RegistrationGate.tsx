"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { CategoryType } from "@/types";
import { Sparkles, Check, ArrowRight, User, Mail, Lock, Store, Music, Laptop, Palette, GraduationCap, Utensils, X } from "lucide-react";

export const RegistrationGate: React.FC = () => {
  const { showRegistrationModal, setShowRegistrationModal, registerUser, isRegistered } = useApp();
  const [mode, setMode] = useState<"register" | "login">("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("+254");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [accountType, setAccountType] = useState<"Attendee" | "Vendor" | "Planner">("Attendee");
  const [selectedInterests, setSelectedInterests] = useState<CategoryType[]>([
    "Concerts",
    "Tech",
    "Food",
  ]);

  if (!showRegistrationModal) return null;

  const categories: { name: CategoryType; icon: React.ReactNode }[] = [
    { name: "Concerts", icon: <Music className="h-4 w-4" /> },
    { name: "Tech", icon: <Laptop className="h-4 w-4" /> },
    { name: "Arts", icon: <Palette className="h-4 w-4" /> },
    { name: "Education", icon: <GraduationCap className="h-4 w-4" /> },
    { name: "Food", icon: <Utensils className="h-4 w-4" /> },
  ];

  const toggleInterest = (cat: CategoryType) => {
    if (selectedInterests.includes(cat)) {
      setSelectedInterests(selectedInterests.filter((c) => c !== cat));
    } else {
      setSelectedInterests([...selectedInterests, cat]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const displayName = name.trim() || (email ? email.split("@")[0] : "Eventide Guest");
    const displayEmail = email.trim() || "guest@eventide.com";

    try {
      await registerUser({ name: displayName, email: displayEmail, phone, accountType, interests: selectedInterests }, password, mode);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not connect to Eventide backend.");
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-2xl">
        {/* Close button if user is already registered */}
        {isRegistered && (
          <button
            onClick={() => setShowRegistrationModal(false)}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-ink-100 dark:bg-ink-800 text-ink-500 hover:text-ink-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-marigold-600 via-marigold-600 to-hibiscus-600 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-marigold-200" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-marigold-200">
              Welcome to Eventide
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {mode === "register" ? "Create Your Eventide Account" : "Welcome Back"}
          </h2>
          <p className="text-xs sm:text-sm text-marigold-100 mt-1">
            Discover live concerts, tech summits, food expos & vendor opportunities across East Africa.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-950/50 p-2">
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "register"
                ? "bg-white dark:bg-ink-800 text-marigold-600 dark:text-marigold-400 shadow-sm"
                : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
            }`}
          >
            New Registration
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === "login"
                ? "bg-white dark:bg-ink-800 text-marigold-600 dark:text-marigold-400 shadow-sm"
                : "text-ink-500 hover:text-ink-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Thompson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 pl-9 pr-4 py-2 text-sm text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none focus:ring-2 focus:ring-marigold-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="email"
                required
                placeholder="alex@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 pl-9 pr-4 py-2 text-sm text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none focus:ring-2 focus:ring-marigold-500/20"
              />
            </div>
          </div>

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">Phone Number</label>
              <input type="tel" required placeholder="+254 712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 px-4 py-2 text-sm text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800/50 pl-9 pr-4 py-2 text-sm text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none focus:ring-2 focus:ring-marigold-500/20"
              />
            </div>
          </div>

          {mode === "register" && (
            <>
              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                  Primary Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Attendee", "Vendor", "Planner"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAccountType(role)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        accountType === role
                          ? "border-marigold-500 bg-marigold-500/10 text-marigold-600 dark:text-marigold-400"
                          : "border-ink-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                      }`}
                    >
                      {role === "Vendor" && <Store className="h-4 w-4 mb-1" />}
                      {role === "Attendee" && <User className="h-4 w-4 mb-1" />}
                      {role === "Planner" && <Sparkles className="h-4 w-4 mb-1" />}
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Interests */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                  Select Event Categories You Love
                </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedInterests.includes(cat.name);
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => toggleInterest(cat.name)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          isSelected
                            ? "border-marigold-500 bg-marigold-600 text-white shadow-sm"
                            : "border-ink-300 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-marigold-500"
                        }`}
                      >
                        {cat.icon}
                        {cat.name}
                        {isSelected && <Check className="h-3 w-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {error && <div className="rounded-xl border border-hibiscus-500/30 bg-hibiscus-500/10 px-3 py-2 text-xs font-semibold text-hibiscus-600">{error}</div>}

          {/* Submit Action Button */}
          <button disabled={submitting}
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-marigold-600 to-marigold-600 hover:from-marigold-700 hover:to-marigold-700 text-white font-bold text-sm shadow-lg shadow-marigold-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{mode === "register" ? "Complete Registration & Enter" : "Sign In to Eventide"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>

        </form>
      </div>
    </div>
  );
};
