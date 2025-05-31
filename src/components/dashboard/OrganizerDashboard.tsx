"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CalendarDays, Users, Search, FileText, MessageSquare, PlusCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { EventCard } from '@/components/cards/EventCard';

export default function OrganizerDashboard() {
  const { events } = useUser();
  const recentEvents = events.slice(0, 2);

  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <CalendarDays className="h-6 w-6 text-primary" />
              My Events
            </CardTitle>
            <CardDescription>Manage your upcoming and past events.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/events">
              <Button className="w-full" variant="outline">View All Events</Button>
            </Link>
            <Link href="/dashboard/events/new" className="mt-2 block">
              <Button className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Users className="h-6 w-6 text-primary" />
              AI Artist Suggestions
            </CardTitle>
            <CardDescription>Get AI-powered artist recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/suggest-artists">
              <Button className="w-full">Find Artists</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Search className="h-6 w-6 text-primary" />
              Discover Artists
            </CardTitle>
            <CardDescription>Browse and connect with talented artists.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/discover-artists">
              <Button className="w-full" variant="outline">Explore Profiles</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      {recentEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-headline mb-4">Recent Events</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {recentEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <MessageSquare className="h-6 w-6 text-primary" />
              Messages
            </CardTitle>
            <CardDescription>Communicate with artists.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/messages">
              <Button className="w-full" variant="outline">Open Messages</Button>
            </Link>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <FileText className="h-6 w-6 text-primary" />
              Contracts
            </CardTitle>
            <CardDescription>Generate and manage contracts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/contracts">
              <Button className="w-full" variant="outline">Manage Contracts</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
