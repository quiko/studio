
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, CalendarDays, Users, Sparkles, Music2, UserCircle, MessageSquare, FileText, Search } from 'lucide-react';

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

export const MOCK_ARTISTS = [
  { id: '1', name: 'DJ Sparkle', genre: 'Electronic', rate: '$$$', portfolio: 'https://example.com/djsparkle', image: 'https://placehold.co/300x200.png', dataAiHint: 'dj music' },
  { id: '2', name: 'The Rocking Stones', genre: 'Rock', rate: '$$$$', portfolio: 'https://example.com/rockingstones', image: 'https://placehold.co/300x200.png', dataAiHint: 'rock band' },
  { id: '3', name: 'Smooth Jazz Trio', genre: 'Jazz', rate: '$$', portfolio: 'https://example.com/jazztrio', image: 'https://placehold.co/300x200.png', dataAiHint: 'jazz band' },
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

export type ArtistContractItem = {
  id: string;
  eventName: string;
  organizerName: string;
  status: 'Pending Review' | 'Accepted' | 'Declined' | 'Fulfilled' | 'Cancelled';
  dateProposed: string;
  scopeOfWork: string;
  paymentAmount: string;
  paymentTerms: string;
  contractTerms: string; // Could be a long string or a link to a document in a real app
};

export const MOCK_ARTIST_CONTRACTS: ArtistContractItem[] = [
  {
    id: 'contract-1',
    eventName: 'Summer Beats Festival',
    organizerName: 'Groove Masters Inc.',
    status: 'Pending Review',
    dateProposed: '2024-07-15',
    scopeOfWork: 'Perform a 60-minute DJ set featuring original tracks and popular remixes. Engage with the audience.',
    paymentAmount: '$1,500',
    paymentTerms: '50% upon signing, 50% post-performance.',
    contractTerms: `
      This Agreement is made on July 15, 2024, between Groove Masters Inc. ("Organizer") and DJ Sparkle ("Artist").
      1. Performance: Artist will perform a 60-minute DJ set at Summer Beats Festival on August 10, 2024, from 8:00 PM to 9:00 PM.
      2. Payment: Organizer will pay Artist $1,500 as follows: $750 upon signing this agreement and $750 within 7 days after the performance.
      3. Cancellation: If Organizer cancels less than 14 days before the event, the initial deposit is non-refundable. If Artist cancels, Artist will refund any payments received.
      4. Technical Rider: Organizer will provide a standard DJ booth, 2x CDJ-3000, 1x DJM-900NXS2 mixer, and monitors.
      5. Governing Law: This agreement is governed by the laws of California.
    `,
  },
  {
    id: 'contract-2',
    eventName: 'Corporate Gala Dinner',
    organizerName: 'Tech Solutions Ltd.',
    status: 'Accepted',
    dateProposed: '2024-06-20',
    scopeOfWork: 'Provide 2 hours of background jazz music during the dinner. Set includes 3 sets of 40 minutes each with 10-minute breaks.',
    paymentAmount: '$800',
    paymentTerms: 'Full payment upon completion of performance.',
    contractTerms: `
      Agreement between Tech Solutions Ltd. and Smooth Jazz Trio for performance at Corporate Gala Dinner on September 5, 2024.
      - Performance: 2 hours of live jazz music (3x40 min sets).
      - Fee: $800, paid within 5 business days post-event.
      - Artist provides own instruments. Organizer provides PA system suitable for a trio.
    `,
  },
  {
    id: 'contract-3',
    eventName: 'Rock the Park Charity Concert',
    organizerName: 'City Parks Foundation',
    status: 'Fulfilled',
    dateProposed: '2024-05-01',
    scopeOfWork: 'Headline performance of 90 minutes, including at least 3 songs from the latest album.',
    paymentAmount: '$5,000 (Charity Rate)',
    paymentTerms: 'Full payment received.',
    contractTerms: `
      Performance agreement for Rock the Park by The Rocking Stones on June 22, 2024.
      - Scope: 90-minute headline set.
      - Fee: $5,000.
      - All technical requirements as per artist rider submitted on April 25, 2024.
    `,
  },
];


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

    