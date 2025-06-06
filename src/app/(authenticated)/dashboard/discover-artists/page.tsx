"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserType, type UserProfile } from '@/lib/constants';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function DiscoverArtistsPage() {
  const { userRole, loading: userLoading } = useUser();
  const router = useRouter();

  const [allArtists, setAllArtists] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      if (userRole !== UserType.ORGANIZER) {
        router.push('/dashboard'); // Redirect if not an organizer
      } else {
        const fetchArtists = async () => {
          try {
            const artistsCollection = collection(db, 'users');
            const artistQuery = query(artistsCollection, where('role', '==', 'artist')); // Filter for lowercase 'artist'
            const artistSnapshot = await getDocs(artistQuery);

            const artistsData = artistSnapshot.docs.map(doc => ({
              id: doc.id,
              ...(doc.data() as UserProfile),
            }));


            setAllArtists(artistsData);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching artists:", error);
            setLoading(false);
          }
        };

        fetchArtists();
      }
    }

  }, [userRole, userLoading, router]); // Dependencies for useEffect

  const filteredArtists = allArtists.filter(artist =>
    (artist.fullName && artist.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (artist.genre && artist.genre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (userLoading) {
    return <p>Loading user data...</p>;
  }

  if (userRole !== UserType.ORGANIZER) {
    return null; // Or a message indicating redirect
  }

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

 {loading ? (
 <p className="text-center py-8">Loading artists...</p>
 ) : filteredArtists.length === 0 ? (
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