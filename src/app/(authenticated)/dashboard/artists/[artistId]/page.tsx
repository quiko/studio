"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/constants'; // Assurez-vous que ce type est bien défini
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mail, Loader2, Info, Music, DollarSign, Presentation, FileAudio, Video, Star, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

// NOUVEAU : Fonction pour générer un ID de conversation prévisible
const getConversationId = (uid1: string, uid2: string) => {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
};

export default function ArtistProfileDisplayPage() {
  const params = useParams();
  const artistId = params.artistId as string;
  const router = useRouter();
  const { firebaseUser: currentUser } = useUser();
  const { toast } = useToast();

  const [artist, setArtist] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMessaging, setIsMessaging] = useState(false);

  // AMÉLIORATION : Chargement des données simplifié et fiabilisé
  useEffect(() => {
    if (!artistId) return;

    const fetchArtist = async () => {
      setLoading(true);
      setError(null);
      try {
        const artistDocRef = doc(db, 'users', artistId);
        const artistDocSnap = await getDoc(artistDocRef);

        if (artistDocSnap.exists() && artistDocSnap.data().role === 'artist') {
          setArtist({ id: artistDocSnap.id, ...artistDocSnap.data() } as UserProfile);
        } else {
          setError('Artist not found or user is not an artist.');
        }
      } catch (err) {
        console.error("Error fetching artist:", err);
        setError('Failed to load artist profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  // AMÉLIORATION : Logique de messagerie ultra-efficace
  const handleMessageArtist = async () => {
    if (!currentUser || !artist) {
      toast({ title: "Login Required", description: "You must be logged in to message an artist.", variant: "destructive" });
      return;
    }
    if (currentUser.uid === artist.id) {
      toast({ title: "Info", description: "You cannot message yourself." });
      return;
    }

    setIsMessaging(true);
    const conversationId = getConversationId(currentUser.uid, artist.id);
    const conversationRef = doc(db, 'conversations', conversationId);

    try {
      const conversationSnap = await getDoc(conversationRef);

      if (!conversationSnap.exists()) {
        // La conversation n'existe pas, on la crée avec setDoc et l'ID prévisible
        const newConversationData = {
          participants: [currentUser.uid, artist.id],
          participantDetails: {
            [currentUser.uid]: { name: currentUser.displayName || currentUser.email, avatar: currentUser.photoURL || '' },
            [artist.id]: { name: artist.fullName || 'Artist', avatar: artist.artistProfileData?.profileImage || artist.photoURL || '' },
          },
          lastMessagePreview: "Conversation started.",
          lastMessageTimestamp: serverTimestamp(),
          unreadCount: {
            [currentUser.uid]: 0,
            [artist.id]: 1, // Marqué comme non lu pour l'artiste
          },
          createdAt: serverTimestamp(),
        };
        await setDoc(conversationRef, newConversationData);
        toast({ title: "Conversation Started!", description: `You can now message ${artist.fullName || 'the artist'}.` });
      }
      
      // Qu'elle existe ou qu'on vienne de la créer, on redirige
      router.push(`/dashboard/messages?conversationId=${conversationId}`);

    } catch (err) {
      console.error("Error initiating conversation:", err);
      toast({ title: "Messaging Error", description: "Could not start conversation. Please try again.", variant: "destructive" });
    } finally {
      setIsMessaging(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading Artist Profile..." />
        <div className="grid md:grid-cols-3 gap-6">
          {/* Squelette de la carte de profil */}
          <div className="md:col-span-1 space-y-4">
             <Skeleton className="h-64 w-full" />
             <Skeleton className="h-10 w-3/4 mx-auto" />
             <Skeleton className="h-10 w-full" />
          </div>
          {/* Squelette des détails */}
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Error" />
        <Alert variant="destructive">
          <Info className="h-4 w-4" />
          <AlertTitle>Profile Unavailable</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!artist) {
    // Ce cas est techniquement couvert par l'erreur, mais c'est une bonne sécurité
    return null;
  }
  
  // NETTOYAGE : Accès aux données cohérent
  const profileData = artist.artistProfileData;
  const profileImage = profileData?.profileImage || artist.photoURL || 'https://placehold.co/400x400.png';
  const artistName = artist.fullName || "Artist";
  const isOwnProfile = currentUser?.uid === artist.id;

  return (
    <div>
      <PageHeader title={artistName} description="Public Profile" />
      
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
              />
            </CardContent>
            <CardHeader className="text-center">
              <CardTitle className="font-headline text-2xl">{artistName}</CardTitle>
              <Badge variant="outline" className="w-fit mx-auto mt-1">{artist.role.charAt(0).toUpperCase() + artist.role.slice(1)}</Badge>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                className="w-full" 
                onClick={handleMessageArtist} 
                disabled={isMessaging || isOwnProfile}
              >
                {isMessaging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                {isOwnProfile ? "This is Your Profile" : "Message Artist"}
              </Button>
            </CardContent>
          </Card>

          {profileData?.genre && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><Music className="mr-2 h-5 w-5 text-primary"/>Genre</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profileData.genre}</p>
              </CardContent>
            </Card>
          )}

          {profileData?.priceRange && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><DollarSign className="mr-2 h-5 w-5 text-primary"/>Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{profileData.priceRange}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          {(profileData?.portfolioAudio || profileData?.portfolioVideo) && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline text-lg flex items-center"><Presentation className="mr-2 h-5 w-5 text-primary"/>Portfolio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileData.portfolioAudio && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={profileData.portfolioAudio} target="_blank" rel="noopener noreferrer">
                      <FileAudio className="mr-2 h-4 w-4" /> Listen to Audio
                    </a>
                  </Button>
                )}
                {profileData.portfolioVideo && (
                  <Button variant="outline" asChild className="w-full justify-start">
                    <a href={profileData.portfolioVideo} target="_blank" rel="noopener noreferrer">
                      <Video className="mr-2 h-4 w-4" /> Watch Video
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
          

          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-lg flex items-center"><Star className="mr-2 h-5 w-5 text-primary"/>About {artistName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {profileData?.bio || "No biography provided yet."}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}