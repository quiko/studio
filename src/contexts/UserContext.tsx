
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserType, type EventItem, type ArtistProfileData, DEFAULT_ARTIST_PROFILE } from '@/lib/constants';

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  userRole: UserType;
  isLoading: boolean;
  setUserRoleState: (role: UserType) => void; // For direct role setting after signup/login
  logout: () => Promise<void>;
  events: EventItem[];
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  updateEvent: (event: EventItem) => void;
  deleteEvent: (eventId: string) => void;
  artistProfiles: Record<string, ArtistProfileData>;
  getArtistProfile: (userId: string) => ArtistProfileData;
  updateArtistProfile: (userId: string, profile: ArtistProfileData) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_EVENTS = 'maestroai_events';
const LOCAL_STORAGE_KEY_ARTIST_PROFILES = 'maestroai_artist_profiles'; // Still using LS for profiles for now

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserType>(UserType.NONE);
  const [isLoading, setIsLoading] = useState(true);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [artistProfiles, setArtistProfiles] = useState<Record<string, ArtistProfileData>>({});

  useEffect(() => {
    // Load events and profiles from localStorage (unchanged for now)
    try {
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents));
      }
      const storedArtistProfiles = localStorage.getItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES);
      if (storedArtistProfiles) {
        setArtistProfiles(JSON.parse(storedArtistProfiles));
      }
    } catch (error) {
      console.error("Failed to load non-auth data from localStorage", error);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        // Fetch role from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role as UserType || UserType.NONE);
        } else {
          // This case might happen if Firestore doc creation failed during signup
          // Or if user was created directly in Firebase console without a role
          setUserRole(UserType.NONE); 
        }
      } else {
        setFirebaseUser(null);
        setUserRole(UserType.NONE);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setUserRoleState = (role: UserType) => {
    setUserRole(role);
  };
  
  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setUserRole(UserType.NONE);
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setIsLoading(false);
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

  // userId here should be the Firebase UID
  const getArtistProfile = (userId: string): ArtistProfileData => {
    return artistProfiles[userId] || { ...DEFAULT_ARTIST_PROFILE, name: "Artist Profile" };
  };

  // userId here should be the Firebase UID
  const updateArtistProfile = (userId: string, profile: ArtistProfileData) => {
    persistArtistProfiles({ ...artistProfiles, [userId]: profile });
  };

  return (
    <UserContext.Provider value={{ 
      firebaseUser, 
      userRole, 
      isLoading, 
      setUserRoleState,
      logout,
      events, addEvent, updateEvent, deleteEvent, 
      artistProfiles, getArtistProfile, updateArtistProfile 
    }}>
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
