
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
  eventType: z.string().describe('The type of event (e.g., Corporate Event, Wedding, Festival).'),
  budgetRange: z.string().describe('The estimated budget range for the artist (e.g., $500-$1000, Negotiable).'),
  musicGenrePreference: z
    .string()
    .describe('The preferred music genre for the event.'),
  eventTimeframe: z.string().describe('The desired timeframe for the event (e.g., Next Month, Specific Weekend).').optional(),
  eventTimeOfDay: z.string().describe('The desired time of day for the event (e.g., Evening, Afternoon).').optional(),
  numberOfGuests: z.string().describe('The estimated number of guests (e.g., 50-100, 250+).').optional(),
  additionalDetails: z
    .string()
    .describe('Any other relevant details about the event, such as specific date if not covered by timeframe, exact location, desired atmosphere.').optional(),
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

  Based on the event details provided, suggest a list of artists that would be a good fit.
  Also, provide a brief reasoning for each suggestion.

  Event Type: {{{eventType}}}
  Budget Range: {{{budgetRange}}}
  Music Genre Preference: {{{musicGenrePreference}}}
  {{#if eventTimeframe}}
  Desired Event Timeframe: {{{eventTimeframe}}}
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
    const {output} = await prompt(input);
    return output!;
  }
);
