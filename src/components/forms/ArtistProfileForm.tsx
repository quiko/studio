
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

import { MultiSelect } from "../ui/multi-select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { UserType, type ArtistProfileData, DEFAULT_ARTIST_PROFILE } from "@/lib/constants";
import { useEffect, useState, type ChangeEvent } from "react";
import { Loader2, Save, UploadCloud, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Progress } from "@/components/ui/progress";

const GENRES = ["Pop", "Rock", "Hip Hop", "Electronic", "Jazz", "Blues", "Country", "R&B", "Folk", "Classical", "World", "Reggae", "Punk", "Metal", "Funk", "Soul", "Disco", "House", "Techno", "Trance", "Ambient", "Drum & Bass", "Indie", "Alternative", "Grime", "Dubstep", "Gospel", "Latin", "Afrobeat"];

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  genre: z.array(z.string()).min(1, { message: "Please select at least one genre." }),
  portfolioAudio: z.string().url({ message: "Please enter a valid URL for audio portfolio." }).optional().or(z.literal('')),
  portfolioVideo: z.string().url({ message: "Please enter a valid URL for video portfolio." }).optional().or(z.literal('')),
  reviews: z.string().optional(),
  indicativeRates: z.string().min(1, { message: "Indicative rates are required (e.g., $$, negotiable)." }),
  profileImage: z.string().url({ message: "Profile image must be a valid URL." }).optional().or(z.literal('')),
});

type ArtistProfileFormValues = z.infer<typeof formSchema>;

export default function ArtistProfileForm() {
  const { getArtistProfile, updateArtistProfile, firebaseUser, userRole } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentProfileImage, setCurrentProfileImage] = useState(DEFAULT_ARTIST_PROFILE.profileImage);

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
      // Ensure genre is an array for the form
      const formCompatibleProfile = {
        ...profile,
        genre: Array.isArray(profile.genre) 
          ? profile.genre 
          : (profile.genre && typeof profile.genre === 'string' ? [profile.genre] : [])
      };
      if (formCompatibleProfile.genre.length === 1 && formCompatibleProfile.genre[0] === '') {
        formCompatibleProfile.genre = [];
      }

      form.reset(formCompatibleProfile);
      setCurrentProfileImage(profile.profileImage || DEFAULT_ARTIST_PROFILE.profileImage);
      setImagePreview(null); 
      setSelectedFile(null);
    } else {
      const initialDefaults = { 
        ...DEFAULT_ARTIST_PROFILE, 
        name: firebaseUser?.displayName || "Artist Name",
        genre: [] // Ensure genre is an empty array for new/non-artist users
      };
      form.reset(initialDefaults);
      setCurrentProfileImage(DEFAULT_ARTIST_PROFILE.profileImage);
    }
  }, [firebaseUser, userRole, getArtistProfile, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'profileImage') {
        setCurrentProfileImage(value.profileImage || DEFAULT_ARTIST_PROFILE.profileImage);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, form.watch]);


  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
       if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please select an image smaller than 5MB.", variant: "destructive"});
        event.target.value = ""; 
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      form.setValue('profileImage', '', { shouldValidate: true, shouldDirty: true }); 
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    form.setValue('profileImage', currentProfileImage, { shouldValidate: true });
    const fileInput = document.getElementById('profile-image-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };


  async function onSubmit(values: ArtistProfileFormValues) {
    if (userRole !== UserType.ARTIST || !firebaseUser) {
      toast({ title: "Error", description: "Only authenticated artists can update profiles.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    let finalProfileImageUrl = values.profileImage;

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      const fileName = `profileImages/${firebaseUser.uid}/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      try {
        finalProfileImageUrl = await new Promise<string>((resolve, reject) => {
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
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              toast({ title: "Image Uploaded", description: "Profile image successfully uploaded." });
              resolve(downloadURL);
            }
          );
        });
      } catch (error) {
        setIsUploading(false);
        setIsLoading(false);
        return; 
      }
      setIsUploading(false);
    }
    
    // Convert genre array back to string for ArtistProfileData
    const genreString = Array.isArray(values.genre) ? values.genre.join(', ') : '';

    const dataToSave: ArtistProfileData = {
      ...values,
      genre: genreString, // Save genre as string
      profileImage: finalProfileImageUrl || DEFAULT_ARTIST_PROFILE.profileImage,
      dataAiHint: values.profileImage ? "musician portrait" : DEFAULT_ARTIST_PROFILE.dataAiHint,
    };

    try {
      updateArtistProfile(firebaseUser.uid, dataToSave);
      toast({ title: "Profile Updated", description: "Your artist profile has been saved." });
      setSelectedFile(null); 
      setImagePreview(null);
      // Reset form with values that are compatible with the form schema (genre as array)
      form.reset({ ...values, profileImage: dataToSave.profileImage }); 
      setCurrentProfileImage(dataToSave.profileImage); 
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

  const displaySrc = imagePreview || currentProfileImage;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Image
            src={displaySrc}
            alt="Profile Preview"
            width={120}
            height={120}
            className="rounded-full object-cover aspect-square border"
            data-ai-hint="musician portrait"
            onError={() => setCurrentProfileImage(DEFAULT_ARTIST_PROFILE.profileImage)}
          />
          <div className="flex-grow w-full space-y-2">
            <FormLabel htmlFor="profile-image-upload">Profile Image</FormLabel>
             <Input
                id="profile-image-upload"
                type="file"
                accept="image/png, image/jpeg, image/gif, image/webp"
                onChange={handleFileChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                disabled={isUploading || isLoading}
              />
            {isUploading && <Progress value={uploadProgress} className="w-full h-2 mt-2" />}
            {selectedFile && !isUploading && (
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Selected: {selectedFile.name}</span>
                <Button type="button" variant="ghost" size="sm" onClick={handleRemoveSelectedFile} className="text-destructive hover:text-destructive-foreground">
                  <Trash2 className="h-4 w-4 mr-1" /> Remove
                </Button>
              </div>
            )}
            <FormDescription>
              Upload an image (PNG, JPG, GIF, WEBP, max 5MB). If no file is uploaded, the existing URL will be kept.
            </FormDescription>
            <FormField
              control={form.control}
              name="profileImage"
              render={({ field }) => ( <FormItem className="hidden"><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)}
            />
          </div>
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
          render={({ field }) => {
            const normalizedValue = Array.isArray(field.value)
              ? field.value
              : field.value === '' || field.value === null || field.value === undefined
                ? []
                : String(field.value).split(',').map(s => s.trim()).filter(s => s !== '');


            return (
              <FormItem>
                <FormLabel>Genres</FormLabel>
                <FormControl>
                  <MultiSelect
                    options={GENRES.map(genre => ({ label: genre, value: genre }))}
                    placeholder="Select genres..."
                    {...field}
                    value={normalizedValue}
                    onChange={(selectedValues: string[]) => {
                      field.onChange(selectedValues);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
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
        <Button type="submit" disabled={isLoading || isUploading || !firebaseUser}>
          {isLoading || isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isUploading ? `Uploading (${Math.round(uploadProgress)}%)...` : (isLoading ? 'Saving...' : 'Save Profile')}
        </Button>
      </form>
    </Form>
  );
}

    