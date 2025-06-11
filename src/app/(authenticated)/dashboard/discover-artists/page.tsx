"use client";

import { PageHeader } from '@/components/ui/PageHeader';
import { ArtistCard } from '@/components/cards/ArtistCard';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserType, type UserProfile } from '@/lib/constants';
import { userProfileConverter } from '@/lib/firestoreConverter';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function DiscoverArtistsPage() {
  const { userRole, loading: userLoading } = useUser();
  const router = useRouter();

  const [allArtists, setAllArtists] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // AMÉLIORATION : Remplacement de onSnapshot par getDocs pour une meilleure performance et la correction de la fuite mémoire.
  useEffect(() => {
    // Attend la fin du chargement des informations de l'utilisateur
    if (userLoading) {
      return;
    }

    // 1. Vérification du rôle et redirection si nécessaire
    if (userRole !== UserType.ORGANIZER) {
      router.push('/dashboard');
      return;
    }

    // 2. Fonction asynchrone pour charger les données une seule fois
    const fetchArtists = async () => {
      try {
        const artistsQuery = query(
          collection(db, 'users'), 
          where('role', '==', 'artist')
        ).withConverter(userProfileConverter);

        const querySnapshot = await getDocs(artistsQuery);
        const artistsData = querySnapshot.docs.map(doc => ({
          ...doc.data(),
        }));
        
        setAllArtists(artistsData);
      } catch (error) {
        console.error("Error fetching artists:", error);
        // Optionnel: afficher une erreur dans l'UI
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, [userRole, userLoading, router]);

  // AMÉLIORATION : Filtrage cohérent avec la structure de données recommandée
  const filteredArtists = allArtists.filter(artist => {
    const term = searchTerm.toLowerCase();
    const nameMatch = artist.fullName?.toLowerCase().includes(term);
    // On cherche le genre dans l'objet imbriqué `artistProfileData`
    const genreMatch = artist.artistProfileData?.genre?.toLowerCase().includes(term);
    return nameMatch || genreMatch;
  });

  // SIMPLIFIÉ : Affichage unique pendant le chargement initial ou la redirection
  if (userLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading artists...</p>
      </div>
    );
  }
  
  // La redirection est gérée dans le useEffect, on peut aussi empêcher le rendu si le rôle n'est pas bon
  if (userRole !== UserType.ORGANIZER) {
    return null; // ou un message "Accès non autorisé"
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

      {filteredArtists.length === 0 ? (
        <p className="text-muted-foreground text-center py-8">No artists found matching your criteria.</p>
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