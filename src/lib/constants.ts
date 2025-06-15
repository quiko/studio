
import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, CalendarDays, Users, Sparkles, Music2, UserCircle, MessageSquare, FileText, Search, BarChart } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export enum UserType {
  ORGANIZER = 'organizer',
  ARTIST = 'artist',
  NONE = 'none',
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  allowedUsers: UserType[];
}

// User Profile Data
export type UserProfile = {
  uid: string; // Firebase UID
  id: string; // Firestore Document ID
  fullName?: string;
  role: UserType;
  email?: string;
  createdAt?: Timestamp | string; // Firestore timestamp or ISO string
  photoURL?: string; // From Firebase Auth, can be a fallback
  genre?: string; // Generic genre, mainly for initial artist setup if needed
  artistProfileData?: ArtistProfileData; // Detailed artist-specific profile
};

export const APP_NAME = "OBSESSION";

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedUsers: [UserType.ORGANIZER, UserType.ARTIST],
  },
  {
    label: 'Events',
    href: '/dashboard/events',
    icon: CalendarDays,
    allowedUsers: [UserType.ORGANIZER],
  },
  {
    label: 'Events',
    href: '/dashboard/events-for-artists',
    icon: CalendarDays,
    allowedUsers: [UserType.ARTIST],
  },
  {
    label: 'Suggest Artists',
    href: '/dashboard/suggest-artists',
    icon: Users,
    allowedUsers: [UserType.ORGANIZER],
  },
  {
    label: 'Discover Artists',
    href: '/dashboard/discover-artists',
    icon: Search,
    allowedUsers: [UserType.ORGANIZER],
  },
  {
    label: 'My Profile',
    href: '/dashboard/profile',
    icon: UserCircle,
    allowedUsers: [UserType.ARTIST],
  },
  {
    label: 'AI Music Studio',
    href: '/dashboard/create-music',
    icon: Music2,
    allowedUsers: [UserType.ARTIST],
  },
  {
    label: 'Audience Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
 allowedUsers: [UserType.ARTIST, UserType.ORGANIZER],
  },
  {
    label: 'Messages',
    href: '/dashboard/messages',
    icon: MessageSquare,
    allowedUsers: [UserType.ORGANIZER, UserType.ARTIST],
  },
  {
    label: 'Contracts',
    href: '/dashboard/contracts',
    icon: FileText,
    allowedUsers: [UserType.ORGANIZER, UserType.ARTIST],
  },
];

export type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  budget: string;
  description: string;
};

export type ArtistProfileData = {
  name: string; // Artist/Band Name
  genre: string; // Main genre
  portfolioAudio: string; // URL
  portfolioVideo: string; // URL
  bio: string; // Biography or description
  priceRange: string; // e.g., "$500 - $1000" - Changed from indicativeRates
  profileImage: string; // URL to the image in Firebase Storage or placeholder, required
  dataAiHint?: string; // Optional hint for AI image services if this image is used as a base
  indicativeRates?: number; // Base numeric rate, optional
};

export const DEFAULT_ARTIST_PROFILE: ArtistProfileData = {
  name: '',
  genre: '',
  portfolioAudio: '',
  bio: '', // Added bio
  portfolioVideo: '',
  priceRange: '', // Defaulted to empty string, can also be undefined
  profileImage: 'https://placehold.co/150x150.png',
  dataAiHint: 'abstract musician',
  indicativeRates: undefined,
};


export type GeneratedContractStatus =
  | "draft"
  | "pending_artist_signature"
  | "pending_organizer_signature"
  | "signed_by_organizer"
  | "signed_by_artist"
  | "signed"
  | "completed"
  | "cancelled";

export type GeneratedContractData = {
  id: string;
  organizerId: string;
  organizerName: string;
  artistId?: string;
  artistName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  fee: string;
  clauses: string;
  status: GeneratedContractStatus;
  createdAt: string;
  signedByOrganizer: boolean;
  signedByArtist: boolean;
};


// Messaging System Data
export const CURRENT_USER_MOCK_ID = 'currentUserMockId';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactRole: string; // Keep as string: 'artist' or 'organizer' based on MOCK_CONVERSATIONS
  lastMessagePreview: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  messages?: Message[];
  // Firebase specific fields, if directly mapping from Firestore
  participants?: string[]; // Array of Firebase UIDs
  // Unread count might be an object if stored per participant:
  // unreadCount?: { [userId: string]: number };
}


export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'convo-1',
    contactId: 'organizer-alpha',
    contactName: 'Alex Ray (SoundWave Events)',
    contactAvatar: 'https://placehold.co/40x40.png?text=AR',
    contactRole: UserType.ORGANIZER,
    lastMessagePreview: "Perfect, see you then!",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    unreadCount: 0,
    messages: [ // Added messages array
      { id: 'msg-1-1', senderId: 'organizer-alpha', text: "Hey! Just wanted to confirm the soundcheck time for Friday's gig. Is 3 PM still good for you?", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'msg-1-2', senderId: CURRENT_USER_MOCK_ID, text: "Hi Alex, yes 3 PM works great for me. Looking forward to it!", timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
      { id: 'msg-1-3', senderId: 'organizer-alpha', text: "Perfect, see you then!", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    ],
  },
  {
    id: 'convo-2',
    contactId: 'artist-beta',
    contactName: 'Serena Vibes',
    contactAvatar: 'https://placehold.co/40x40.png?text=SV',
    contactRole: UserType.ARTIST,
    lastMessagePreview: "Thanks for the offer, I'll review the contract details tonight.",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unreadCount: 1,
    messages: [ // Added messages array
      { id: 'msg-2-1', senderId: CURRENT_USER_MOCK_ID, text: "Hi Serena, loved your latest track! We'd be thrilled to have you perform at our upcoming 'Indie Fest'. I've sent over a draft contract.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { id: 'msg-2-2', senderId: 'artist-beta', text: "Hey there! That's amazing to hear, thank you! Sounds like a great event.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString() },
      { id: 'msg-2-3', senderId: 'artist-beta', text: "Thanks for the offer, I'll review the contract details tonight.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
    ],
  },
  {
    id: 'convo-3',
    contactId: 'organizer-gamma',
    contactName: 'Groove Fest HQ',
    contactAvatar: 'https://placehold.co/40x40.png?text=GF',
    contactRole: UserType.ORGANIZER,
    lastMessagePreview: "Can you send over your tech rider when you get a chance?",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    unreadCount: 0,
    messages: [ // Added messages array
      { id: 'msg-3-1', senderId: 'organizer-gamma', text: "Following up on our discussion for Groove Fest main stage. We're very excited!", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString() },
      { id: 'msg-3-2', senderId: 'organizer-gamma', text: "Can you send over your tech rider when you get a chance?", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
  },
  {
    id: 'convo-4',
    contactId: 'artist-delta',
    contactName: 'Mikey Drums',
    contactAvatar: 'https://placehold.co/40x40.png?text=MD',
    contactRole: UserType.ARTIST,
    lastMessagePreview: "My availability for next month is open. Let me know what dates you're considering.",
    lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    unreadCount: 3,
    messages: [ // Added messages array
      { id: 'msg-4-1', senderId: 'artist-delta', text: "My availability for next month is open. Let me know what dates you're considering.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
  },
];


export const userProfileSchema = z.object({
  uid: z.string(),
  id: z.string(), // Added id to schema
  fullName: z.string().optional(),
  role: z.nativeEnum(UserType).optional().default(UserType.NONE), // Use nativeEnum for UserType, make optional with default
  genre: z.string().optional(),
  email: z.string().email().optional(),
  createdAt: z.union([z.string(), z.instanceof(Timestamp)]).optional(), // Allow string or Timestamp
  photoURL: z.string().url().optional(),
  artistProfileData: z.custom<ArtistProfileData>().optional(), // Zod doesn't have a direct way to validate nested complex types without defining them fully.
                                                              // Use z.custom or define ArtistProfileDataSchema if strict validation is needed here.
});

// ArtistContractItem is used for the Artist's view of contracts, adapted from GeneratedContractData
export type ArtistContractItem = {
  id: string;
  eventName: string;
  organizerName: string;
  dateProposed: string; // Formatted date string
  scopeOfWork: string;
  paymentAmount: string;
  paymentTerms: string;
  contractTerms: string; // Full clauses
  status: 'Pending Review' | 'Accepted' | 'Declined' | 'Fulfilled' | 'Cancelled'; // Simplified for artist view
};

// Mock data for artist contracts - keep this simple or derive from GeneratedContractData if needed
export const MOCK_ARTIST_CONTRACTS: ArtistContractItem[] = [
  {
    id: 'mock-contract-1',
    eventName: 'City Summer Fest',
    organizerName: 'City Events Co.',
    dateProposed: 'July 15, 2024',
    scopeOfWork: '60-minute live performance, original songs and select covers.',
    paymentAmount: '$1200',
    paymentTerms: '50% deposit, 50% on event day.',
    contractTerms: "Full contract details including rider, cancellation policy...",
    status: 'Pending Review',
  },
  // ... more mock contracts for artist view
];

