
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, CalendarDays, Users, Sparkles, Music2, UserCircle, MessageSquare, FileText, Search, BarChart } from 'lucide-react';

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
    label: 'Suggest Artists',
    href: '/dashboard/suggest-artists',
    icon: Users, // Using Users icon as per previous implementation for suggestions
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
    label: 'Music Industry Analytics',
    href: '/dashboard/analytics',
    icon: BarChart,
    allowedUsers: [UserType.ORGANIZER, UserType.ARTIST],
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
  name: string;
  genre: string;
  portfolioAudio: string;
  portfolioVideo: string;
  reviews: string; // Placeholder for actual review system
  indicativeRates: string;
  profileImage: string;
};

export const DEFAULT_ARTIST_PROFILE: ArtistProfileData = {
  name: '',
  genre: '',
  portfolioAudio: '',
  portfolioVideo: '',
  reviews: 'No reviews yet.',
  indicativeRates: '',
  profileImage: 'https://placehold.co/150x150.png',
};


export type GeneratedContractStatus = 
  | "draft" 
  | "pending_artist_signature" 
  | "pending_organizer_signature" // May not be used if organizer signs first
  | "signed_by_organizer" // Could be an interim status
  | "signed_by_artist" // Could be an interim status
  | "signed" // Replaces "active" or "completed" for mutual signature
  | "completed" // For post-event fulfillment tracking
  | "cancelled";

export type GeneratedContractData = {
  id: string;
  organizerId: string; // Firebase UID
  organizerName: string;
  artistId?: string; // Firebase UID - to be filled later if artist exists on platform
  artistName: string; // Name entered by organizer
  eventName: string;
  eventDate: string; // ISO String
  eventLocation: string;
  fee: string;
  clauses: string; // Custom clauses added by organizer
  status: GeneratedContractStatus;
  createdAt: string; // ISO String
  signedByOrganizer: boolean;
  signedByArtist: boolean;
  // contractUrl?: string; // Link to PDF in Firebase Storage - for future
  // signedByBoth: boolean; // Can be derived from signedByOrganizer && signedByArtist or use status "signed"
};


// Messaging System Data
export const CURRENT_USER_MOCK_ID = 'currentUserMockId'; // Represents the logged-in user

export interface Message {
  id: string;
  senderId: string; // Use CURRENT_USER_MOCK_ID for the logged-in user, or another ID for contact
  text: string;
  timestamp: string; // ISO string e.g. new Date().toISOString()
}

export interface Conversation {
  id: string;
  contactId: string;
  contactName: string;
  contactAvatar: string; // URL
  contactRole: UserType; // Organizer or Artist
  lastMessagePreview: string;
  lastMessageTimestamp: string; // ISO string
  unreadCount: number;
  messages: Message[];
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
    messages: [
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
    messages: [
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
    messages: [
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
    messages: [
      { id: 'msg-4-1', senderId: 'artist-delta', text: "My availability for next month is open. Let me know what dates you're considering.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
    ],
  }
];

    
