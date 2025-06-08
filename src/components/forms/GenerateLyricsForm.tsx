
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateLyrics } from "@/ai/flows/generate-lyrics";
import { GenerateLyricsInputSchema, type GenerateLyricsInput, type GenerateLyricsOutput } from "@/ai/types";
import { useState } from "react";
import { Loader2, Wand2, Edit, Music2 } from "lucide-react"; // Added Music2 for output card
import { useToast } from "@/hooks/use-toast";

const popularGenres = [
  "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical", "Blues",
  "Country", "Folk", "Reggae", "R&B", "Soul", "Metal", "Punk",
  "Funk", "Disco", "Techno", "House", "Trance", "Ambient", "Lo-fi",
  "Synthwave", "Orchestral", "World", "Indie"
].sort();

const popularMoods = [
  "Happy", "Sad", "Energetic", "Relaxing", "Chill", "Epic", "Melancholic",
  "Romantic", "Mysterious", "Dark", "Uplifting", "Peaceful", "Intense",
  "Groovy", "Nostalgic", "Dreamy", "Experimental"
].sort();

const assistanceTypes = [
  { value: "complete_lyrics", label: "Complete Lyrics" },
  { value: "lyric_ideas", label: "Lyric Ideas & Snippets" },
  { value: "frame_suggestions", label: "Structural Frames & Rhyme Schemes" },
];

const formSchema = GenerateLyricsInputSchema;
type LyricsFormValues = z.infer<typeof formSchema>;

export function GenerateLyricsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [lyricsOutput, setLyricsOutput] = useState<GenerateLyricsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<LyricsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "",
      mood: "",
      theme: "",
      assistanceType: "complete_lyrics",
      keywords: "",
      desiredStructure: "",
    },
  });

  async function onSubmit(values: LyricsFormValues) {
    setIsLoading(true);
    setLyricsOutput(null);
    try {
      const submissionValues: GenerateLyricsInput = {
        ...values,
        keywords: values.keywords || undefined,
        desiredStructure: values.desiredStructure || undefined,
      };
      const result = await generateLyrics(submissionValues);
      setLyricsOutput(result);
      toast({
        title: "Lyrics Generated!",
        description: "AI has crafted some lyrical content for you.",
      });
    } catch (error) {
      console.error("Error generating lyrics:", error);
      toast({
        title: "Error Generating Lyrics",
        description: (error instanceof Error && error.message.includes("blocked")) 
          ? "Content generation was blocked by safety filters. Please revise your input."
          : "Failed to generate lyrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center">
          <Edit className="mr-2 h-6 w-6 text-primary" />
          AI Lyric Generator
        </CardTitle>
        <CardDescription>
          Craft compelling lyrics with AI assistance. Choose your genre, mood, theme, and let the AI inspire you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="genre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genre</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {popularGenres.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mood</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mood" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {popularMoods.map((mood) => (
                          <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Summer romance, overcoming adversity, city nightlife" {...field} />
                  </FormControl>
                  <FormDescription>What is the central idea or topic of your lyrics?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assistanceType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Assistance</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assistance type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assistanceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>How much help do you need from the AI?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Keywords/Phrases (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Starlight, heartbeat, endless road" {...field} />
                    </FormControl>
                    <FormDescription>Any specific words or phrases to include?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredStructure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Lyric Structure (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Verse-Chorus-Verse-Chorus-Bridge" {...field} />
                    </FormControl>
                    <FormDescription>Suggest a structure like AABA or Verse-Chorus.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Lyrics...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Lyrics
                </>
              )}
            </Button>
          </form>
        </Form>

        {lyricsOutput && (
          <Card className="mt-8 bg-secondary/30">
            <CardHeader>
              <CardTitle className="font-headline flex items-center">
                <Music2 className="mr-2 h-6 w-6 text-primary" />
                AI Generated Lyrical Content
              </CardTitle>
              <CardDescription>Type: {lyricsOutput.contentType}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-1">Generated Content:</h4>
                <pre className="p-4 bg-background/70 rounded-md text-sm whitespace-pre-wrap overflow-x-auto max-h-96">
                  {lyricsOutput.generatedContent}
                </pre>
              </div>
              {lyricsOutput.explanation && (
                <div>
                  <h4 className="font-semibold text-lg mb-1">Explanation/Suggestions:</h4>
                  <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                    {lyricsOutput.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
