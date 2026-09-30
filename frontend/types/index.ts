export type CategoryType = "Concerts" | "Tech" | "Arts" | "Education" | "Food" | "Fashion";

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  description: string;
  availableQuantity: number;
  isPopular?: boolean;
  earlyBirdEnabled?: boolean;
}

export interface VendorRequirement {
  id: string;
  category: "Food & Beverage" | "Tech Demos" | "Art & Craft" | "Merch & Retail" | "Services & Sound";
  title: string;
  spotsNeeded: number;
  spotsRemaining: number;
  boothFee: number;
  boothSize: string;
  perks: string[];
  deadline: string;
}

export interface TriviaQuestion {
  id: string;
  eventId: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  airtimeRewardKES: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  explanation?: string;
  createdAt: string;
}

export interface EventItem {
  id: string;
  title: string;
  tagline?: string;
  category: CategoryType;
  date: string; // ISO date string or formatted date
  time: string;
  venue: string;
  city: string;
  priceFrom: number;
  bannerImage: string;
  description: string;
  tags: string[];
  ticketTiers: TicketTier[];
  isPassed: boolean;
  isFeatured?: boolean;
  vendorOpening?: VendorRequirement;
  triviaQuestions?: TriviaQuestion[];
}

export interface VendorApplication {
  id: string;
  eventId: string;
  eventTitle: string;
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  description: string;
  portfolioUrl?: string;
  status: "Pending" | "Approved" | "Under Review";
  submittedAt: string;
}

export interface PurchasedTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  bannerImage: string;
  tierName: string;
  quantity: number;
  totalPaid: number;
  purchaseDate: string;
  qrCodeUrl: string;
  status: "Valid" | "Used" | "Expired";
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  interests: CategoryType[];
  accountType: "Attendee" | "Vendor" | "Planner";
  registeredAt: string;
}
