
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
import { suggestArtists, type SuggestArtistsOutput, type SuggestArtistsInput } from "@/ai/flows/suggest-artists";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const eventTypes = [
  "Corporate Event", "Private Party", "Wedding", "Festival", "Concert", 
  "Gala Dinner", "Charity Event", "Conference", "Product Launch", "Birthday Party", 
  "Anniversary", "Community Event", "Other"
].sort();

const budgetRanges = [
  "Under $500", "$500 - $1500", "$1500 - $3000", "$3000 - $5000", 
  "Over $5000", "Negotiable", "To be discussed"
];

const musicGenres = [
  "Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Classical", "Blues",
  "Country", "Folk", "Reggae", "R&B", "Soul", "Metal", "Punk",
  "Funk", "Disco", "Techno", "House", "Trance", "Ambient", "Lo-fi",
  "Synthwave", "Orchestral", "World", "Indie", "Acoustic", "Latin"
].sort();

const formSchema = z.object({
  eventType: z.string().min(1, { message: "Please select an event type." }),
  budgetRange: z.string().min(1, { message: "Please select a budget range." }),
  musicGenrePreference: z.string().min(1, { message: "Please select a music genre." }),
  additionalDetails: z.string().optional(),
});

export default function SuggestArtistsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestArtistsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventType: "",
      budgetRange: "",
      musicGenrePreference: "",
      additionalDetails: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      // Ensure that optional fields are passed as undefined if empty, as per Zod optional behavior
      const submissionValues: SuggestArtistsInput = {
        ...values,
        additionalDetails: values.additionalDetails || undefined,
      };
      const result = await suggestArtists(submissionValues);
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
        <CardDescription>Select your event criteria and let our AI suggest suitable artists.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>{range}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select music genre" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {musicGenres.map((genre) => (
                          <SelectItem key={genre} value={genre}>{genre}</SelectItem>
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
              name="additionalDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Event Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Event date and time, specific venue, desired atmosphere, number of guests, specific song requests..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide any other information that might help find the perfect artist.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
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
            {suggestions.artistSuggestions && suggestions.artistSuggestions.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 mb-4 bg-background/50 p-4 rounded-md">
                {suggestions.artistSuggestions.map((artist, index) => (
                  <li key={index} className="text-foreground">{artist}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mb-4">No specific artist names suggested. Try refining your criteria or check the reasoning below.</p>
            )}
            <h4 className="text-lg font-headline mb-2">Reasoning:</h4>
            <p className="text-muted-foreground whitespace-pre-wrap">{suggestions.reasoning}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
