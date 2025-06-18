
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Music2, FileText, MessageSquare, CalendarCheck } from 'lucide-react'; // Added CalendarCheck
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArtistDashboard() {
  const { loading, firebaseUser, getArtistProfile } = useUser();
  const artistProfile = firebaseUser ? getArtistProfile(firebaseUser.uid) : undefined;

  // Simulation d’une erreur si le profil est absent après chargement
  const error = !loading && firebaseUser && !artistProfile;

  if (loading) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        An error occurred while loading your artist profile. Please try again later.
      </div>
    );
  }

  const profileName = artistProfile?.name || firebaseUser?.displayName || "Your Artist Name";
  const profileGenre = artistProfile?.genre || "Your Genre";
  const profileImage = artistProfile?.profileImage || firebaseUser?.photoURL || "https://placehold.co/80x80.png";

  return (
    <div className="grid gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Image 
            src={profileImage} 
            alt={profileName} 
            width={80} 
            height={80} 
            className="rounded-full object-cover"
            priority 
            data-ai-hint={artistProfile?.dataAiHint || "musician portrait"}
          />
          <div>
            <CardTitle className="font-headline text-2xl">{profileName}</CardTitle>
            <CardDescription>{profileGenre}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/profile">
            <Button className="w-full" variant="outline">Edit My Profile</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <Music2 className="h-6 w-6 text-primary" />
              AI Music Studio
            </CardTitle>
            <CardDescription>Create and experiment with AI-generated music.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/create-music">
              <Button className="w-full">Open Studio</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <MessageSquare className="h-6 w-6 text-primary" />
              Messages
            </CardTitle>
            <CardDescription>Communicate with event organizers.</CardDescription>
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
            <CardDescription>View and manage your contracts.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/contracts">
              <Button className="w-full" variant="outline">View Contracts</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <CalendarCheck className="h-6 w-6 text-primary" />
              Manage Availability
            </CardTitle>
            <CardDescription>Set your available dates for bookings.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/profile#manage-availability">
              <Button className="w-full" variant="outline">Set Availability</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

