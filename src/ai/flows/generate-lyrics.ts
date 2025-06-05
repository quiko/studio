
'use server';

/**
 * @fileOverview AI-powered lyric generation and writing assistant.
 *
 * - generateLyrics - A function that generates lyric content based on user inputs.
 * - GenerateLyricsInput - The input type for the generateLyrics function.
 * - GenerateLyricsOutput - The return type for the generateLyrics function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateLyricsInputSchema = z.object({
  genre: z.string().describe('The genre of the song for which lyrics are being generated (e.g., Pop, Rock, Hip Hop).'),
  mood: z.string().describe('The mood or emotional tone of the lyrics (e.g., joyful, reflective, angsty).'),
  theme: z.string().min(3, { message: "Theme must be at least 3 characters." }).describe('The central theme or topic of the lyrics (e.g., love, loss, adventure, social commentary).'),
  assistanceType: z.enum(["complete_lyrics", "lyric_ideas", "frame_suggestions"]).describe("Type of assistance requested: 'complete_lyrics' for full lyrics, 'lyric_ideas' for concepts and lines, or 'frame_suggestions' for structural outlines."),
  keywords: z.string().describe('Specific keywords or phrases to try and include in the lyrics.').optional(),
  desiredStructure: z.string().describe('An optional description of the desired lyric structure (e.g., "Verse-Chorus-Verse-Chorus-Bridge-Chorus", "AABA").').optional(),
});
export type GenerateLyricsInput = z.infer<typeof GenerateLyricsInputSchema>;

export const GenerateLyricsOutputSchema = z.object({
  generatedContent: z.string().describe('The AI-generated lyric content. This could be complete lyrics, a list of ideas, or structural frame suggestions based on the input assistance type.'),
  contentType: z.string().describe('Describes the type of content generated (e.g., "Complete Lyrics", "Lyric Ideas", "Verse Frame Suggestions").'),
  explanation: z.string().describe('An explanation of the generated content, including creative choices made or suggestions for how to use the content.').optional(),
});
export type GenerateLyricsOutput = z.infer<typeof GenerateLyricsOutputSchema>;

export async function generateLyrics(input: GenerateLyricsInput): Promise<GenerateLyricsOutput> {
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

const generateLyricsFlow = ai.defineFlow(
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
