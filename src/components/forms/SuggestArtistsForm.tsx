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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { suggestArtists, type SuggestArtistsOutput } from "@/ai/flows/suggest-artists";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const formSchema = z.object({
  eventDetails: z.string().min(10, {
    message: "Event details must be at least 10 characters.",
  }),
  musicGenrePreference: z.string().min(3, {
    message: "Music genre must be at least 3 characters.",
  }),
});

export default function SuggestArtistsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestArtistsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventDetails: "",
      musicGenrePreference: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      const result = await suggestArtists(values);
      setSuggestions(result);
      toast({
        title: "Suggestions Generated!",
        description: "AI has provided artist recommendations.",
      });
    } catch (error) {
      console.error("Error suggesting artists:", error);
      toast({
        title: "Error",
        description: "Failed to generate artist suggestions. Please try again.",
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
          <Wand2 className="mr-2 h-6 w-6 text-primary" />
          Find Your Perfect Artist
        </CardTitle>
        <CardDescription>Describe your event and preferred genre, and let our AI suggest suitable artists.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="eventDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Details</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Corporate gala, evening of June 15th, downtown venue, budget $2000-$3000."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details like event type, date, location, and budget.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="musicGenrePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Music Genre Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jazz, Pop, Electronic, Folk" {...field} />
                  </FormControl>
                  <FormDescription>
                    What kind of music are you looking for?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Suggest Artists
                </>
              )}
            </Button>
          </form>
        </Form>

        {suggestions && (
          <div className="mt-8 p-6 bg-secondary/30 rounded-lg">
            <h3 className="text-xl font-headline mb-4">Artist Suggestions:</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              {suggestions.artistSuggestions.map((artist, index) => (
                <li key={index} className="text-foreground">{artist}</li>
              ))}
            </ul>
            <h4 className="text-lg font-headline mb-2">Reasoning:</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{suggestions.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
