
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, // Reverted to original name
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useRef } from "react";
import { Loader2, Save, UserSearch, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import type { GeneratedContractData, ArtistProfileData } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const formSchema = z.object({
  organizerName: z.string().min(1, { message: "Organizer name is pre-filled." }),
  artistName: z.string().min(2, { message: "Artist name is required." }),
  eventName: z.string().min(3, { message: "Event name is required." }),
  eventDate: z.date({ required_error: "Event date is required." }),
  eventLocation: z.string().min(3, { message: "Event location is required." }),
  fee: z.string().regex(/^\$?\d+(,\d{3})*(\.\d{2})?$/, { message: "Invalid fee format (e.g., $1,000 or 1000.00)." }),
  clauses: z.string().min(10, { message: "At least some basic terms/clauses are required." }),
});

type CreateContractFormValues = z.infer<typeof formSchema>;

interface SuggestionArtist extends ArtistProfileData {
  id: string;
}

export default function CreateContractForm() {
  const { firebaseUser, addOrganizerContract, artistProfiles: allArtistProfilesMap } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [artistSearchTerm, setArtistSearchTerm] = useState("");
  const [artistSuggestions, setArtistSuggestions] = useState<SuggestionArtist[]>([]);
  const [showArtistSuggestions, setShowArtistSuggestions] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);


  const form = useForm<CreateContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      organizerName: firebaseUser?.displayName || firebaseUser?.email || "",
      artistName: "",
      eventName: "",
      eventDate: undefined,
      eventLocation: "",
      fee: "",
      clauses: "Standard performance terms apply. Payment due upon completion. Cancellation policy: 14 days notice.",
    },
  });

  useEffect(() => {
    if (firebaseUser) {
      form.setValue("organizerName", firebaseUser.displayName || firebaseUser.email || "");
    }
  }, [firebaseUser, form]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowArtistSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [suggestionsRef]);

  const handleArtistSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setArtistSearchTerm(term);
    form.setValue("artistName", term);
    setSelectedArtistId(null);

    if (term.length > 1) {
      const profilesArray: SuggestionArtist[] = Object.entries(allArtistProfilesMap)
        .map(([id, profile]) => ({ ...profile, id }))
        .filter(profile => profile.name.toLowerCase().includes(term.toLowerCase()));
      setArtistSuggestions(profilesArray);
      setShowArtistSuggestions(true);
    } else {
      setArtistSuggestions([]);
      setShowArtistSuggestions(false);
    }
  };

  const handleArtistSuggestionClick = (artist: SuggestionArtist) => {
    setArtistSearchTerm(artist.name);
    form.setValue("artistName", artist.name);
    setSelectedArtistId(artist.id);
    setArtistSuggestions([]);
    setShowArtistSuggestions(false);
  };


  async function onSubmit(values: CreateContractFormValues) {
    if (!firebaseUser) {
        toast({ title: "Authentication Error", description: "You must be logged in to create a contract.", variant: "destructive"});
        return;
    }
    setIsLoading(true);

    const newContractData: Omit<GeneratedContractData, 'id' | 'createdAt' | 'status' | 'signedByOrganizer' | 'signedByArtist'> = {
        organizerId: firebaseUser.uid,
        organizerName: values.organizerName,
        artistName: values.artistName,
        artistId: selectedArtistId || undefined,
        eventName: values.eventName,
        eventDate: values.eventDate.toISOString(),
        eventLocation: values.eventLocation,
        fee: values.fee,
        clauses: values.clauses,
    };

    try {
      addOrganizerContract(newContractData);

      toast({
        title: "Contract Draft Saved",
        description: `Draft for "${values.eventName}" with ${values.artistName} has been saved.`,
      });
      form.reset({
        organizerName: firebaseUser.displayName || firebaseUser.email || "",
        artistName: "",
        eventName: "",
        eventDate: undefined,
        eventLocation: "",
        fee: "",
        clauses: "Standard performance terms apply. Payment due upon completion. Cancellation policy: 14 days notice.",
      });
      setArtistSearchTerm("");
      setSelectedArtistId(null);
    } catch (error) {
        console.error("Error creating contract draft:", error);
        toast({ title: "Error", description: "Could not save contract draft.", variant: "destructive"})
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="organizerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizer Name</FormLabel>
              <FormControl>
                <Input {...field} readOnly className="bg-muted/50" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="artistName"
              render={({ field }) => (
              <FormItem>
                <FormLabel>Artist Name</FormLabel>
                <div className="relative" ref={suggestionsRef}>
                  <FormControl>
                    <div className="relative">
                        <UserSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search for registered artists..."
                          value={artistSearchTerm}
                          onChange={handleArtistSearchChange}
                          onFocus={() => artistSearchTerm.length > 1 && setShowArtistSuggestions(true)}
                          className="pl-10"
                        />
                    </div>
                  </FormControl>
                  {showArtistSuggestions && artistSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {artistSuggestions.map((artist) => (
                        <div
                          key={artist.id}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleArtistSuggestionClick(artist)}
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={artist.profileImage || 'https://placehold.co/40x40.png'} alt={artist.name} data-ai-hint="artist avatar"/>
                            <AvatarFallback>{artist.name.substring(0,1).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{artist.name}</p>
                            <p className="text-xs text-muted-foreground">{artist.genre}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormDescription>Search or type artist name. If not found, the entered name will be used.</FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Charity Gala" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Event Date</FormLabel>
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
                          {field.value ? format(field.value, "PPP") : <span>Pick event date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="eventLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Grand Ballroom, Cityville" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Performance Fee</FormLabel>
                  <FormControl>
                    <Input placeholder="$1,200.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <FormField
          control={form.control}
          name="clauses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Clauses</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Specify payment terms, cancellation policy, technical rider summary, etc."
                  {...field}
                  rows={6}
                />
              </FormControl>
              <FormDescription>
                Detail the key terms of the agreement.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading || !firebaseUser} className="w-full sm:w-auto">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Draft Contract
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
            Note: This saves a draft. PDF generation, e-signatures, and sending to artist will be available in a future step.
        </p>
      </form>
    </Form>
  );
}
