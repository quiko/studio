
'use server';

/**
 * @fileOverview AI-powered lyric generation and writing assistant.
 *
 * - generateLyrics - A function that generates lyric content based on user inputs.
 * - GenerateLyricsInput - The input type for the generateLyrics function.
 * - GenerateLyricsOutput - The return type for the generateLyrics function.
 */

import {ai} from '@/ai/genkit';
import { GenerateLyricsInputSchema, GenerateLyricsInput, GenerateLyricsOutputSchema, GenerateLyricsOutput } from "@/ai/types";

export async function generateLyrics(input: GenerateLyricsInput): Promise<GenerateLyricsOutput> { // Keep export for server action
  return generateLyricsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLyricsPrompt',
  input: {schema: GenerateLyricsInputSchema},
  output: {schema: GenerateLyricsOutputSchema},
  prompt: `You are an expert AI lyricist and songwriting assistant. Your task is to generate lyrical content based on the user's specifications.

Genre: {{{genre}}}
Mood: {{{mood}}}
Theme: {{{theme}}}
Assistance Type: {{{assistanceType}}}

{{#if keywords}}
Keywords/Phrases to include: {{{keywords}}}
{{/if}}

{{#if desiredStructure}}
Desired Lyric Structure: {{{desiredStructure}}}
{{/if}}

Instructions based on Assistance Type:
- If 'assistanceType' is 'complete_lyrics': Generate a full set of lyrics (verses, choruses, bridge if appropriate based on structure or common patterns).
- If 'assistanceType' is 'lyric_ideas': Provide a list of brainstormed lyric ideas, catchy phrases, potential opening lines, or conceptual directions related to the theme.
- If 'assistanceType' is 'frame_suggestions': Outline a lyrical structure (e.g., Verse 1, Chorus, Verse 2) and provide suggestions for the content or rhyming scheme for each section rather than full lyrics.

For all types, ensure the 'generatedContent' field contains the main output.
The 'contentType' field should accurately reflect what was generated (e.g., "Complete Lyrics", "Lyric Ideas - List", "Lyrical Structure Frames").
Provide a brief 'explanation' if it adds value, such as why certain choices were made or how the user might expand on the ideas.
Format the output as a JSON object conforming to the GenerateLyricsOutputSchema.
`,
});

export const generateLyricsFlow = ai.defineFlow(
  {
    name: 'generateLyricsFlow',
    inputSchema: GenerateLyricsInputSchema,
    outputSchema: GenerateLyricsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
