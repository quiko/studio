
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Link as LinkIcon, DollarSign, Star } from 'lucide-react'; // Removed UserCircle as it wasn't used in the card display logic previously
import type { UserProfile } from '@/lib/constants';

interface ArtistCardProps {
  artist: UserProfile & { id: string };
}

export function ArtistCard({ artist }: ArtistCardProps) {
  const profileImage = artist.artistProfileData?.profileImage || artist.photoURL || 'https://placehold.co/300x200.png';
  const artistName = artist.fullName || artist.email || "Artist";
  const artistGenre = artist.artistProfileData?.genre || artist.genre || "Not specified"; // Prioritize artistProfileData.genre
  const artistRate = artist.artistProfileData?.indicativeRates || "N/A";
  const reviewsDisplay = artist.artistProfileData?.reviews || "No reviews yet"; // Using actual reviews if available

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
          <span className="line-clamp-1">{reviewsDisplay.startsWith("No reviews") ? reviewsDisplay : "View Reviews on Profile"}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={`/dashboard/artists/${artist.id}`}>
            <LinkIcon className="mr-2 h-4 w-4" /> View Portfolio
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
