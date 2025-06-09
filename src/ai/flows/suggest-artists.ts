
'use server';

/**
 * @fileOverview AI-powered artist suggestion tool for event organizers.
 * @fileOverview AI-powered artist suggestion tool for event organizers.
 *
 * - suggestArtists - A function that suggests artists based on event details.
 * - SuggestArtistsInput - The input type for the suggestArtists function.
 * - SuggestArtistsOutput - The return type for the suggestArtists function.
 */

import {ai} from '@/ai/genkit';
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import {z} from 'genkit';

const SuggestArtistsInputSchema = z.object({
  eventType: z.string().describe('The type of event (e.g., Corporate Event, Wedding, Festival).'),
  budgetRange: z.string().describe('The estimated budget range for the artist (e.g., $500-$1000, Negotiable).'),
  musicGenrePreference: z.string().describe('The preferred music genre for the event.'),
  specificEventDate: z.date().describe('The specific date for the event.').optional(),
  eventTimeOfDay: z.string().describe('The desired time of day for the event (e.g., Evening, Afternoon, or a specific hourly range like "08:00 - 09:00", "23:00 - 00:00", or "Any Time").').optional(),
  numberOfGuests: z.string().describe('The estimated number of guests (e.g., 50-100, 250+).').optional(),
  additionalDetails: z
    .string()
    .describe('Any other relevant details about the event, such as exact location if not implied by general area, desired atmosphere not covered by other fields.').optional(),
});
export type SuggestArtistsInput = z.infer<typeof SuggestArtistsInputSchema>;

const SuggestArtistsOutputSchema = z.object({
  artistSuggestions: z
    .array(z.string())
    .describe('A list of artist suggestions based on the event details.'),
  reasoning: z.string().describe('The reasoning behind the artist suggestions.'),
});
export type SuggestArtistsOutput = z.infer<typeof SuggestArtistsOutputSchema>;

export async function suggestArtists(input: SuggestArtistsInput): Promise<SuggestArtistsOutput> {
  return suggestArtistsFlow(input);
}

import { db } from "@/lib/firebase"; // Assuming you have a firebase.ts file exporting your initialized db

interface Artist {
  // Define the structure of your artist data in Firestore
  uid: string;
  fullName: string;
  musicGenres?: string[]; // Assuming you have a field for music genres
  // Add other relevant artist fields here (e.g., availability, pricing)
}

async function getFilteredArtists(input: SuggestArtistsInput): Promise<Artist[]> {
  try {
    const artistsRef = collection(db, "users");
    let q = query(artistsRef, where("role", "==", "artist"));

    // Filter by music genre preference
    if (input.musicGenrePreference) {
      q = query(q, where("musicGenres", "array-contains", input.musicGenrePreference));
    }

    const querySnapshot = await getDocs(q);
    let filteredArtists: Artist[] = [];
    querySnapshot.forEach((doc) => {
      filteredArtists.push({ uid: doc.id, ...doc.data() as any });
    });

    // Client-side filtering for date, time, and budget
    if (input.specificEventDate && input.eventTimeOfDay) {
        filteredArtists = filteredArtists.filter(artist => {
            if (!artist.availability) return false;

            const eventDateTime = new Date(input.specificEventDate); // Assuming specificEventDate is a Date object

            let eventStartTime: Date | null = null;
            let eventEndTime: Date | null = null;

            if (input.eventTimeOfDay !== "Any Time") {
                const [startTimeStr, endTimeStr] = input.eventTimeOfDay.split(" - ");
                const [startHour, startMinute] = startTimeStr.split(":").map(Number);
                const [endHour, endMinute] = endTimeStr.split(":").map(Number);

                eventStartTime = new Date(eventDateTime);
                eventStartTime.setHours(startHour, startMinute, 0, 0);

                eventEndTime = new Date(eventDateTime);
                eventEndTime.setHours(endHour, endMinute, 0, 0);

                if (eventEndTime < eventStartTime) {
                    eventEndTime.setDate(eventEndTime.getDate() + 1);
                }
            }

            return artist.availability.some(slot => {
                const slotStartTime = slot.startDate.toDate(); // Convert Timestamp to Date
                const slotEndTime = slot.endDate.toDate(); // Convert Timestamp to Date

                if (input.eventTimeOfDay === "Any Time") {
                    return slotStartTime <= eventDateTime && slotEndTime >= eventDateTime;
                } else if (eventStartTime && eventEndTime) {
                    return (eventStartTime < slotEndTime && eventEndTime > slotStartTime);
                } else if (eventStartTime === null && eventEndTime === null && input.eventTimeOfDay === "Any Time") {
                    // Handle the case where the user selects "Any Time" for the event.
                    // In this case, we just need to check if the artist is available on the given date.
                    const eventDate = new Date(input.specificEventDate);
                    eventDate.setHours(0, 0, 0, 0);
                    const slotStartDate = new Date(slotStartTime);
                    slotStartDate.setHours(0, 0, 0, 0);
                    const slotEndDate = new Date(slotEndTime);
                    slotEndDate.setHours(0, 0, 0, 0);
                    return slotStartDate <= eventDate && slotEndDate >= eventDate;
                }
                return false;
            });
        });
    }

    if (input.budgetRange) {
        filteredArtists = filteredArtists.filter(artist => {
            if (!artist.priceRange) return false;

            const artistPriceRange = artist.priceRange;
            const eventBudgetRange = input.budgetRange;

            if (artistPriceRange === "Negotiable" || eventBudgetRange === "Negotiable") {
                return true;
            }

            // **TODO: Implement logic to check if artist priceRange is compatible with event budgetRange**
            // This might involve parsing the priceRange string and comparing ranges
        });
    }


    return filteredArtists;
  } catch (error) {
    console.error("Error fetching artists במאגר הנתונים:", error); // Corrected console log
    return [];
  }
}

const prompt = ai.definePrompt({
  name: 'suggestArtistsPrompt',
  input: {schema: SuggestArtistsInputSchema},
  output: {schema: SuggestArtistsOutputSchema},
  prompt: `You are an AI assistant helping event organizers find suitable artists for their events.

  Based on the event details provided, suggest a list of artists that would be a good fit.
  Also, provide a brief reasoning for each suggestion.

  Event Type: {{{eventType}}}
  Budget Range: {{{budgetRange}}}
  Music Genre Preference: {{{musicGenrePreference}}}

  {{#if specificEventDate}}
  Desired Event Date: {{{specificEventDate}}}
  {{/if}}

  {{#if eventTimeOfDay}}
  Desired Time of Day: {{{eventTimeOfDay}}}
  {{/if}}

  {{#if numberOfGuests}}
  Estimated Number of Guests: {{{numberOfGuests}}}
  {{/if}}

  {{#if additionalDetails}}
  Additional Event Details: {{{additionalDetails}}}
  {{/if}}

  Ensure the output is a JSON object conforming to the SuggestArtistsOutputSchema. The artistSuggestions field should be an array of strings.
  The reasoning field should clearly explain why each artist was suggested, based on all provided event details.
`,
});

const suggestArtistsFlow = ai.defineFlow(
  {
    name: 'suggestArtistsFlow',
    inputSchema: SuggestArtistsInputSchema,
    outputSchema: SuggestArtistsOutputSchema,
  },
  async input => {
    // Get filtered artists from the database
    const filteredArtists = await getFilteredArtists(input);

    // Prepare the prompt with the filtered artist list
    const artistList = filteredArtists.map(artist => `- ${artist.fullName}`).join('\n');
    const promptWithArtists = `You are an AI assistant helping event organizers find suitable artists for their events.

    Based on the event details provided and the following list of available artists, suggest a list of artists that would be a good fit.
    Also, provide a brief reasoning for each suggestion, explaining why they match the event criteria.

    Available Artists:
${artistList}

    Event Type: {{{eventType}}}
    Budget Range: {{{budgetRange}}}
    Music Genre Preference: {{{musicGenrePreference}}}

    {{#if specificEventDate}}
    Desired Event Date: {{{specificEventDate}}}
    {{/if}}

    {{#if eventTimeOfDay}}
    Desired Time of Day: {{{eventTimeOfDay}}}
    {{/if}}

    {{#if numberOfGuests}}
    Estimated Number of Guests: {{{numberOfGuests}}}
    {{/if}}

    {{#if additionalDetails}}
    Additional Event Details: {{{additionalDetails}}}
    {{/if}}

    Ensure the output is a JSON object conforming to the SuggestArtistsOutputSchema. The artistSuggestions field should be an array of strings containing the names of the suggested artists from the provided list.
    The reasoning field should clearly explain why each artist was suggested, based on all provided event details and their suitability from the available list.`; // Removed the unnecessary \n at the end of the line


    const { output } = await ai.generate({
      prompt: promptWithArtists,
      model: 'gemini-1.5-flash-latest', // Or the model you are using
      config: {
        temperature: 0.5, // Adjust temperature as needed
      },
      input: input // Pass the original input to the prompt
    });

    return output!;
  }
);
