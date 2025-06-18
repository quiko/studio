
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
import { useUser } from "@/contexts/UserContext";
import type { ArtistProfileData, ArtistAvailabilitySlot } from "@/lib/constants";
import { useState, useEffect, type ChangeEvent } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, UploadCloud, FileAudio, Trash2 } from "lucide-react";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

const popularGenres = [
  "Acoustic", "Ambient", "Blues", "Classical", "Country", "Disco", "Electronic", 
  "Folk", "Funk", "Hip Hop", "House", "Indie", "Jazz", "Latin", "Lo-fi", 
  "Metal", "Orchestral", "Pop", "Punk", "R&B", "Reggae", "Rock", "Soul", 
  "Synthwave", "Techno", "Trance", "World"
].sort();

const ArtistProfileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  genre: z.string().min(1, { message: "Please select your main genre." }),
  portfolioAudio: z.string().url({ message: "Please enter a valid URL for audio." }).optional().or(z.literal('')),
  portfolioVideo: z.string().url({ message: "Please enter a valid URL for video." }).optional().or(z.literal('')),
  bio: z.string().optional(),
  priceRange: z.string().optional(),
  profileImage: z.string().url({ message: "Profile image URL is required." }),
  dataAiHint: z.string().max(20, { message: "AI hint should be concise (max 20 chars), e.g., 'musician portrait'."}).optional(),
  availability: z.array(
    z.object({
      startDate: z.date(),
      endDate: z.date(),
    })
  ).optional(),
});

type ArtistProfileFormValues = z.infer<typeof ArtistProfileFormSchema>;

interface ArtistProfileFormProps {
  formId: string;
  onSetIsLoading: (isLoading: boolean) => void;
  currentAvailabilityDates?: Date[]; // New prop to receive selected dates from parent
}

export default function ArtistProfileForm({ formId, onSetIsLoading, currentAvailabilityDates }: ArtistProfileFormProps) {
  const { firebaseUser, getArtistProfile, updateArtistProfile, userRole } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentProfileImage, setCurrentProfileImage] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const form = useForm<ArtistProfileFormValues>({
    resolver: zodResolver(ArtistProfileFormSchema),
    defaultValues: {
      name: "",
      genre: "",
      portfolioAudio: "",
      portfolioVideo: "",
      bio: "",
      priceRange: undefined,
      profileImage: "",
      dataAiHint: "",
      availability: [],
    },
  });

  useEffect(() => {
    if (firebaseUser && userRole === "artist") {
      const profile = getArtistProfile(firebaseUser.uid);
      // Availability from profile (already Date objects from context)
      const profileAvailability = profile.availability?.map(slot => ({
        startDate: slot.startDate instanceof Date ? slot.startDate : new Date(slot.startDate),
        endDate: slot.endDate instanceof Date ? slot.endDate : new Date(slot.endDate),
      })) || [];

      form.reset({
        name: profile.name || "",
        genre: profile.genre || "",
        portfolioAudio: profile.portfolioAudio || "",
        portfolioVideo: profile.portfolioVideo || "",
        bio: profile.bio || "",
        priceRange: profile.priceRange || undefined,
        profileImage: profile.profileImage || "https://placehold.co/150x150.png",
        dataAiHint: profile.dataAiHint || "musician portrait",
        availability: profileAvailability, // Use availability from profile data
      });
      setCurrentProfileImage(profile.profileImage || "https://placehold.co/150x150.png");
    }
  }, [firebaseUser, getArtistProfile, form, userRole]);

  // Effect to update form's availability when currentAvailabilityDates (from parent calendar) changes
  useEffect(() => {
    if (currentAvailabilityDates) {
      const newAvailabilitySlots = currentAvailabilityDates.map(date => {
        // For single day selection, startDate and endDate are the same day
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0); // Start of the day
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999); // End of the day
        return { startDate, endDate };
      });
      form.setValue("availability", newAvailabilitySlots, { shouldValidate: true, shouldDirty: true });
    }
  }, [currentAvailabilityDates, form]);


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ title: "Image Too Large", description: "Please select an image smaller than 2MB.", variant: "destructive"});
        event.target.value = "";
        return;
      }
      setNewImageFile(file);
      setCurrentProfileImage(URL.createObjectURL(file)); 
      form.setValue("dataAiHint", file.name.split('.')[0].substring(0,20) || "custom portrait"); 
    }
  };

  const handleRemoveImage = async () => {
    if (currentProfileImage && currentProfileImage.startsWith("https://firebasestorage.googleapis.com/")) {
      try {
        const imageRef = ref(storage, currentProfileImage);
        await deleteObject(imageRef);
        toast({ title: "Previous Image Removed", description: "The old profile image was deleted from storage."});
      } catch (error: any) {
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete previous profile image from Firebase Storage:", error);
            toast({ title: "Image Deletion Warning", description: "Could not delete the old image from storage. It might have already been removed or is not a Firebase Storage URL.", variant: "default"});
        }
      }
    }
    setNewImageFile(null);
    const placeholderImage = "https://placehold.co/150x150.png";
    setCurrentProfileImage(placeholderImage);
    form.setValue("profileImage", placeholderImage);
    form.setValue("dataAiHint", "abstract musician");
    const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  async function onSubmit(values: ArtistProfileFormValues) {
    if (!firebaseUser) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    onSetIsLoading(true); 

    let finalImageURL = values.profileImage;

    if (newImageFile) {
      setIsUploading(true);
      setUploadProgress(0);
      const fileName = `${firebaseUser.uid}_${Date.now()}_${newImageFile.name}`;
      const storageRefPath = `artistProfileImages/${firebaseUser.uid}/${fileName}`; 
      const imageStorageRef = ref(storage, storageRefPath);
      const uploadTask = uploadBytesResumable(imageStorageRef, newImageFile);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              toast({ title: "Image Upload Failed", description: error.message, variant: "destructive" });
              reject(error);
            },
            async () => {
              finalImageURL = await getDownloadURL(uploadTask.snapshot.ref);
              toast({ title: "Image Upload Successful", description: "New profile image uploaded." });
              resolve();
            }
          );
        });
      } catch (error) {
        setIsUploading(false);
        onSetIsLoading(false); 
        return; 
      }
      setIsUploading(false);
      setNewImageFile(null); 
    }

    // The `values.availability` should now be correctly populated from the parent calendar's selected dates
    // It already contains JavaScript Date objects due to the useEffect hook.
    const profileDataToSave: ArtistProfileData = {
      name: values.name,
      genre: values.genre,
      portfolioAudio: values.portfolioAudio || "",
      portfolioVideo: values.portfolioVideo || "",
      bio: values.bio || "",
      priceRange: values.priceRange || '',
      profileImage: finalImageURL,
      dataAiHint: values.dataAiHint || "musician portrait",
      availability: values.availability || [], // Ensure it's an empty array if undefined
    };

    try {
      // UserContext's updateArtistProfile expects Date objects for availability, which is what we have.
      updateArtistProfile(firebaseUser.uid, profileDataToSave);
      toast({
        title: "Profile Updated",
        description: "Your artist profile has been successfully updated.",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({ title: "Error", description: "Failed to update profile. Please try again.", variant: "destructive" });
    } finally {
      onSetIsLoading(false); 
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" id={formId}>
        <FormField
          control={form.control}
          name="profileImage"
          render={({ field }) => ( 
            <FormItem>
              <FormLabel>Profile Image</FormLabel>
              <div className="flex items-start gap-4">
                <Image
                  src={currentProfileImage || "https://placehold.co/150x150.png"}
                  alt="Profile Preview"
                  width={150}
                  height={150}
                  className="rounded-md object-cover aspect-square border"
                  data-ai-hint={form.getValues("dataAiHint") || "musician portrait"}
                />
                <div className="flex-1 space-y-2">
                   <FormControl>
                     <Input
                        id="profile-image-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleImageChange}
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        disabled={isUploading || form.formState.isSubmitting}
                      />
                  </FormControl>
                  {currentProfileImage && !currentProfileImage.includes("placehold.co") && (
                    <Button type="button" variant="outline" size="sm" onClick={handleRemoveImage} disabled={isUploading || form.formState.isSubmitting}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Current Image
                    </Button>
                  )}
                   {isUploading && <Progress value={uploadProgress} className="w-full h-2 mt-1" />}
                </div>
              </div>
              <FormDescription>Upload a square image (e.g., PNG, JPG, WEBP). Max 2MB. This will be publicly visible.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Artist/Band Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your official artist or band name" {...field} />
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
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main genre" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {popularGenres.map((genreItem) => (
                      <SelectItem key={genreItem} value={genreItem}>
                        {genreItem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="portfolioAudio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Audio Portfolio Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SoundCloud, Bandcamp URL" {...field} />
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
                <FormLabel>Video Portfolio Link (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., YouTube, Vimeo URL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="priceRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price Range</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., $100 - $500 per event" 
                  {...field} 
                  value={field.value || ''} 
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>Enter your typical price range for performances or services.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself as an artist, your style, influences, etc."
                  {...field}
                  rows={5}
                />
              </FormControl>
              <FormDescription>
                Share a brief biography about your music and career.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* The submit button is now rendered by the parent page src/app/(authenticated)/dashboard/profile/page.tsx */}
      </form>
    </Form>
  );
}
