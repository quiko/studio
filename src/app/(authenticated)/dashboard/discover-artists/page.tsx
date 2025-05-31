"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { MOCK_ARTISTS, UserType } from '@/lib/constants'; // Using mock artists for now
import { useUser } from '@/contexts/UserContext';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search } from 'lucide-react';

export default function DiscoverArtistsPage() {
  const { artistProfiles } = useUser(); // This holds profiles artists create on the platform
  const [searchTerm, setSearchTerm] = useState('');

  // Combine mock artists with profiles created on the platform
  // For a real app, this would be a database query
  const platformArtists = Object.entries(artistProfiles)
    .filter(([userId, profile]) => userId !== UserType.ARTIST) // Filter out the generic "Your Artist Name"
    .map(([id, profile]) => ({
      id,
      name: profile.name,
      genre: profile.genre,
      rate: profile.indicativeRates,
      portfolio: profile.portfolioVideo || profile.portfolioAudio || '#',
      image: profile.profileImage || 'https://placehold.co/300x200.png',
      dataAiHint: `musician ${profile.genre}`
    }));
  
  const allArtists = [...MOCK_ARTISTS, ...platformArtists].filter(
    (artist, index, self) => index === self.findIndex((a) => a.name === artist.name) // Basic deduplication by name
  );

  const filteredArtists = allArtists.filter(artist => 
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Discover Artists"
        description="Browse profiles of talented artists available for your events."
      />
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input 
          type="search"
          placeholder="Search by name or genre..."
          className="pl-10 w-full md:w-1/2 lg:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredArtists.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No artists found matching your criteria. Try a different search.</p>
      ) : (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      )}
    </div>
  );
}
