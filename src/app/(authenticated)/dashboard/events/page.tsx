"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/PageHeader';
import { EventCard } from '@/components/cards/EventCard';
import { useUser } from '@/contexts/UserContext';
import { PlusCircle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default function EventsPage() {
  const { events } = useUser();

  return (
    <div>
      <PageHeader
        title="My Events"
        description="View, create, and manage your events."
        actions={
          <Link href="/dashboard/events/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Event
            </Button>
          </Link>
        }
      />
      {events.length === 0 ? (
         <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle className="font-headline">No Events Yet!</AlertTitle>
          <AlertDescription>
            You haven't created any events. Click the "Create New Event" button to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard key={event.id} event={event} showActions={true} />
          ))}
        </div>
      )}
    </div>
  );
}
