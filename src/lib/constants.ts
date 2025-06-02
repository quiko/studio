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

export const APP_NAME = "Kurate";

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
