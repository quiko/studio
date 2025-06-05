
'use server';

/**
 * @fileOverview AI-assisted music creation flow.
 *
 * - createMusic - A function that allows musicians to create original compositions with AI assistance.
 * - CreateMusicInput - The input type for the createMusic function.
 * - CreateMusicOutput - The return type for the createMusic function.
 */

import {ai} from '@/ai/genkit';import { CreateMusicInputSchema, CreateMusicInput, CreateMusicOutputSchema, CreateMusicOutput } from "@/ai/types";

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
