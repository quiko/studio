"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, query, where, serverTimestamp, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Assuming you have firebase initialized and exported db
import { useUser } from '@/contexts/UserContext';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { PageHeader } from '@/components/ui/PageHeader';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { CalendarDays, MapPin, DollarSign, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Event {
  id: string;
  title: string;
  date: string; // Assuming ISO string or similar format
  location: string;
  budget?: string; // Optional budget field
  description?: string; // Optional description field
}

interface Application {
  userId: string;
  appliedAt: any; // Firestore Timestamp
}

export default function EventsForArtistsPage() {
  const { firebaseUser, userRole, loading } = useUser();
  const [events, setEvents] = useState<Event[]>([]);
  const [appliedEvents, setAppliedEvents] = useState<Set<string>>(new Set());
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const artistId = firebaseUser?.uid;
  const isArtist = userRole === 'artist';

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoadingEvents(true);
      try {
        const eventsCollection = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        const eventsList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Omit<Event, 'id'>
        }));
        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching events:', error);
        // Optionally show a toast or alert
      } finally {
        setLoadingEvents(false);
      }
    };

    if (!loading && isArtist) {
      fetchEvents();
    }
  }, [loading, isArtist]);

  // Fetch artist's applications
  useEffect(() => {
    const fetchApplications = async () => {
      if (!artistId) return;

      setLoadingApplications(true);
      try {
        // This approach requires querying each event's subcollection, which can be inefficient
        // A better approach for scale would be a top-level 'applications' collection
        // with fields like eventId, artistId, etc., and query that collection by artistId.
        // For this example, we'll stick to the requested subcollection approach.

        const eventsCollection = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsCollection);
        const appliedEventIds = new Set<string>();

        for (const eventDoc of eventSnapshot.docs) {
          const applicationsCollection = collection(db, `events/${eventDoc.id}/applications`);
          const q = query(applicationsCollection, where('userId', '==', artistId));
          const applicationSnapshot = await getDocs(q);
          if (!applicationSnapshot.empty) {
            appliedEventIds.add(eventDoc.id);
          }
        }
        setAppliedEvents(appliedEventIds);

      } catch (error) {
        console.error('Error fetching applications:', error);
        // Optionally show a toast or alert
      } finally {
        setLoadingApplications(false);
      }
    };

    if (!loading && isArtist && artistId) {
      fetchApplications();
    }
  }, [loading, isArtist, artistId]);


  const handleApply = async (eventId: string) => {
    if (!artistId || !isArtist) {
      console.error("User is not an artist or not logged in.");
      // Optionally show an error toast
      return;
    }

    // Double-check if already applied (client-side check for better UX)
    if (appliedEvents.has(eventId)) {
      console.warn(`Artist ${artistId} already applied for event ${eventId}.`);
      // Optionally show an informative toast
      return;
    }

    try {
      const applicationsCollection = collection(db, `events/${eventId}/applications`);
      await addDoc(applicationsCollection, {
        userId: artistId,
        appliedAt: serverTimestamp(), // Use server timestamp for consistency
      });
      console.log(`Application submitted for event ${eventId} by artist ${artistId}`);
      // Update applied events state to disable the button immediately
      setAppliedEvents(prev => new Set(prev).add(eventId));
      // Optionally show a success toast
    } catch (error) {
      console.error('Error submitting application:', error);
      // Optionally show an error toast
    }
  };

  if (loading || !isArtist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {loading ? <Skeleton className="h-12 w-12 rounded-full" /> : <p>Access Denied</p>}
      </div>
    );
  }

  if (loadingEvents || loadingApplications) {
     return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          title="Explore Events"
          description="Find events posted by organizers and apply to perform."
        />
         <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           <Skeleton className="h-[200px] w-full" />
           <Skeleton className="h-[200px] w-full" />
           <Skeleton className="h-[200px] w-full" />
         </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Explore Events"
        description="Find events posted by organizers and apply to perform."
      />

      {events.length === 0 ? (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Events Found</AlertTitle>
          <AlertDescription>
            There are currently no events posted by organizers. Check back later!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <Card key={event.id}>
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                {event.budget && <p className="text-sm text-muted-foreground flex items-center"><DollarSign className="mr-1 h-4 w-4"/> {event.budget}</p>}
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                 <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4"/> {format(new Date(event.date), "PPP")}</p>
                 <p className="flex items-center"><MapPin className="mr-2 h-4 w-4"/> {event.location}</p>
                {event.description && <p>{event.description}</p>}
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleApply(event.id)}
                  disabled={appliedEvents.has(event.id)}
                  className="w-full"
                >
                  {appliedEvents.has(event.id) ? 'Applied' : 'Apply'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}