
import { z } from 'zod';

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

export const CreateMusicInputSchema = z.object({
  genre: z.string().describe('The genre of the music.'),
  mood: z.string().describe('The mood of the music (e.g., happy, sad, energetic).'),
  instruments: z.string().describe('The instruments to be used in the composition.'),
  length: z.string().describe('The desired length of the song (e.g., short, medium, long).'),
  styleVariation: z.string().describe('Specific stylistic variations to add to the song.').optional(),
});
export type CreateMusicInput = z.infer<typeof CreateMusicInputSchema>;

export const CreateMusicOutputSchema = z.object({
  musicComposition: z.string().describe('The AI-generated music composition in a textual format (e.g., sheet music, MIDI data, description).'),
  explanation: z.string().describe('An explanation of the composition, including the elements used and why.'),
});
export type CreateMusicOutput = z.infer<typeof CreateMusicOutputSchema>;

export const SynthesizeVocalsInputSchema = z.object({
  lyrics: z.string().min(10, { message: "Lyrics must be at least 10 characters." }).describe("The lyrics to be 'sung' by the AI."),
  vocalStyle: z.string().min(1, { message: "Please select a vocal style." }).describe("The desired vocal style (e.g., Male Tenor, Female Alto, Robotic, Ethereal Whisper)."),
  emotionalTone: z.string().min(1, { message: "Please select an emotional tone." }).describe("The emotional tone of the vocal performance (e.g., Joyful, Melancholic, Powerful, Gentle)."),
  referenceAudioUrl: z.string().url().describe("URL of the uploaded reference audio file in Firebase Storage.").optional(),
  referenceAudioFileName: z.string().describe("Name of the uploaded reference audio file.").optional(),
});
export type SynthesizeVocalsInput = z.infer<typeof SynthesizeVocalsInputSchema>;

export const SynthesizeVocalsOutputSchema = z.object({
  synthesisDescription: z.string().describe("A textual description of the conceptual AI-synthesized vocal performance, detailing how the voice might sound and deliver the lyrics."),
  performanceNotes: z.string().describe("Additional notes on dynamics, articulation, or stylistic elements of the described vocal performance.").optional(),
});
export type SynthesizeVocalsOutput = z.infer<typeof SynthesizeVocalsOutputSchema>;
