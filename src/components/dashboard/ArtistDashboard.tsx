
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { UserCircle, Music2, FileText, MessageSquare } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { UserType } from '@/lib/constants';
import Image from 'next/image';

export default function ArtistDashboard() {
  const { getArtistProfile, firebaseUser } = useUser();
  
  // Profile is now keyed by Firebase UID
  const profile = firebaseUser ? getArtistProfile(firebaseUser.uid) : { ...DEFAULT_ARTIST_PROFILE, name: "Your Artist Name" };

  return (
    <div className="grid gap-6">
       <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center gap-4">
          <Image src={profile.profileImage || "https://placehold.co/80x80.png"} alt={profile.name || "Artist"} width={80} height={80} className="rounded-full w-auto" data-ai-hint="musician portrait" priority />
          <div>
            <CardTitle className="font-headline text-2xl">{profile.name || "Your Artist Name"}</CardTitle>
            <CardDescription>{profile.genre || "Your Genre"}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
           <Link href="/dashboard/profile">
            <Button className="w-full" variant="outline">Edit My Profile</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}

