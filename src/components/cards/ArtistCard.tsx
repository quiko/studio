
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Link as LinkIcon, DollarSign, Star, UserCircle } from 'lucide-react';
import type { UserProfile } from '@/lib/constants'; // Assuming UserProfile contains all necessary fields

interface ArtistCardProps {
  artist: UserProfile & { id: string }; // Ensure artist has an id
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const profileImage = artist.photoURL || artist.artistProfileData?.profileImage || 'https://placehold.co/300x200.png';
  const artistName = artist.fullName || artist.email || "Artist";
  const artistGenre = artist.genre || "Not specified";
  const artistRate = artist.artistProfileData?.indicativeRates || "N/A";
  // For simplicity, reviews are hardcoded as in the original, a proper system would fetch these.
  const reviewsDisplay = "4.5 Stars (15 reviews)"; 

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48 bg-muted">
        <Image 
            src={profileImage} 
            alt={artistName} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={artist.artistProfileData?.dataAiHint || "musician profile"}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{artistName}</CardTitle>
        <CardDescription className="flex items-center">
          <Music className="mr-2 h-4 w-4 text-primary" /> {artistGenre}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="mr-2 h-4 w-4" />
          <span>Rates: {artistRate}</span>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="mr-2 h-4 w-4 text-yellow-400" /> 
          <span>{reviewsDisplay}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/artists/${artist.id}`} passHref legacyBehavior>
          <Button asChild variant="outline" className="w-full">
            <a>
              <LinkIcon className="mr-2 h-4 w-4" /> View Portfolio
            </a>
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
