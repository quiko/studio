
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserType, type EventItem, type ArtistProfileData, DEFAULT_ARTIST_PROFILE } from '@/lib/constants';

interface UserContextType {
  userType: UserType;
  setUserType: (userType: UserType) => void;
  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  updateEvent: (event: EventItem) => void;
  deleteEvent: (eventId: string) => void;
  artistProfiles: Record<string, ArtistProfileData>; // Store profiles by user ID (mocked)
  getArtistProfile: (userId: string) => ArtistProfileData;
  updateArtistProfile: (userId: string, profile: ArtistProfileData) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_USER_TYPE = 'maestroai_user_type';
const LOCAL_STORAGE_KEY_EVENTS = 'maestroai_events';
const LOCAL_STORAGE_KEY_ARTIST_PROFILES = 'maestroai_artist_profiles';

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userType, setUserTypeState] = useState<UserType>(UserType.NONE);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [artistProfiles, setArtistProfiles] = useState<Record<string, ArtistProfileData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUserType = localStorage.getItem(LOCAL_STORAGE_KEY_USER_TYPE) as UserType | null;
      if (storedUserType && Object.values(UserType).includes(storedUserType)) {
        setUserTypeState(storedUserType);
      } else {
        setUserTypeState(UserType.NONE);
      }

      const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }

      const storedArtistProfiles = localStorage.getItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES);
      if (storedArtistProfiles) {
        setArtistProfiles(JSON.parse(storedArtistProfiles));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      // Set default values if localStorage access fails or data is corrupt
      setUserTypeState(UserType.NONE);
      setEvents([]);
      setArtistProfiles({});
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setUserType = (newUserType: UserType) => {
    setUserTypeState(newUserType);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_USER_TYPE, newUserType);
    }
  };

  const persistEvents = (updatedEvents: EventItem[]) => {
    setEvents(updatedEvents);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_EVENTS, JSON.stringify(updatedEvents));
    }
  };

  const addEvent = (event: Omit<EventItem, 'id'>) => {
    const newEvent = { ...event, id: Date.now().toString() };
    persistEvents([...events, newEvent]);
  };

  const updateEvent = (updatedEvent: EventItem) => {
    persistEvents(events.map(event => event.id === updatedEvent.id ? updatedEvent : event));
  };

  const deleteEvent = (eventId: string) => {
    persistEvents(events.filter(event => event.id !== eventId));
  };
  
  const persistArtistProfiles = (updatedProfiles: Record<string, ArtistProfileData>) => {
    setArtistProfiles(updatedProfiles);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES, JSON.stringify(updatedProfiles));
    }
  };

  const getArtistProfile = (userId: string): ArtistProfileData => {
    return artistProfiles[userId] || { ...DEFAULT_ARTIST_PROFILE, name: userId === UserType.ARTIST ? "Your Artist Name" : "Artist Name" };
  };

  const updateArtistProfile = (userId: string, profile: ArtistProfileData) => {
    persistArtistProfiles({ ...artistProfiles, [userId]: profile });
  };


  return (
    <UserContext.Provider value={{ userType, setUserType, events, addEvent, updateEvent, deleteEvent, artistProfiles, getArtistProfile, updateArtistProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
