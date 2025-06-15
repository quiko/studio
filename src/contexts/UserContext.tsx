
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { type User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore'; // Added Timestamp
import { auth, db } from '@/lib/firebase';
import { UserType, type EventItem, type ArtistProfileData, DEFAULT_ARTIST_PROFILE, type GeneratedContractData, type GeneratedContractStatus, type ArtistAvailabilitySlot } from '@/lib/constants';

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  userRole: UserType;
  loading: boolean;
  setUserType: (role: UserType) => void; // For direct role setting after signup/login
  logout: () => Promise<void>;
  addEvent: (event: Omit<EventItem, 'id'>) => void;
  events: EventItem[];
  updateEvent: (event: EventItem) => void;
  deleteEvent: (eventId: string) => void;
  artistProfiles: Record<string, ArtistProfileData>; // Keyed by Firebase UID
  getArtistProfile: (userId: string) => ArtistProfileData;
  updateArtistProfile: (userId: string, profile: ArtistProfileData) => void;
  organizerContracts: GeneratedContractData[];
  addOrganizerContract: (contractData: Omit<GeneratedContractData, 'id' | 'createdAt' | 'status' | 'signedByOrganizer' | 'signedByArtist'>) => void;
  artistSignsContract: (contractId: string) => void;
  organizerSignsContract: (contractId: string) => void;
  totalUnreadMessagesCount: number; // New field for unread messages
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_EVENTS = 'maestroai_events';
const LOCAL_STORAGE_KEY_ARTIST_PROFILES = 'maestroai_artist_profiles';
const LOCAL_STORAGE_KEY_ORGANIZER_CONTRACTS = 'maestroai_organizer_contracts';


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserType>(UserType.NONE);
  const [loading, setIsLoading] = useState(true);
  const [totalUnreadMessagesCount, setTotalUnreadMessagesCount] = useState(0);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [artistProfiles, setArtistProfiles] = useState<Record<string, ArtistProfileData>>({});
  const [organizerContracts, setOrganizerContracts] = useState<GeneratedContractData[]>([]);


  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY_EVENTS);
      if (storedEvents) setEvents(JSON.parse(storedEvents));
      
      const storedArtistProfilesRaw = localStorage.getItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES);
      if (storedArtistProfilesRaw) {
        const parsedProfiles: Record<string, any> = JSON.parse(storedArtistProfilesRaw);
        const profilesWithDates: Record<string, ArtistProfileData> = {};
        for (const uid in parsedProfiles) {
          const profile = parsedProfiles[uid];
          profilesWithDates[uid] = {
            ...profile,
            availability: profile.availability?.map((slot: any) => ({
              startDate: new Date(slot.startDate),
              endDate: new Date(slot.endDate),
            })) || [],
          };
        }
        setArtistProfiles(profilesWithDates);
      }

      const storedOrganizerContracts = localStorage.getItem(LOCAL_STORAGE_KEY_ORGANIZER_CONTRACTS);
      if (storedOrganizerContracts) setOrganizerContracts(JSON.parse(storedOrganizerContracts));

    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
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
             const profileRaw = localStorage.getItem(`${LOCAL_STORAGE_KEY_ARTIST_PROFILES}_${user.uid}`);
             if (profileRaw) {
                const profile = JSON.parse(profileRaw);
                const profileWithDates: ArtistProfileData = {
                  ...profile,
                  availability: profile.availability?.map((slot: any) => ({
                    startDate: new Date(slot.startDate),
                    endDate: new Date(slot.endDate),
                  })) || [],
                };
                setArtistProfiles(prev => ({...prev, [user.uid]: profileWithDates}));
             }
          }
        } else {
          setUserRole(UserType.NONE); 
        }
      } else {
        setFirebaseUser(null);
        setUserRole(UserType.NONE);
        setTotalUnreadMessagesCount(0); // Reset unread count on logout
      }
      setIsLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Listener for unread messages count
  useEffect(() => {
    if (!firebaseUser?.uid) {
      setTotalUnreadMessagesCount(0);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', firebaseUser.uid)
    );

    const unsubscribeConversations = onSnapshot(q, (snapshot) => {
      let unreadCount = 0;
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.unreadCount && data.unreadCount[firebaseUser.uid]) {
          unreadCount += data.unreadCount[firebaseUser.uid];
        }
      });
      setTotalUnreadMessagesCount(unreadCount);
    }, (error) => {
      console.error("Error fetching unread messages count:", error);
      setTotalUnreadMessagesCount(0); // Reset on error
    });

    return () => unsubscribeConversations();
  }, [firebaseUser?.uid]);


  const setUserType = (role: UserType) => {
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
      // Dates will be stringified to ISO format by JSON.stringify
      localStorage.setItem(LOCAL_STORAGE_KEY_ARTIST_PROFILES, JSON.stringify(updatedProfiles));
      // Additionally, if a specific user is logged in and is an artist, store their profile separately
      if (firebaseUser && userRole === UserType.ARTIST && updatedProfiles[firebaseUser.uid]) {
         localStorage.setItem(`${LOCAL_STORAGE_KEY_ARTIST_PROFILES}_${firebaseUser.uid}`, JSON.stringify(updatedProfiles[firebaseUser.uid]));
      }
    }
  };

  const getArtistProfile = (userId: string): ArtistProfileData => {
    const profileFromState = artistProfiles[userId];
    if (profileFromState) {
      // Ensure dates are Date objects if they were stringified
      return {
        ...profileFromState,
        availability: profileFromState.availability?.map(slot => ({
          startDate: slot.startDate instanceof Date ? slot.startDate : new Date(slot.startDate),
          endDate: slot.endDate instanceof Date ? slot.endDate : new Date(slot.endDate),
        })) || [],
      };
    }
    return { 
        ...DEFAULT_ARTIST_PROFILE, 
        name: firebaseUser?.displayName || "Artist Profile",
        availability: [], // Ensure default has empty availability array
    };
  };

  const updateArtistProfile = (userId: string, profile: ArtistProfileData) => {
    // Ensure incoming availability dates are Date objects
    const profileWithDates: ArtistProfileData = {
      ...profile,
      availability: profile.availability?.map(slot => ({
        startDate: slot.startDate instanceof Date ? slot.startDate : new Date(slot.startDate),
        endDate: slot.endDate instanceof Date ? slot.endDate : new Date(slot.endDate),
      })) || [],
    };
    persistArtistProfiles({ ...artistProfiles, [userId]: profileWithDates });
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
      loading,
      setUserType,
      logout,
      events, addEvent, updateEvent, deleteEvent, 
      artistProfiles, getArtistProfile, updateArtistProfile,
      organizerContracts, addOrganizerContract, organizerSignsContract, artistSignsContract,
      totalUnreadMessagesCount
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

    
