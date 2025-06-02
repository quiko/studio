
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
import { useUser } from "@/contexts/UserContext";
import { UserType, type ArtistProfileData, DEFAULT_ARTIST_PROFILE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  genre: z.string().min(3, { message: "Genre must be at least 3 characters." }),
  portfolioAudio: z.string().url({ message: "Please enter a valid URL for audio portfolio." }).optional().or(z.literal('')),
  portfolioVideo: z.string().url({ message: "Please enter a valid URL for video portfolio." }).optional().or(z.literal('')),
  reviews: z.string().optional(), 
  indicativeRates: z.string().min(1, { message: "Indicative rates are required (e.g., $$, negotiable)." }),
  profileImage: z.string().url({ message: "Please enter a valid URL for profile image." }).optional().or(z.literal('')),
});

type ArtistProfileFormValues = z.infer<typeof formSchema>;

export default function ArtistProfileForm() {
  const { getArtistProfile, updateArtistProfile, firebaseUser, userRole } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentProfileImage, setCurrentProfileImage] = useState("https://placehold.co/150x150.png");

  const defaultFormValues = firebaseUser && userRole === UserType.ARTIST
    ? getArtistProfile(firebaseUser.uid)
    : { ...DEFAULT_ARTIST_PROFILE, name: firebaseUser?.displayName || "Artist Name" };

  const form = useForm<ArtistProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
  });
  
  useEffect(() => {
    if (firebaseUser && userRole === UserType.ARTIST) {
      const profile = getArtistProfile(firebaseUser.uid);
      form.reset(profile); // Reset form with fetched profile data
      setCurrentProfileImage(profile.profileImage || "https://placehold.co/150x150.png");
    } else {
       form.reset({ ...DEFAULT_ARTIST_PROFILE, name: firebaseUser?.displayName || "Artist Name" });
       setCurrentProfileImage("https://placehold.co/150x150.png");
    }
  }, [firebaseUser, userRole, getArtistProfile, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'profileImage') {
        setCurrentProfileImage(value.profileImage || "https://placehold.co/150x150.png");
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  async function onSubmit(values: ArtistProfileFormValues) {
    if (userRole !== UserType.ARTIST || !firebaseUser) {
      toast({ title: "Error", description: "Only authenticated artists can update profiles.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      updateArtistProfile(firebaseUser.uid, values as ArtistProfileData); // Use UID as key
      toast({ title: "Profile Updated", description: "Your artist profile has been saved." });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }
  
  if (userRole !== UserType.ARTIST) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">This page is for artists only.</p>
      </div>
    );
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <Image 
            src={currentProfileImage} 
            alt="Profile Preview" 
            width={100} 
            height={100} 
            className="rounded-full object-cover"
            data-ai-hint="musician portrait"
          />
          <FormField
            control={form.control}
            name="profileImage"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Artist/Band Name</FormLabel>
              <FormControl>
                <Input placeholder="Your awesome stage name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="genre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Main Genre</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Indie Rock, Electronic, Jazz Fusion" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="indicativeRates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Indicative Rates</FormLabel>
              <FormControl>
                <Input placeholder="e.g., $500-$1000 per event, Negotiable, $$" {...field} />
              </FormControl>
              <FormDescription>Give organizers an idea of your pricing.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="portfolioAudio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audio Portfolio URL (SoundCloud, Bandcamp, etc.)</FormLabel>
              <FormControl>
                <Input placeholder="https://soundcloud.com/your-profile" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="portfolioVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video Portfolio URL (YouTube, Vimeo, etc.)</FormLabel>
              <FormControl>
                <Input placeholder="https://youtube.com/your-channel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reviews"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reviews / Testimonials</FormLabel>
              <FormControl>
                <Textarea placeholder="Paste any reviews or testimonials here. (Full review system coming soon)" {...field} rows={4} />
              </FormControl>
              <FormDescription>Showcase what others say about your performances.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isLoading || !firebaseUser}>
           {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Profile
        </Button>
      </form>
    </Form>
  );
}
