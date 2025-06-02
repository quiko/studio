
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
