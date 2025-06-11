'use server';

import { ai } from '@/ai/genkit';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { z } from 'genkit';
import { db } from "@/lib/firebase";

const SuggestArtistsInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., Corporate Event, Wedding, Festival).'),
  budgetRange: z.string().describe('The estimated budget range for the artist (e.g., "$500 - $1000", "€3000", "Negotiable").'),
  musicGenrePreference: z.string().describe('The preferred music genre for the event.'),
  specificEventDate: z.date().describe('The specific date for the event.').optional(),
  eventStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format").optional(),
  eventEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be in HH:mm format").optional(),
  numberOfGuests: z.string().optional(),
  additionalDetails: z.string().optional(),
});
export type SuggestArtistsInput = z.infer<typeof SuggestArtistsInputSchema>;

const SuggestArtistsOutputSchema = z.object({
  artistSuggestions: z.array(z.string()),
  reasoning: z.string(),
});
export type SuggestArtistsOutput = z.infer<typeof SuggestArtistsOutputSchema>;

interface Artist {
  uid: string;
  fullName: string;
  musicGenres?: string[];
  availability?: { startDate: Timestamp; endDate: Timestamp }[];
  priceRange?: string;
  role: 'artist';
}

function parseRange(rangeStr: string): [number, number] | null {
  if (!rangeStr || rangeStr.toLowerCase() === 'negotiable') return null;
  const numbers = rangeStr.match(/\d+/g)?.map(Number);
  if (!numbers || numbers.length === 0) return null;
  if (numbers.length === 1) return [numbers[0], numbers[0]];
  return [Math.min(...numbers), Math.max(...numbers)];
}

async function getFilteredArtists(input: SuggestArtistsInput): Promise<Artist[]> {
  try {
    const artistsRef = collection(db, "users");
    let q = query(artistsRef, where("role", "==", "artist"));

    if (input.musicGenrePreference) {
      q = query(q, where("musicGenres", "array-contains", input.musicGenrePreference));
    }

    const querySnapshot = await getDocs(q);
    let artists: Artist[] = [];
    querySnapshot.forEach((doc) => {
      artists.push({ uid: doc.id, ...doc.data() } as Artist);
    });

    const filteredArtists = artists.filter(artist => {
      if (input.specificEventDate) {
        if (!artist.availability || artist.availability.length === 0) return false;

        const eventDate = new Date(input.specificEventDate);

        let isAvailableOnDate = false;
        if (input.eventStartTime && input.eventEndTime) {
          const eventStartDateTime = new Date(eventDate);
          const [startHour, startMinute] = input.eventStartTime.split(':').map(Number);
          eventStartDateTime.setHours(startHour, startMinute, 0, 0);

          const eventEndDateTime = new Date(eventDate);
          const [endHour, endMinute] = input.eventEndTime.split(':').map(Number);
          eventEndDateTime.setHours(endHour, endMinute, 0, 0);

          if (eventEndDateTime <= eventStartDateTime) {
            eventEndDateTime.setDate(eventEndDateTime.getDate() + 1);
          }

          isAvailableOnDate = artist.availability.some(slot => {
            const slotStart = slot.startDate.toDate();
            const slotEnd = slot.endDate.toDate();
            return eventStartDateTime < slotEnd && eventEndDateTime > slotStart;
          });
        } else {
          eventDate.setHours(0, 0, 0, 0);
          isAvailableOnDate = artist.availability.some(slot => {
            const slotStart = slot.startDate.toDate();
            const slotEnd = slot.endDate.toDate();
            return eventDate >= new Date(slotStart.setHours(0,0,0,0)) && eventDate <= new Date(slotEnd.setHours(23,59,59,999));
          });
        }

        if (!isAvailableOnDate) return false;
      }

      if (input.budgetRange) {
        if (!artist.priceRange) return false;

        if (input.budgetRange.toLowerCase() === 'negotiable' || artist.priceRange?.toLowerCase() === 'negotiable') {
          return true;
        }

        const eventBudget = parseRange(input.budgetRange);
        const artistPrice = parseRange(artist.priceRange);
        if (!eventBudget || !artistPrice) return false;

        const [eventMin, eventMax] = eventBudget;
        const [artistMin, artistMax] = artistPrice;

        const budgetsOverlap = eventMin <= artistMax && artistMin <= eventMax;
        if (!budgetsOverlap) return false;
      }

      return true;
    });

    return filteredArtists;
  } catch (error) {
    console.error("Error fetching or filtering artists:", error);
    return [];
  }
}

export async function suggestArtists(input: SuggestArtistsInput): Promise<SuggestArtistsOutput> {
  return suggestArtistsFlow(input);
}

const suggestArtistsFlow = ai.defineFlow(
  {
    name: 'suggestArtistsFlow',
    inputSchema: SuggestArtistsInputSchema,
    outputSchema: SuggestArtistsOutputSchema,
  },
  async input => {
    const filteredArtists = await getFilteredArtists(input);

    if (filteredArtists.length === 0) {
      return {
        artistSuggestions: [],
        reasoning: "No artists were found matching the specified criteria (genre, date, or budget). Please try broadening your search criteria."
      };
    }

    const artistDetailsForPrompt = filteredArtists.map(artist => 
      `- Nom: ${artist.fullName}, Genres: ${artist.musicGenres?.join(', ') || 'Non spécifié'}, Tarif: ${artist.priceRange || 'Non spécifié'}`
    ).join('\n');

    const prompt = `You are an expert AI assistant helping event organizers find the perfect artist.
Based on the event details provided and the following list of available and budget-compatible artists, suggest the top 1-3 artists that are the best fit.
Provide a clear and concise reasoning for your suggestions, explaining why each artist matches the event criteria.

Available Artists with their details:
${artistDetailsForPrompt}

Event Details:
- Event Type: ${input.eventType}
- Budget Range: ${input.budgetRange}
- Music Genre Preference: ${input.musicGenrePreference}
${input.specificEventDate ? `- Event Date: ${input.specificEventDate.toDateString()}` : ''}
${input.eventEndTime ? `- Performance End Time: ${input.eventEndTime}` : ''}
${input.numberOfGuests ? `- Number of Guests: ${input.numberOfGuests}` : ''}
${input.additionalDetails ? `- Additional Details: ${input.additionalDetails}` : ''}
${(input.eventStartTime && input.eventEndTime && input.eventEndTime < input.eventStartTime) ? '- Note: Event spans over midnight' : ''}

Your final output must be a JSON object conforming to the output schema. The 'artistSuggestions' field must contain an array of the full names of the artists you recommend from the provided list.`;

    const { output } = await ai.generate({
      model: 'gemini-1.5-flash-latest',
      prompt: prompt,
      output: {
        schema: SuggestArtistsOutputSchema,
      },
      config: {
        temperature: 0.3,
      },
    });

    return output!;
  }
);