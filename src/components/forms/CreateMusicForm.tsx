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
import { createMusic, type CreateMusicOutput } from "@/ai/flows/create-music";
import { useState } from "react";
import { Loader2, Music2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  genre: z.string().min(3, { message: "Genre must be at least 3 characters." }),
  mood: z.string().min(3, { message: "Mood must be at least 3 characters." }),
  instruments: z.string().min(3, { message: "Instruments must be at least 3 characters." }),
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
      instruments: "",
      length: "medium",
      styleVariation: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setComposition(null);
    try {
      const result = await createMusic(values);
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
                    <FormControl>
                      <Input placeholder="e.g., Lo-fi, Classical, Synthwave" {...field} />
                    </FormControl>
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
                    <FormControl>
                      <Input placeholder="e.g., Chill, Epic, Melancholic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="instruments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instruments</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Piano, Guitar, Drums, Synthesizer" {...field} />
                  </FormControl>
                  <FormDescription>Comma-separated list of instruments.</FormDescription>
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
                    <FormControl>
                      <Input placeholder="e.g., 8-bit, Orchestral, Acoustic" {...field} />
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
