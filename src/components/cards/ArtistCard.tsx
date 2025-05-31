import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Music, Link as LinkIcon, DollarSign, Star } from 'lucide-react';

interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    genre: string;
    rate: string;
    portfolio: string;
    image: string;
    dataAiHint?: string;
  };
}

export function ArtistCard({ artist }: ArtistCardProps) {
  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative w-full h-48">
        <Image 
            src={artist.image} 
            alt={artist.name} 
            layout="fill" 
            objectFit="cover" 
            data-ai-hint={artist.dataAiHint || "musician performance"}
        />
      </div>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{artist.name}</CardTitle>
        <CardDescription className="flex items-center">
          <Music className="mr-2 h-4 w-4 text-primary" /> {artist.genre}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <div className="flex items-center text-sm text-muted-foreground">
          <DollarSign className="mr-2 h-4 w-4" />
          <span>Rates: {artist.rate}</span>
        </div>
        {/* Placeholder for reviews */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="mr-2 h-4 w-4 text-yellow-400" /> 
          <span>4.5 Stars (15 reviews)</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <a href={artist.portfolio} target="_blank" rel="noopener noreferrer">
            <LinkIcon className="mr-2 h-4 w-4" /> View Portfolio
          </a>
        </Button>
        {/* Messaging button can be added here later */}
      </CardFooter>
    </Card>
  );
}
