"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { EventItem, PurchasedTicket, UserProfile, VendorApplication, TriviaQuestion } from "@/types";
import { INITIAL_EVENTS } from "@/mockdata/eventsData";
import { api, adaptBackendEvent, BackendEvent } from "@/lib/api";

const INITIAL_TRIVIA: Record<string, TriviaQuestion[]> = {
  "evt-1": [
    {
      id: "triv-1-1",
      eventId: "evt-1",
      question: "Which iconic musical collective founded the Sol Generation movement?",
      options: ["Sauti Sol", "Elani", "Hart_The Band", "Just A Band"],
      correctOptionIndex: 0,
      airtimeRewardKES: 50,
      difficulty: "Easy",
      explanation: "Sauti Sol launched Sol Generation Records in 2019 to nurture East African creative talent.",
      createdAt: "2026-09-01T12:00:00Z",
    },
    {
      id: "triv-1-2",
      eventId: "evt-1",
      question: "What venue in Nairobi is hosting the 2026 Sun & Stars Festival?",
      options: ["Ngong Racecourse", "Carnivore Grounds", "KICC Courtyard", "Uhuru Park"],
      correctOptionIndex: 0,
      airtimeRewardKES: 50,
      difficulty: "Easy",
      explanation: "The festival takes over the lush lawns of Ngong Racecourse along Ngong Road.",
      createdAt: "2026-09-01T12:00:00Z",
    },
    {
      id: "triv-1-3",
      eventId: "evt-1",
      question: "Which traditional Luo stringed instrument is featured in Sauti Sol's acoustic sessions?",
      options: ["Nyatiti", "Orutu", "Kalimba", "Kora"],
      correctOptionIndex: 0,
      airtimeRewardKES: 100,
      difficulty: "Medium",
      explanation: "The Nyatiti is a revered eight-string bowl lyre from western Kenya.",
      createdAt: "2026-09-01T12:00:00Z",
    },
  ],
  "evt-6": [
    {
      id: "triv-6-1",
      eventId: "evt-6",
      question: "Which protocol allows offline basic phones to query event schedules without internet?",
      options: ["USSD (Unstructured Supplementary Service Data)", "NFC", "BLE Beacons", "eSIM"],
      correctOptionIndex: 0,
      airtimeRewardKES: 50,
      difficulty: "Easy",
      explanation: "USSD works over standard GSM cellular signaling channels on every basic phone.",
      createdAt: "2026-09-01T12:00:00Z",
    },
    {
      id: "triv-6-2",
      eventId: "evt-6",
      question: "What key communications infrastructure powers SMS and USSD integrations in Kenya?",
      options: ["Africa's Talking Gateway APIs", "Zigbee Bridges", "LoRaWAN Base Stations", "Starlink Terminals"],
      correctOptionIndex: 0,
      airtimeRewardKES: 100,
      difficulty: "Medium",
      explanation: "Africa's Talking provides scalable SMS, USSD, Voice and Airtime APIs across Africa.",
      createdAt: "2026-09-01T12:00:00Z",
    },
  ],
  "evt-11": [
    {
      id: "triv-11-1",
      eventId: "evt-11",
      question: "What is the traditional Kenyan style of open-flame barbecue celebrated at food expos?",
      options: ["Nyama Choma", "Mutura", "Kachumbari", "Samosa"],
      correctOptionIndex: 0,
      airtimeRewardKES: 50,
      difficulty: "Easy",
      explanation: "Nyama Choma is Kenya's beloved barbecue specialty, slow-roasted over hot coals.",
      createdAt: "2026-09-01T12:00:00Z",
    },
  ],
};

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  isRegistered: boolean;
  user: UserProfile | null;
  registerUser: (profile: Omit<UserProfile, "registeredAt">, password: string, mode?: "register" | "login") => Promise<void>;
  logoutUser: () => void;
  showRegistrationModal: boolean;
  setShowRegistrationModal: (show: boolean) => void;
  isSkeletonLoading: boolean;
  setIsSkeletonLoading: (loading: boolean) => void;
  toggleSkeleton: () => void;
  activeTab: "home" | "all-events" | "vending" | "tickets" | "create-event" | "event-details" | "vendor-messages";
  setActiveTab: (tab: "home" | "all-events" | "vending" | "tickets" | "create-event" | "event-details" | "vendor-messages") => void;
  events: EventItem[];
  addEvent: (event: EventItem) => Promise<void>;
  isBackendConnected: boolean;
  purchasedTickets: PurchasedTicket[];
  buyTicket: (event: EventItem, tierName: string, price: number, quantity: number) => Promise<void>;
  vendorApplications: VendorApplication[];
  submitVendorApplication: (app: Omit<VendorApplication, "id" | "status" | "submittedAt">) => Promise<VendorApplication>;
  triviaByEvent: Record<string, TriviaQuestion[]>;
  addTriviaQuestion: (question: Omit<TriviaQuestion, "id" | "createdAt">) => Promise<TriviaQuestion>;
  deleteTriviaQuestion: (questionId: string, eventId: string) => void;
  getTriviaForEvent: (eventId: string) => TriviaQuestion[];
  selectedEvent: EventItem | null;
  setSelectedEvent: (event: EventItem | null) => void;
  ticketModalEvent: EventItem | null;
  setTicketModalEvent: (event: EventItem | null) => void;
  toastMessage: string | null;
  triggerToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [isSkeletonLoading, setIsSkeletonLoading] = useState<boolean>(false);
  type TabType = "home" | "all-events" | "vending" | "tickets" | "create-event" | "event-details" | "vendor-messages";
  const [activeTab, setActiveTabState] = useState<TabType>("home");
  const [previousTab, setPreviousTab] = useState<TabType>("home");
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [purchasedTickets, setPurchasedTickets] = useState<PurchasedTicket[]>([]);
  const [vendorApplications, setVendorApplications] = useState<VendorApplication[]>([]);
  const [triviaByEvent, setTriviaByEvent] = useState<Record<string, TriviaQuestion[]>>(INITIAL_TRIVIA);
  const [selectedEvent, setSelectedEventState] = useState<EventItem | null>(null);

  const setActiveTab = (tab: TabType) => {
    if (tab === "home" || tab === "all-events" || tab === "vending" || tab === "tickets") {
      setPreviousTab(tab);
    }
    setActiveTabState(tab);
  };

  const setSelectedEvent = (evt: EventItem | null) => {
    setSelectedEventState(evt);
    if (evt) {
      setActiveTabState("event-details");
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      setActiveTabState(previousTab);
    }
  };
  const [ticketModalEvent, setTicketModalEvent] = useState<EventItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize theme and user session from localStorage
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("eventide_theme", "light");

    api.getCurrentUser()
      .then((backendUser) => {
        const parsed: UserProfile = {
          name: backendUser.name, email: backendUser.email, phone: backendUser.phone_number || undefined,
          accountType: backendUser.role, interests: [], registeredAt: backendUser.created_at || new Date().toISOString(),
        };
        setUser(parsed);
        setIsRegistered(true);
        localStorage.setItem("eventide_user", JSON.stringify(parsed));
      })
      .catch(() => {
        localStorage.removeItem("eventide_user");
        setUser(null);
        setIsRegistered(false);
        setShowRegistrationModal(true);
      });

    // Default mock purchased tickets for demo experience
    const initialTickets: PurchasedTicket[] = [
      {
        id: "tkt-101",
        eventId: "evt-7",
        eventTitle: "Afro-House Sunset Session: Vibes on the Deck",
        eventDate: "2026-10-05",
        eventVenue: "Alchemist Bar, Westlands",
        bannerImage: "/Concert2.jpeg",
        tierName: "Standard Entry",
        quantity: 2,
        totalPaid: 3000,
        purchaseDate: "2026-09-20",
        qrCodeUrl: "",
        status: "Valid",
      },
      {
        id: "tkt-102",
        eventId: "evt-2",
        eventTitle: "Safari Tech Summit 2026",
        eventDate: "2026-11-12",
        eventVenue: "Sarit Expo Centre, Westlands",
        bannerImage: "/Tech1.jpeg",
        tierName: "VIP Founder & Executive Pass",
        quantity: 1,
        totalPaid: 12000,
        purchaseDate: "2026-09-22",
        qrCodeUrl: "",
        status: "Valid",
      },
    ];
    setPurchasedTickets(initialTickets);

    const savedVendorApps = localStorage.getItem("eventide_vendor_apps");
    if (savedVendorApps) {
      try {
        const parsed = JSON.parse(savedVendorApps);
        if (Array.isArray(parsed)) {
          setVendorApplications(parsed);
        }
      } catch (e) {
        console.error("Failed to parse saved vendor applications", e);
      }
    }
  }, []);

  // Fetch real events from the Flask backend. Falls back to mock data (and
  // flags isBackendConnected = false) if the backend isn't reachable, so
  // frontend work isn't blocked when the server isn't running.
  useEffect(() => {
    let cancelled = false;

    api
      .getEvents()
      .then((backendEvents) => {
        if (cancelled) return;
        if (backendEvents.length > 0) {
          setEvents(backendEvents.map(adaptBackendEvent));
        }
        setIsBackendConnected(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          "Could not reach backend, showing demo data instead:",
          err instanceof Error ? err.message : err
        );
        setIsBackendConnected(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("eventide_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const registerUser = async (profileData: Omit<UserProfile, "registeredAt">, password: string, mode: "register" | "login" = "register") => {
    const backendUser = mode === "login"
      ? await api.loginAccount({ email: profileData.email, password })
      : await api.registerAccount({
          name: profileData.name,
          email: profileData.email,
          password,
          role: profileData.accountType,
          phone_number: profileData.phone,
        });

    const fullUser: UserProfile = {
      ...profileData,
      name: backendUser.name,
      email: backendUser.email,
      phone: backendUser.phone_number || profileData.phone,
      accountType: backendUser.role,
      registeredAt: backendUser.created_at || new Date().toISOString(),
    };
    setUser(fullUser);
    setIsRegistered(true);
    localStorage.setItem("eventide_user", JSON.stringify(fullUser));
    setShowRegistrationModal(false);
    setIsBackendConnected(true);
    triggerToast(mode === "register" ? `Welcome to Eventide, ${fullUser.name}!` : `Welcome back, ${fullUser.name}!`);
  };

  const logoutUser = () => {
    api.logoutAccount().catch(() => undefined);
    setUser(null);
    setIsRegistered(false);
    localStorage.removeItem("eventide_user");
    setShowRegistrationModal(true);
    triggerToast("Logged out successfully");
  };

  const toggleSkeleton = () => {
    setIsSkeletonLoading((prev) => !prev);
    triggerToast(`Skeleton mode ${!isSkeletonLoading ? "Enabled" : "Disabled"}`);
  };

  const addEvent = async (newEvent: EventItem) => {
    try {
      if (user?.accountType !== "Planner") {
        throw new Error("Only event organizers can create events.");
      }

    const reverseCategoryMap: Record<EventItem["category"], BackendEvent["category"]> = {
      Concerts: "Concert", Tech: "Tech Event", Education: "Workshop", Arts: "Social Event",
      Food: "Social Event", Fashion: "Social Event",
    };

    const created = await api.createEvent({
      name: newEvent.title,
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.venue,
      category: reverseCategoryMap[newEvent.category] ?? "Social Event",
    });

    const backendEvent: EventItem = { ...newEvent, id: `backend-${created.id}` };
    setEvents((prev) => [backendEvent, ...prev]);
    setIsBackendConnected(true);
    triggerToast("Event created and published!");
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Could not create the event.");
      throw err;
    }
  };
  const buyTicket = async (event: EventItem, tierName: string, price: number, quantity: number) => {
    try {
      if (!user) throw new Error("Please sign in before booking a ticket.");
    const backendId = event.id.startsWith("backend-") ? parseInt(event.id.replace("backend-", ""), 10) : NaN;
    if (isNaN(backendId)) {
      throw new Error("This event is not connected to the backend yet. Please refresh and try again.");
    }
    if (!user.phone) {
      throw new Error("Please add your phone number to your account before booking.");
    }

    await api.createAttendee({
      event_id: backendId,
      name: user.name,
      email: user.email,
      phone_number: user.phone,
    });

    const totalPaid = price * quantity;
    const ticketId = `tkt-${Math.random().toString(36).substring(2, 9)}`;
    const newTicket: PurchasedTicket = {
      id: ticketId, eventId: event.id, eventTitle: event.title, eventDate: event.date,
      eventVenue: event.venue, bannerImage: event.bannerImage, tierName, quantity, totalPaid,
      purchaseDate: new Date().toISOString().split("T")[0], qrCodeUrl: "", status: "Valid",
    };
    setPurchasedTickets((prev) => [newTicket, ...prev]);
    setTicketModalEvent(null);
    setIsBackendConnected(true);
    triggerToast(`🎉 Registration confirmed for ${event.title}`);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Could not complete registration.");
      throw err;
    }
  };
  const submitVendorApplication = async (
    appData: Omit<VendorApplication, "id" | "status" | "submittedAt">
  ): Promise<VendorApplication> => {
    const numericEventId = appData.eventId?.startsWith("backend-")
      ? parseInt(appData.eventId.replace("backend-", ""), 10)
      : parseInt(appData.eventId, 10);

    if (isNaN(numericEventId)) {
      throw new Error("This event is not connected to the backend yet. Please refresh and try again.");
    }

    await api.createVendor({
      name: `${appData.businessName} (${appData.contactPerson})`,
      phone_number: appData.phone,
      category: appData.category,
      event_id: numericEventId,
    });

    const newApp: VendorApplication = {
      ...appData, id: `vapp-${Math.random().toString(36).substring(2, 9)}`,
      status: "Pending", submittedAt: new Date().toISOString(),
    };
    setVendorApplications((prev) => {
      const updated = [newApp, ...prev];
      localStorage.setItem("eventide_vendor_apps", JSON.stringify(updated));
      return updated;
    });
    setIsBackendConnected(true);
    triggerToast(`Vendor Application Submitted for ${appData.businessName}!`);
    return newApp;
  };

  const addTriviaQuestion = async (
    questionData: Omit<TriviaQuestion, "id" | "createdAt">
  ): Promise<TriviaQuestion> => {
    const numericEventId = questionData.eventId?.startsWith("backend-")
      ? parseInt(questionData.eventId.replace("backend-", ""), 10)
      : parseInt(questionData.eventId, 10);
    if (isNaN(numericEventId)) throw new Error("This event is not connected to the backend.");

    const saved = await api.createTriviaQuestion(numericEventId, {
      question: questionData.question, options: questionData.options,
      correct_option_index: questionData.correctOptionIndex, airtime_reward: questionData.airtimeRewardKES,
      difficulty: questionData.difficulty, explanation: questionData.explanation,
    });
    const newQuestion: TriviaQuestion = { ...questionData, id: String(saved.id), createdAt: saved.created_at || new Date().toISOString() };

    setTriviaByEvent((prev) => ({ ...prev, [questionData.eventId]: [...(prev[questionData.eventId] || []), newQuestion] }));
    setEvents((prev) => prev.map((e) => e.id === questionData.eventId ? { ...e, triviaQuestions: [...(e.triviaQuestions || []), newQuestion] } : e));
    setIsBackendConnected(true);
    return newQuestion;
  };

  const deleteTriviaQuestion = (questionId: string, eventId: string) => {
    setTriviaByEvent((prev) => ({
      ...prev,
      [eventId]: (prev[eventId] || []).filter((q) => q.id !== questionId),
    }));

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === eventId && e.triviaQuestions) {
          return {
            ...e,
            triviaQuestions: e.triviaQuestions.filter((q) => q.id !== questionId),
          };
        }
        return e;
      })
    );

    const numericQId = parseInt(questionId, 10);
    if (!isNaN(numericQId)) {
      api.deleteTriviaQuestion(numericQId).catch((err) => {
        console.warn("Could not delete trivia question from backend:", err);
      });
    }
  };

  const getTriviaForEvent = (eventId: string): TriviaQuestion[] => {
    const fromMap = triviaByEvent[eventId] || [];
    const event = events.find((e) => e.id === eventId);
    const fromEvent = event?.triviaQuestions || [];

    const map = new Map<string, TriviaQuestion>();
    for (const q of [...fromMap, ...fromEvent]) {
      map.set(q.id, q);
    }
    return Array.from(map.values());
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        isRegistered,
        user,
        registerUser,
        logoutUser,
        showRegistrationModal,
        setShowRegistrationModal,
        isSkeletonLoading,
        setIsSkeletonLoading,
        toggleSkeleton,
        activeTab,
        setActiveTab,
        events,
        addEvent,
        isBackendConnected,
        purchasedTickets,
        buyTicket,
        vendorApplications,
        submitVendorApplication,
        triviaByEvent,
        addTriviaQuestion,
        deleteTriviaQuestion,
        getTriviaForEvent,
        selectedEvent,
        setSelectedEvent,
        ticketModalEvent,
        setTicketModalEvent,
        toastMessage,
        triggerToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
