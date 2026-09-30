"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { EventItem, VendorApplication, VendorRequirement } from "@/types";
import {
  Store,
  User,
  Phone,
  Mail,
  FileText,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Tag,
  Calendar,
  Sparkles,
} from "lucide-react";

interface VendorApplicationFormProps {
  event?: EventItem | null;
  opening?: VendorRequirement | null;
  onSuccess?: (app: VendorApplication) => void;
  onCancel?: () => void;
  className?: string;
}

export const VendorApplicationForm: React.FC<VendorApplicationFormProps> = ({
  event,
  opening,
  onSuccess,
  onCancel,
  className = "",
}) => {
  const { events, submitVendorApplication, triggerToast } = useApp();

  // If no event passed, let user choose from events
  const [selectedEventId, setSelectedEventId] = useState<string>(
    event?.id || (events.length > 0 ? events[0].id : "")
  );

  const activeEvent =
    event || events.find((e) => e.id === selectedEventId) || events[0];

  const defaultCategory =
    opening?.category || "Food & Beverage";

  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+254");
  const [category, setCategory] = useState<string>(defaultCategory);
  const [description, setDescription] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<VendorApplication | null>(null);

  const categories = [
    "Food & Beverage",
    "Tech Demos",
    "Art & Craft",
    "Merch & Retail",
    "Services & Sound",
  ];

  const validatePhone = (num: string): boolean => {
    // Basic phone validation for international format (+254...) or 10 digits
    const cleaned = num.replace(/[\s-]/g, "");
    return cleaned.length >= 10;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim() || !contactPerson.trim() || !phone.trim() || !description.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage("Please enter a valid phone number (e.g. +254 712 345 678).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Normalize phone number for Africa's Talking (+2547XXXXXXXX)
      let normalizedPhone = phone.trim().replace(/[\s-]/g, "");
      if (normalizedPhone.startsWith("0")) {
        normalizedPhone = "+254" + normalizedPhone.slice(1);
      } else if (!normalizedPhone.startsWith("+")) {
        normalizedPhone = "+" + normalizedPhone;
      }

      const targetEvent = activeEvent;
      const appData = {
        eventId: targetEvent ? targetEvent.id : "evt-general",
        eventTitle: targetEvent ? targetEvent.title : "Eventide Marketplace",
        businessName: businessName.trim(),
        contactPerson: contactPerson.trim(),
        email: email.trim(),
        phone: normalizedPhone,
        category,
        description: description.trim(),
        portfolioUrl: portfolioUrl.trim() || undefined,
      };

      const result = await submitVendorApplication(appData);
      setSubmittedApp(result);
      setIsSuccess(true);
      triggerToast(`Application submitted for ${businessName}!`);

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error("Vendor application error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit vendor application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess && submittedApp) {
    return (
      <div className={`p-6 sm:p-8 rounded-3xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 text-center space-y-5 animate-in fade-in ${className}`}>
        <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Application Received
          </span>
          <h3 className="text-2xl font-black text-ink-900 dark:text-white mt-1">
            Vendor Spot Requested!
          </h3>
          <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 max-w-md mx-auto mt-2 leading-relaxed">
            Your application for <strong>{submittedApp.businessName}</strong> at <strong>{submittedApp.eventTitle}</strong> has been registered.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-ink-50 dark:bg-ink-800/60 border border-ink-200/80 dark:border-ink-700 text-left text-xs space-y-2 max-w-md mx-auto">
          <div className="flex justify-between">
            <span className="text-ink-400 font-medium">Application ID:</span>
            <span className="font-mono font-bold text-ink-900 dark:text-white">{submittedApp.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400 font-medium">Contact Person:</span>
            <span className="font-bold text-ink-900 dark:text-white">{submittedApp.contactPerson}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400 font-medium">Phone (SMS Wire):</span>
            <span className="font-bold text-marigold-600 dark:text-marigold-400">{submittedApp.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400 font-medium">Category:</span>
            <span className="font-bold text-ink-900 dark:text-white">{submittedApp.category}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-400 font-medium">Status:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
              {submittedApp.status} (Under Review)
            </span>
          </div>
        </div>

        <p className="text-[11px] text-ink-400 max-w-sm mx-auto">
          Africa&apos;s Talking two-way SMS coordination will notify you at {submittedApp.phone} once the event organizer reviews your booth setup.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Done
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-5 ${className}`}>
      {errorMessage && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-hibiscus-500/10 border border-hibiscus-500/30 text-hibiscus-600 dark:text-hibiscus-400 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Target Event Context Banner */}
      {activeEvent && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-marigold-500/10 border border-marigold-500/20 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-marigold-600 text-white flex items-center justify-center shrink-0">
              <Store className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-marigold-600 dark:text-marigold-400 block">
                Target Event
              </span>
              <p className="font-bold text-ink-900 dark:text-white truncate">
                {activeEvent.title}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0 ml-2 hidden sm:block">
            <span className="text-[10px] text-ink-400 flex items-center gap-1 justify-end">
              <Calendar className="h-3 w-3" />
              {activeEvent.date}
            </span>
          </div>
        </div>
      )}

      {/* If no specific event is preselected and multiple events exist */}
      {!event && events.length > 1 && (
        <div>
          <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
            Choose Target Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 px-3.5 py-2.5 text-xs font-bold text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.date})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Business Name */}
      <div>
        <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
          Business / Brand Name *
        </label>
        <div className="relative">
          <Store className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="text"
            required
            placeholder="e.g. Mama Mboga Gourmet Street Bites"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Contact Person & Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
            Contact Person Full Name *
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="text"
              required
              placeholder="e.g. Lorna Wanjiku"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
            Phone Number (SMS Notifications) *
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="tel"
              required
              placeholder="+254 712 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-mono font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
            />
          </div>
          <span className="text-[10px] text-ink-400 mt-0.5 block">
            Africa&apos;s Talking two-way SMS coordination will reach you here.
          </span>
        </div>
      </div>

      {/* Email & Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
            Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
            <input
              type="email"
              required
              placeholder="vendor@business.co.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
            Vendor Service Category *
          </label>
          <div className="relative">
            <Tag className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-bold text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Description & Power Needs */}
      <div>
        <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
          Menu / Products Offered &amp; Power/Space Requirements *
        </label>
        <div className="relative">
          <FileText className="absolute left-3.5 top-3 h-4 w-4 text-ink-400" />
          <textarea
            rows={3}
            required
            placeholder="Describe what you plan to sell or display, equipment you will bring, and whether you require 220V power or refrigeration..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Portfolio / Social Media (Optional) */}
      <div>
        <label className="block text-xs font-bold text-ink-700 dark:text-ink-300 mb-1">
          Instagram / Website / Social Showcase (Optional)
        </label>
        <div className="relative">
          <Globe className="absolute left-3.5 top-2.5 h-4 w-4 text-ink-400" />
          <input
            type="url"
            placeholder="https://instagram.com/mybrand"
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
            className="w-full rounded-xl border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 pl-10 pr-3.5 py-2.5 text-xs font-medium text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex gap-3">
        {onCancel && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-ink-300 dark:border-ink-700 text-xs font-bold text-ink-600 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-marigold-600 hover:bg-marigold-700 text-white text-xs font-bold shadow-lg shadow-marigold-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>Submit Vendor Application</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
