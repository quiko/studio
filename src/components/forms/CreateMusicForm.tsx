
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createMusic } from "@/ai/flows/create-music";
import { useState } from "react";
import { Loader2, Music2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const instrumentsList = [
  { id: "piano", label: "Piano" },
  { id: "acoustic_guitar", label: "Guitar (Acoustic)" },
  { id: "electric_guitar", label: "Guitar (Electric)" },
  { id: "bass_guitar", label: "Bass Guitar" },
  { id: "drums", label: "Drums" },
  { id: "violin", label: "Violin" },
  { id: "cello", label: "Cello" },
  { id: "trumpet", label: "Trumpet" },
  { id: "saxophone", label: "Saxophone" },
  { id: "flute", label: "Flute" },
  { id: "synthesizer", label: "Synthesizer" },
  { id: "vocals_lead", label: "Vocals (Lead)" },
  { id: "vocals_backup", label: "Vocals (Backup)" },
  { id: "strings_ensemble", label: "Strings Ensemble" },
  { id: "brass_section", label: "Brass Section" },
  { id: "sampler", label: "Sampler / Sequencer" },
];

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

const styleVariationList = [
  "Acoustic", "Orchestral", "Electronic", "Minimalist", "Ambient",
  "8-bit / Chiptune", "Cinematic", "Lo-fi", "Synthwave", "Live Band Feel",
  "Unplugged", "Experimental"
].sort();

import { type CreateMusicOutput, type CreateMusicInput } from "@/ai/types";

const formSchema = z.object({
  genre: z.string().min(1, { message: "Please select a genre." }),
  mood: z.string().min(1, { message: "Please select a mood." }),
  instruments: z.array(z.string()).refine((value) => value.length > 0, {
    message: "Please select at least one instrument.",
  }),
  length: z.string().min(1, { message: "Please select a length." }),
  styleVariation: z.string().optional(),
});

export default function CreateMusicForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [composition, setComposition] = useState<CreateMusicOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      genre: "",
      mood: "",
      instruments: [],
      length: "medium",
      styleVariation: "", // Empty string will show placeholder by default
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setComposition(null);
    try {
      const submissionValues: CreateMusicInput = {
        genre: values.genre,
        mood: values.mood,
        instruments: values.instruments.join(', '),
        length: values.length,
        styleVariation: (values.styleVariation === "__NONE__" || values.styleVariation === "") ? undefined : values.styleVariation,
      };
      const result = await createMusic(submissionValues);
      setComposition(result);
      toast({
        title: "Music Generated!",
        description: "AI has created a music composition for you.",
      });
    } catch (error) {
      console.error("Error creating music:", error);
      toast({
        title: "Error",
        description: "Failed to generate music. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Music2 className="mr-2 h-6 w-6 text-primary" />
          AI Music Studio
        </CardTitle>
        <CardDescription>Describe your desired music, and let our AI compose it for you.</CardDescription>
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
              name="instruments"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Instruments</FormLabel>
                    <FormDescription>
                      Select the instruments you'd like in your composition.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {instrumentsList.map((instrument) => (
                      <FormField
                        key={instrument.id}
                        control={form.control}
                        name="instruments"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={instrument.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(instrument.label)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, instrument.label])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== instrument.label
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {instrument.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
               <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select desired length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short (approx. 1 min)</SelectItem>
                        <SelectItem value="medium">Medium (approx. 2-3 mins)</SelectItem>
                        <SelectItem value="long">Long (approx. 4-5 mins)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="styleVariation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stylistic Variation (Optional)</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a stylistic variation (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__NONE__">None</SelectItem>
                        {styleVariationList.map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Composing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Create Music
                </>
              )}
            </Button>
          </form>
        </Form>

        {composition && (
          <div className="mt-8 p-6 bg-secondary/30 rounded-lg">
            <h3 className="text-xl font-headline mb-4">Generated Composition:</h3>
            <Card>
              <CardHeader><CardTitle>Music Data</CardTitle></CardHeader>
              <CardContent className="max-h-96 overflow-y-auto bg-muted/50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm">{composition.musicComposition}</pre>
              </CardContent>
            </Card>
            <h4 className="text-lg font-headline mt-4 mb-2">Explanation:</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{composition.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
