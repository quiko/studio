
'use server';
/**
 * @fileOverview A conceptual AI vocal synthesis tool.
 *
 * - synthesizeVocals - A function that generates a textual description of a synthesized vocal performance.
 * - SynthesizeVocalsInput - The input type for the synthesizeVocals function.
 * - SynthesizeVocalsOutput - The return type for the synthesizeVocals function.
 */

import {ai} from '@/ai/genkit';
import { SynthesizeVocalsInputSchema, type SynthesizeVocalsInput, SynthesizeVocalsOutputSchema, type SynthesizeVocalsOutput } from "@/ai/types";

export async function synthesizeVocals(input: SynthesizeVocalsInput): Promise<SynthesizeVocalsOutput> {
  return synthesizeVocalsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'synthesizeVocalsPrompt',
  input: {schema: SynthesizeVocalsInputSchema},
  output: {schema: SynthesizeVocalsOutputSchema},
  prompt: `You are an AI assistant specializing in conceptual vocal synthesis. Your task is to generate a detailed textual description of what an AI-synthesized vocal performance would sound like based on the user's specifications.
This is for conceptual and descriptive purposes ONLY; you will not generate actual audio.

User Input:
Lyrics to be sung:
{{{lyrics}}}

Desired Vocal Style: {{{vocalStyle}}}
Desired Emotional Tone: {{{emotionalTone}}}

{{#if referenceAudioUrl}}
A reference audio file named '{{{referenceAudioFileName}}}' was provided by the user (conceptually, its content is at {{{referenceAudioUrl}}}). Describe how the synthesized voice might conceptually draw inspiration from characteristics that could be perceived in such an audio reference (e.g., potential pitch, timbre, delivery style nuances if it were analyzed by a human). Focus on abstract qualities. Do not claim to have processed the audio, but rather discuss how one might interpret such a reference for vocal synthesis.
{{else}}
No specific audio file was provided for voice cloning reference.
{{/if}}

Instructions:
1.  For 'synthesisDescription': Provide a rich, descriptive paragraph. Detail the timbre, pitch range, articulation, and any notable characteristics of the described voice. Explain how this voice would deliver the provided lyrics, considering the emotional tone and style. If a reference audio was mentioned, describe how the voice might subtly incorporate conceptual elements inspired by it.
2.  For 'performanceNotes' (optional): Add any further notes on potential dynamics, phrasing, harmonies (if implied by lyrics/mood), or other performance nuances that would characterize this conceptual vocal track.

Ensure your output is a JSON object conforming to the SynthesizeVocalsOutputSchema.
Example of 'synthesisDescription': "The synthesized vocal is a warm, baritone male voice with a slight gravelly texture, reminiscent of a classic soul singer. It delivers the opening lines with a gentle, breathy quality, building in intensity for the chorus to convey a powerful sense of longing as per the 'Melancholic' emotional tone. The phrasing is smooth and connected, with subtle vibrato on sustained notes. If a reference audio (e.g., of a classic soul singer) was provided, one might imagine this synthesized voice capturing the essence of that era's vocal expressiveness by emphasizing similar breath control or melodic embellishments, while still maintaining its unique synthesized character."
`,
  config: {
    temperature: 0, // Set temperature to 0 for more deterministic output
  }
});

const synthesizeVocalsFlow = ai.defineFlow(
  {
    name: 'synthesizeVocalsFlow',
    inputSchema: SynthesizeVocalsInputSchema,
    outputSchema: SynthesizeVocalsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

