
"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile, ArtistProfileData } from '@/lib/constants';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Briefcase, CalendarDays, DollarSign, FileAudio, GitBranch, Github, Globe, Info, Link as LinkIcon, Mail, MapPin, MicVocal, Music, Palette, Presentation, Star, UserCircle, Video, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

export default function ArtistProfileDisplayPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (artistId) {
      const fetchArtist = async () => {
        setLoading(true);
        setError(null);
        try {
          const artistDocRef = doc(db, 'users', artistId);
          const artistDocSnap = await getDoc(artistDocRef);

          if (artistDocSnap.exists()) {
            setArtist({ id: artistDocSnap.id, ...artistDocSnap.data() } as UserProfile);
          } else {
            setError('Artist not found.');
          }
        } catch (err) {
          console.error("Error fetching artist:", err);
          setError('Failed to load artist profile.');
        } finally {
          setLoading(false);
        }
      };
      fetchArtist();
    }
  }, [artistId]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading Artist Profile..." />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-64 md:col-span-1" />
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Error" description="Could not load artist profile." />
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Profile Unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!artist) {
    return (
       <div>
        <PageHeader title="Artist Not Found" />
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No Profile Data</AlertTitle>
          <AlertDescription>The requested artist profile could not be found.</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  const profileImage = artist.photoURL || artist.artistProfileData?.profileImage || 'https://placehold.co/400x400.png';
  const artistName = artist.fullName || artist.email || "Artist";
  const artistGenre = artist.genre || "Not specified";
  const artistRates = artist.artistProfileData?.indicativeRates || "N/A";
  const artistReviews = artist.artistProfileData?.reviews || "No reviews yet.";
  const portfolioAudio = artist.artistProfileData?.portfolioAudio;
  const portfolioVideo = artist.artistProfileData?.portfolioVideo;

  return (
    <div>
      <PageHeader title={artistName} description={`Public Profile`} />
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Image 
                src={profileImage} 
                alt={artistName} 
                width={400} 
                height={400} 
                className="object-cover w-full h-auto rounded-t-lg"
                data-ai-hint={artist.artistProfileData?.dataAiHint || "musician full profile"}
              />
            </CardContent>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{artistName}</CardTitle>
                 <Badge variant="outline" className="w-fit mx-auto mt-1">{artist.role ? artist.role.charAt(0).toUpperCase() + artist.role.slice(1) : 'User'}</Badge>
            </CardHeader>
            <CardContent className="text-center">
                 <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" /> Message Artist
                 </Button>
                 {/* Future: Add booking request button */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Music className="mr-2 h-5 w-5 text-primary"/>Genre</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{artistGenre}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Indicative Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{artistRates}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          {(portfolioAudio || portfolioVideo) && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><Presentation className="mr-2 h-5 w-5 text-primary"/>Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {portfolioAudio && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={portfolioAudio} target="_blank" rel="noopener noreferrer">
                      <FileAudio className="mr-2 h-4 w-4" /> Listen to Audio
                    </a>
                  </Button>
                )}
                {portfolioVideo && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={portfolioVideo} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" /> Watch Video
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-primary"/>Reviews & Testimonials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{artistReviews}</p>
              {/* Future: Implement a proper reviews list */}
            </CardContent>
          </Card>
          
          {/* Placeholder for more detailed Bio / About section if available */}
           <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary"/>About {artistName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed bio information coming soon. For now, {artistName} is known for their work in the {artistGenre} scene.
                Contact them directly for more information about their experience and performance style.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
