import { CategoryType, EventItem } from "@/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// --- Shapes returned by the Flask backend (see backend/models.py) ---

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: "Attendee" | "Vendor" | "Planner";
  phone_number?: string | null;
  created_at?: string;
}

export interface BackendAttendee {
  id: number;
  event_id: number;
  name: string;
  phone_number: string;
  registered_at: string;
}

export interface BackendEvent {
  id: number;
  name: string;
  category: "Workshop" | "Concert" | "Tech Event" | "Social Event";
  date: string;
  time: string;
  location: string;
  attendees?: number;
  votes?: number;
}

export interface BackendVendor {
  id: number;
  event_id: number | null;
  name: string;
  phone_number: string;
  category: string | null;
  status: "pending" | "confirmed" | "issue";
}

export interface BackendVendorMessage {
  id: number;
  vendor_id: number;
  message: string;
  direction: "outbound" | "inbound";
  status: string;
  created_at: string;
}

export interface BackendTriviaQuestion {
  id: number;
  event_id: number;
  question: string;
  options: string[];
  correct_option_index: number;
  airtime_reward: number;
  difficulty?: string;
  explanation?: string;
  created_at?: string;
}

// --- Category + banner mapping (backend has no images/pricing/tiers,
// so we fill those in with sensible defaults for the existing UI) ---

const CATEGORY_MAP: Record<BackendEvent["category"], CategoryType> = {
  Workshop: "Education",
  Concert: "Concerts",
  "Tech Event": "Tech",
  "Social Event": "Arts",
};

const BANNER_MAP: Record<CategoryType, string> = {
  Concerts: "/Concert1.jpeg",
  Tech: "/Tech1.jpeg",
  Arts: "/ART1.jpeg",
  Education: "/Tech2.jpeg",
  Food: "/FOOD1.jpeg",
  Fashion: "/Fashion1.jpeg",
};

function parseEventDate(dateStr: string): boolean {
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return false;
  return parsed.getTime() < Date.now();
}

/** Maps a backend Event (lean, USSD-oriented) into the frontend's richer EventItem shape. */
export function adaptBackendEvent(event: BackendEvent): EventItem {
  const category = CATEGORY_MAP[event.category] ?? "Tech";
  return {
    id: `backend-${event.id}`,
    title: event.name,
    tagline: `${event.category} at ${event.location}`,
    category,
    date: event.date,
    time: event.time,
    venue: event.location,
    city: event.location,
    priceFrom: 0,
    bannerImage: BANNER_MAP[category],
    description: `Register for ${event.name} by dialling our USSD code, or reserve your spot below.`,
    tags: [],
    ticketTiers: [
      {
        id: `backend-${event.id}-general`,
        name: "General entry",
        price: 0,
        description: "Free entry - registration required",
        availableQuantity: 500,
      },
    ],
    isPassed: parseEventDate(event.date),
    isFeatured: false,
  };
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request to ${path} failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  // Accounts
  registerAccount: (data: { name: string; email: string; password: string; role: "Attendee" | "Vendor" | "Planner"; phone_number?: string }) =>
    request<BackendUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  loginAccount: (data: { email: string; password: string }) =>
    request<BackendUser>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getCurrentUser: () => request<BackendUser>("/api/auth/me"),
  logoutAccount: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  // Events
  getEvents: () => request<BackendEvent[]>("/api/events"),
  getEvent: (id: number) => request<BackendEvent>(`/api/events/${id}`),
  createEvent: (data: {
    name: string;
    date: string;
    time: string;
    location: string;
    category: BackendEvent["category"];
  }) =>
    request<BackendEvent>("/api/events", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Attendees
  createAttendee: (data: { event_id: number; name: string; email?: string; phone_number: string }) =>
    request<BackendAttendee>("/api/attendees", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAttendees: (eventId?: number) =>
    request<{ total_attendees: number; attendees: unknown[] }>(
      `/api/attendees${eventId ? `?event_id=${eventId}` : ""}`
    ),

  // Poll results
  getPollResults: (eventId?: number) =>
    request<{ total_votes: number; results: Record<string, number> }>(
      `/api/poll-results${eventId ? `?event_id=${eventId}` : ""}`
    ),

  // Dashboard
  getDashboard: (eventId: number) => request(`/api/dashboard/${eventId}`),

  // Vendors
  getVendors: () => request<BackendVendor[]>("/api/vendors"),
  createVendor: (data: { name: string; phone_number: string; category?: string; event_id?: number }) =>
    request<BackendVendor>("/api/vendors", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getVendorMessages: (vendorId: number) =>
    request<BackendVendorMessage[]>(`/api/vendors/${vendorId}/messages`),
  sendVendorMessage: (vendorId: number, message: string) =>
    request<BackendVendorMessage>(`/api/vendors/${vendorId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Trivia
  getTriviaQuestions: (eventId: number) =>
    request<BackendTriviaQuestion[]>(`/api/events/${eventId}/trivia`),
  createTriviaQuestion: (
    eventId: number,
    data: {
      question: string;
      options: string[];
      correct_option_index: number;
      airtime_reward?: number;
      difficulty?: string;
      explanation?: string;
    }
  ) =>
    request<BackendTriviaQuestion>(`/api/events/${eventId}/trivia`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteTriviaQuestion: (questionId: number) =>
    request<{ success: boolean; message: string }>(`/api/trivia/${questionId}`, {
      method: "DELETE",
    }),
};
