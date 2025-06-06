
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserType, type EventItem, type ArtistProfileData, DEFAULT_ARTIST_PROFILE, type GeneratedContractData, type GeneratedContractStatus } from '@/lib/constants';

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
  artistProfiles: Record<string, ArtistProfileData>; // Keyed by Firebase UID
  getArtistProfile: (userId: string) => ArtistProfileData;
  updateArtistProfile: (userId: string, profile: ArtistProfileData) => void;
  organizerContracts: GeneratedContractData[];
  addOrganizerContract: (contractData: Omit<GeneratedContractData, 'id' | 'createdAt' | 'status' | 'signedByOrganizer' | 'signedByArtist'>) => void;
  artistSignsContract: (contractId: string) => void;
  organizerSignsContract: (contractId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_EVENTS = 'maestroai_events';
const LOCAL_STORAGE_KEY_ARTIST_PROFILES = 'maestroai_artist_profiles';
const LOCAL_STORAGE_KEY_ORGANIZER_CONTRACTS = 'maestroai_organizer_contracts';


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserType>(UserType.NONE);
  const [isLoading, setIsLoading] = useState(true);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [artistProfiles, setArtistProfiles] = useState<Record<string, ArtistProfileData>>({});
  const [organizerContracts, setOrganizerContracts] = useState<GeneratedContractData[]>([]);


  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      if (storedEvents) setEvents(JSON.parse(storedEvents));
      
      const storedArtistProfiles = localStorage.getItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES);
      if (storedArtistProfiles) setArtistProfiles(JSON.parse(storedArtistProfiles));

      const storedOrganizerContracts = localStorage.getItem(LOCAL_STORAGE_KEY_ORGANIZER_CONTRACTS);
      if (storedOrganizerContracts) setOrganizerContracts(JSON.parse(storedOrganizerContracts));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setUserRole(userData.role as UserType || UserType.NONE);
          // Load user-specific artist profile if user is an artist
          if (userData.role === UserType.ARTIST) {
             const profile = localStorage.getItem(`${LOCAL_STORAGE_KEY_ARTIST_PROFILES}_${user.uid}`);
             if (profile) {
                setArtistProfiles(prev => ({...prev, [user.uid]: JSON.parse(profile)}));
             }
          }
        } else {
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
      // Store all profiles under a general key
      localStorage.setItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES, JSON.stringify(updatedProfiles));
      // Additionally, if a specific user is logged in and is an artist, store their profile separately
      if (firebaseUser && userRole === UserType.ARTIST && updatedProfiles[firebaseUser.uid]) {
         localStorage.setItem(`${LOCAL_STORAGE_KEY_ARTIST_PROFILES}_${firebaseUser.uid}`, JSON.stringify(updatedProfiles[firebaseUser.uid]));
      }
    }
  };

  const getArtistProfile = (userId: string): ArtistProfileData => {
    return artistProfiles[userId] || { ...DEFAULT_ARTIST_PROFILE, name: firebaseUser?.displayName || "Artist Profile" };
  };

  const updateArtistProfile = (userId: string, profile: ArtistProfileData) => {
    persistArtistProfiles({ ...artistProfiles, [userId]: profile });
  };

  const persistOrganizerContracts = (updatedContracts: GeneratedContractData[]) => {
    setOrganizerContracts(updatedContracts);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_ORGANIZER_CONTRACTS, JSON.stringify(updatedContracts));
    }
  };

  const addOrganizerContract = (contractData: Omit<GeneratedContractData, 'id' | 'createdAt' | 'status' | 'signedByOrganizer' | 'signedByArtist'>) => {
    const newContract: GeneratedContractData = {
      ...contractData,
      id: `contract-${Date.now().toString()}-${Math.random().toString(36).substring(2,7)}`,
      createdAt: new Date().toISOString(),
      status: "draft",
      signedByOrganizer: false,
      signedByArtist: false,
    };
    persistOrganizerContracts([...organizerContracts, newContract]);
  };

  const organizerSignsContract = (contractId: string) => {
    const updatedContracts = organizerContracts.map(c => {
      if (c.id === contractId && c.status === 'draft') {
        return {
          ...c,
          status: 'pending_artist_signature' as GeneratedContractStatus,
          signedByOrganizer: true,
        };
      }
      return c;
    });
    persistOrganizerContracts(updatedContracts);
  };

  const artistSignsContract = (contractId: string) => {
    const updatedContracts = organizerContracts.map(c => {
      if (c.id === contractId && c.status === 'pending_artist_signature') {
        return {
          ...c,
          status: 'signed' as GeneratedContractStatus,
          signedByArtist: true,
        };
      }
      return c;
    });
    persistOrganizerContracts(updatedContracts);
  };


  return (
    <UserContext.Provider value={{ 
      firebaseUser, 
      userRole, 
      isLoading, 
      setUserRoleState,
      logout,
      events, addEvent, updateEvent, deleteEvent, 
      artistProfiles, getArtistProfile, updateArtistProfile,
      organizerContracts, addOrganizerContract, organizerSignsContract, artistSignsContract
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

    