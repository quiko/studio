'use server';

/**
 * @fileOverview AI-powered artist suggestion tool for event organizers.
 *
 * - suggestArtists - A function that suggests artists based on event details.
 * - SuggestArtistsInput - The input type for the suggestArtists function.
 * - SuggestArtistsOutput - The return type for the suggestArtists function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestArtistsInputSchema = z.object({
  eventDetails: z
    .string()
    .describe('Details about the event, including type, date, location, and budget.'),
  musicGenrePreference: z
    .string()
    .describe('The preferred music genre for the event.'),
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

const prompt = ai.definePrompt({
  name: 'suggestArtistsPrompt',
  input: {schema: SuggestArtistsInputSchema},
  output: {schema: SuggestArtistsOutputSchema},
  prompt: `You are an AI assistant helping event organizers find suitable artists for their events.

  Based on the event details and music genre preference provided, suggest a list of artists that would be a good fit for the event.
  Also, provide a brief reasoning for each suggestion.

  Event Details: {{{eventDetails}}}
  Music Genre Preference: {{{musicGenrePreference}}}

  Ensure the output is a JSON object conforming to the SuggestArtistsOutputSchema.  The artistSuggestions field should be an array of strings.
  The reasoning field should clearly explain why each artist was suggested, based on the event details and genre preference.
`,
});

const suggestArtistsFlow = ai.defineFlow(
  {
    name: 'suggestArtistsFlow',
    inputSchema: SuggestArtistsInputSchema,
    outputSchema: SuggestArtistsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
