
'use server';

/**
 * @fileOverview AI-powered conceptual vocal synthesis.
 *
 * - synthesizeVocals - A function that generates a textual description of a conceptual vocal performance.
 * - SynthesizeVocalsInput - The input type for the synthesizeVocals function.
 * - SynthesizeVocalsOutput - The return type for the synthesizeVocals function.
 */

import {ai} from '@/ai/genkit';
import { SynthesizeVocalsInputSchema, type SynthesizeVocalsInput, SynthesizeVocalsOutputSchema, type SynthesizeVocalsOutput } from "@/ai/types";

export async function synthesizeVocals(input: SynthesizeVocalsInput): Promise<SynthesizeVocalsOutput> {
  return synthesizeVocalsFlow(input);
}

const synthesizeVocalsPrompt = ai.definePrompt({
  name: 'synthesizeVocalsPrompt',
  input: {schema: SynthesizeVocalsInputSchema},
  output: {schema: SynthesizeVocalsOutputSchema},
  config: {
    temperature: 0, // For consistent textual output
  },
  prompt: `You are an AI assistant describing a conceptual vocal synthesis.
The user wants to generate vocals for the following lyrics:
Lyrics:
{{{lyrics}}}

Desired Vocal Style: {{{vocalStyle}}}
Desired Emotional Tone: {{{emotionalTone}}}

{{#if referenceAudioUrl}}
The user has provided a reference audio file named "{{referenceAudioFileName}}" (available at {{referenceAudioUrl}}) for conceptual inspiration. Describe how the AI might draw stylistic cues from this reference, such as timbre, delivery, or unique vocal characteristics, without claiming to perfectly replicate it. Focus on the *concept* of cloning.
{{else}}
No specific reference audio was provided for cloning.
{{/if}}

Based on all these inputs, provide a detailed textual description of the synthesized vocal performance.
This description should cover:
1. Overall vocal character (e.g., breathy, powerful, clear, raspy).
2. Melodic interpretation and delivery in relation to the lyrics and emotion.
3. Any notable stylistic elements or nuances.
4. If a reference audio was provided, explain how its conceptual essence might be incorporated.

The output should be a textual description, not actual audio.
Focus on being descriptive and evocative to help the user imagine the sound.
The 'synthesisDescription' should contain this main description.
The 'performanceNotes' can include additional brief suggestions or nuances.
`,
});

const synthesizeVocalsFlow = ai.defineFlow(
  {
    name: 'synthesizeVocalsFlow',
    inputSchema: SynthesizeVocalsInputSchema,
    outputSchema: SynthesizeVocalsOutputSchema,
  },
  async input => {
    const {output} = await synthesizeVocalsPrompt(input); // Corrected to use defined prompt
    return output!;
  }
);
