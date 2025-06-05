
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
import { type GenerateLyricsOutput, GenerateLyricsInputSchema } from "@/ai/types";
import { useState } from "react";
import { Loader2, Wand2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Re-using lists from CreateMusicForm, could be centralized later
const genreList = [
  "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical", "Blues",
  "Country", "Folk", "Reggae", "R&B", "Soul", "Metal", "Punk",
  "Funk", "Disco", "Techno", "House", "Trance", "Ambient", "Lo-fi",
  "Synthwave", "Orchestral", "World", "Indie"
].sort();

const moodList = [
  "Happy", "Sad", "Energetic", "Relaxing", "Chill", "Epic", "Melancholic",
  "Romantic", "Mysterious", "Dark", "Uplifting", "Peaceful", "Intense",
  "Groovy", "Nostalgic", "Dreamy", "Experimental"
].sort();

const assistanceTypes = [
  { id: "complete_lyrics", label: "Complete Lyrics" },
  { id: "lyric_ideas", label: "Lyric Ideas & Concepts" },
  { id: "frame_suggestions", label: "Structural Frame Suggestions" },
];

type GenerateLyricsFormValues = z.infer<typeof GenerateLyricsInputSchema>;

export default function GenerateLyricsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [lyricOutput, setLyricOutput] = useState<GenerateLyricsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<GenerateLyricsFormValues>({
    resolver: zodResolver(GenerateLyricsInputSchema),
    defaultValues: {
      genre: "",
      mood: "",
      theme: "",
      assistanceType: "lyric_ideas",
      keywords: "",
      desiredStructure: "",
    },
  });

  async function onSubmit(values: GenerateLyricsFormValues) {
    setIsLoading(true);
    setLyricOutput(null);
    try {
      const result = await generateLyrics(values);
      setLyricOutput(result);
      toast({
        title: "Lyrics Generated!",
        description: `AI has provided ${result.contentType.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Error generating lyrics:", error);
      toast({
        title: "Error",
        description: "Failed to generate lyrics. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="mt-0">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Edit className="mr-2 h-6 w-6 text-primary" />
          Lyric Generation Assistant
        </CardTitle>
        <CardDescription>Craft lyrics with AI. Choose your genre, mood, theme, and the type of assistance you need.</CardDescription>
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
                          <SelectValue placeholder="Select a music genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {genreList.map((genre) => (
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
                        {moodList.map((mood) => (
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
                  <FormLabel>Theme/Topic</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Overcoming adversity, a journey to a new city, the feeling of summer nostalgia..."
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    What are the lyrics about?
                  </FormDescription>
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
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose if you want complete lyrics, ideas, or structural suggestions.
                  </FormDescription>
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
                      <Input placeholder="e.g., starlight, highway, heartbeat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="desiredStructure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Structure (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Verse-Chorus-Bridge" {...field} />
                    </FormControl>
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

        {lyricOutput && (
          <div className="mt-8 p-6 bg-secondary/30 rounded-lg">
            <h3 className="text-xl font-headline mb-2">AI Lyric Output: <span className="text-primary">{lyricOutput.contentType}</span></h3>
            
            <Card className="mb-4">
              <CardHeader><CardTitle>Generated Content</CardTitle></CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto bg-muted/50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm font-mono">{lyricOutput.generatedContent}</pre>
              </CardContent>
            </Card>
            
            {lyricOutput.explanation && (
              <>
                <h4 className="text-lg font-headline mt-4 mb-2">Explanation/Suggestions:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{lyricOutput.explanation}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
