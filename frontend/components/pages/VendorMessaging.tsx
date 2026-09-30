"use client";

import React, { useEffect, useState, useCallback } from "react";
import { api, BackendVendor, BackendVendorMessage } from "@/lib/api";
import { useApp } from "@/context/AppContext";
import { Store, Send, RefreshCw, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "text-marigold-700 dark:text-marigold-400 bg-marigold-500/10",
  confirmed: "text-savanna-700 dark:text-savanna-400 bg-savanna-500/10",
  issue: "text-hibiscus-700 dark:text-hibiscus-400 bg-hibiscus-500/10",
};

export const VendorMessaging: React.FC = () => {
  const { triggerToast } = useApp();
  const [vendors, setVendors] = useState<BackendVendor[]>([]);
  const [selected, setSelected] = useState<BackendVendor | null>(null);
  const [messages, setMessages] = useState<BackendVendorMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = useCallback(() => {
    setLoadingVendors(true);
    api
      .getVendors()
      .then((data) => {
        setVendors(data);
        setError(null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not reach backend"))
      .finally(() => setLoadingVendors(false));
  }, []);

  const loadMessages = useCallback((vendorId: number) => {
    setLoadingMessages(true);
    api
      .getVendorMessages(vendorId)
      .then(setMessages)
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load messages"))
      .finally(() => setLoadingMessages(false));
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    if (selected) loadMessages(selected.id);
  }, [selected, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !draft.trim()) return;
    setSending(true);
    try {
      await api.sendVendorMessage(selected.id, draft.trim());
      setDraft("");
      loadMessages(selected.id);
      triggerToast(`Message sent to ${selected.name}`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-artistic text-3xl text-ink-900 dark:text-paper">Vendor messages</h1>
          <p className="text-sm text-ink-500 dark:text-ink-400 mt-1">
            Two-way SMS with your vendors. Replies with CONFIRM or ISSUE update status automatically.
          </p>
        </div>
        <button
          onClick={loadVendors}
          className="flex items-center gap-1.5 border border-ink-200 dark:border-ink-800 px-3 py-1.5 text-xs font-medium text-ink-600 dark:text-ink-300 hover:border-marigold-500 transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 border border-hibiscus-500/40 bg-hibiscus-50 dark:bg-hibiscus-950/30 text-hibiscus-700 dark:text-hibiscus-400 px-4 py-2.5 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error} - is the backend running at the configured API URL?
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] border border-ink-200 dark:border-ink-800 min-h-[420px]">
        {/* Vendor list */}
        <div className="border-b md:border-b-0 md:border-r border-ink-200 dark:border-ink-800">
          {loadingVendors ? (
            <div className="p-4 text-sm text-ink-400">Loading vendors...</div>
          ) : vendors.length === 0 ? (
            <div className="p-4 text-sm text-ink-400">
              No vendors yet. They&apos;ll appear here once someone applies from the vending hub.
            </div>
          ) : (
            <ul>
              {vendors.map((v) => (
                <li key={v.id}>
                  <button
                    onClick={() => setSelected(v)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3 text-left text-sm border-b border-ink-100 dark:border-ink-900 transition-colors ${
                      selected?.id === v.id
                        ? "bg-marigold-50 dark:bg-marigold-950/30"
                        : "hover:bg-ink-50 dark:hover:bg-ink-900"
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <Store className="h-4 w-4 text-marigold-600 shrink-0" />
                      <span className="truncate">
                        <span className="block font-medium text-ink-900 dark:text-paper truncate">{v.name}</span>
                        <span className="block text-xs text-ink-400 truncate">{v.phone_number}</span>
                      </span>
                    </span>
                    <span
                      className={`shrink-0 px-1.5 py-0.5 text-[10px] font-semibold ${
                        STATUS_STYLES[v.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {v.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Thread */}
        <div className="flex flex-col">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-sm text-ink-400 p-8 text-center">
              Select a vendor on the left to see the message thread.
            </div>
          ) : (
            <>
              <div className="border-b border-ink-200 dark:border-ink-800 px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="block font-medium text-ink-900 dark:text-paper">{selected.name}</span>
                  <span className="block text-xs text-ink-400">{selected.phone_number}</span>
                </div>
                <span
                  className={`flex items-center gap-1 px-2 py-1 text-[10px] font-semibold ${
                    STATUS_STYLES[selected.status] || STATUS_STYLES.pending
                  }`}
                >
                  {selected.status === "confirmed" && <CheckCircle2 className="h-3 w-3" />}
                  {selected.status === "pending" && <Clock className="h-3 w-3" />}
                  {selected.status === "issue" && <AlertTriangle className="h-3 w-3" />}
                  {selected.status}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px]">
                {loadingMessages ? (
                  <p className="text-sm text-ink-400">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-ink-400">No messages yet. Send the first one below.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[75%] px-3.5 py-2.5 text-sm ${
                        m.direction === "outbound"
                          ? "ml-auto bg-marigold-500 text-ink-950"
                          : "mr-auto bg-ink-100 dark:bg-ink-800 text-ink-800 dark:text-ink-100"
                      }`}
                    >
                      <p>{m.message}</p>
                      <span
                        className={`block mt-1 text-[10px] ${
                          m.direction === "outbound" ? "text-ink-900/60" : "text-ink-400"
                        }`}
                      >
                        {m.direction === "outbound" ? "You" : selected.name} ·{" "}
                        {new Date(m.created_at).toLocaleString()} · {m.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={handleSend}
                className="border-t border-ink-200 dark:border-ink-800 p-3 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder={`Message ${selected.name}...`}
                  className="flex-1 border border-ink-300 dark:border-ink-700 bg-ink-50 dark:bg-ink-800 px-3.5 py-2 text-sm text-ink-900 dark:text-white focus:border-marigold-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={sending || !draft.trim()}
                  className="flex items-center gap-1.5 bg-marigold-500 hover:bg-marigold-600 disabled:opacity-50 disabled:cursor-not-allowed text-ink-950 px-4 py-2 text-sm font-semibold transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
