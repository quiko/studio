
'use server';

/**
 * @fileOverview AI-assisted music creation flow.
 *
 * - createMusic - A function that allows musicians to create original compositions with AI assistance.
 * - CreateMusicInput - The input type for the createMusic function.
 * - CreateMusicOutput - The return type for the createMusic function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateMusicInputSchema = z.object({
  genre: z.string().describe('The genre of the music.'),
  mood: z.string().describe('The mood of the music (e.g., happy, sad, energetic).'),
  instruments: z.string().describe('The instruments to be used in the composition.'),
  length: z.string().describe('The desired length of the song (e.g., short, medium, long).'),
  styleVariation: z.string().describe('Specific stylistic variations to add to the song.').optional(),
});
export type CreateMusicInput = z.infer<typeof CreateMusicInputSchema>;

const CreateMusicOutputSchema = z.object({
  musicComposition: z.string().describe('The AI-generated music composition in a textual format (e.g., sheet music, MIDI data, description).'),
  explanation: z.string().describe('An explanation of the composition, including the elements used and why.'),
});
export type CreateMusicOutput = z.infer<typeof CreateMusicOutputSchema>;

export async function createMusic(input: CreateMusicInput): Promise<CreateMusicOutput> {
  return createMusicFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createMusicPrompt',
  input: {schema: CreateMusicInputSchema},
  output: {schema: CreateMusicOutputSchema},
  prompt: `You are an AI music composer. Create an original music composition based on the following criteria:

Genre: {{{genre}}}
Mood: {{{mood}}}
Instruments: {{{instruments}}}
Length: {{{length}}}
{{#if styleVariation}}
Stylistic Variation: {{{styleVariation}}}
{{/if}}

Provide the music composition in a textual format that can be interpreted as sheet music, MIDI data, or a descriptive format. Also, explain the composition including elements and why.`,
});

const createMusicFlow = ai.defineFlow(
  {
    name: 'createMusicFlow',
    inputSchema: CreateMusicInputSchema,
    outputSchema: CreateMusicOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
