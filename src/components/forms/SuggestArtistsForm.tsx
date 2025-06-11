
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
import { Loader2, Wand2, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// Removed MultiSelect import as it's no longer used

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

const generateTimeSlots = () => {
  const slots = ["Any Time"];
  for (let i = 0; i < 24; i++) {
    const startHour = i.toString().padStart(2, '0');
    const endHour = ((i + 1) % 24).toString().padStart(2, '0');
    slots.push(`${startHour}:00 - ${endHour}:00`);
  }
  return slots;
};
const eventTimeOfDayOptions = generateTimeSlots();


const numberOfGuestsOptions = [
  "Under 25", "25 - 50", "51 - 100", "101 - 250", "251 - 500", "500+"
];

const formSchema = z.object({
  eventType: z.string().min(1, { message: "Please select an event type." }),
  budgetRange: z.string().min(1, { message: "Please select a budget range." }),
  musicGenrePreference: z.string().min(1, { message: "Please select a music genre." }), // Changed from array to string
  specificEventDate: z.date().optional(),
  eventTimeOfDay: z.string().optional(),
  numberOfGuests: z.string().optional(),
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
      musicGenrePreference: "", // Changed from [] to ""
      specificEventDate: undefined,
      eventTimeOfDay: "",
      numberOfGuests: "",
      additionalDetails: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setSuggestions(null);
    try {
      let eventStartTime: string | undefined = undefined;
      let eventEndTime: string | undefined = undefined;

      if (values.eventTimeOfDay && values.eventTimeOfDay !== "Any Time") {
        const [start, end] = values.eventTimeOfDay.split(" - ");
        eventStartTime = start;
        eventEndTime = end;
      }

      const submissionValues: SuggestArtistsInput = {
        ...values,
        numberOfGuests: values.numberOfGuests === "" ? undefined : values.numberOfGuests,
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
                    <FormLabel>Music Genre Preference</FormLabel> {/* Changed label */}
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a music genre" />
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

            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="specificEventDate"
                // @ts-ignore - specificEventDate is handled as Date | undefined in the form,
                // but the AI input expects Date | undefined and handles the conversion internally.
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Specific Event Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Leave blank if timeframe is flexible.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eventTimeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Time of Day</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time of day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventTimeOfDayOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numberOfGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Number of Guests</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select guest count" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {numberOfGuestsOptions.map((option) => (
                          <SelectItem key={option} value={option}>{option}</SelectItem>
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
                      placeholder="e.g., Specific venue, desired atmosphere, specific song requests..."
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

    