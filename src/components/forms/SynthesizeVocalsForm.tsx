
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
import { Input as ShadcnInput } from "@/components/ui/input"; // Renamed to avoid conflict
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { synthesizeVocals } from "@/ai/flows/synthesize-vocals";
import { type SynthesizeVocalsOutput, SynthesizeVocalsInputSchema, type SynthesizeVocalsInput } from "@/ai/types";
import { useState, type ChangeEvent } from "react";
import { Loader2, Wand2, Voicemail, Info, UploadCloud, FileAudio, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/firebase"; // Import storage
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage"; // Import Firebase storage functions
import { useUser } from "@/contexts/UserContext";


const vocalStylesList = [
  "Male Tenor (Clear)", "Male Baritone (Warm)", "Male Bass (Deep)",
  "Female Soprano (Bright)", "Female Mezzo-Soprano (Rich)", "Female Alto (Smooth)",
  "Androgynous (Mid-Range)", "Robotic (Monotone)", "Ethereal Whisper", "Childlike (Innocent)",
  "Operatic (Dramatic)", "Folk Singer (Natural)", "Pop Star (Polished)", "Rock Vocalist (Gritty)"
].sort();

const emotionalTonesList = [
  "Joyful / Happy", "Sad / Melancholic", "Energetic / Excited", "Angry / Aggressive",
  "Romantic / Tender", "Mysterious / Eerie", "Powerful / Epic", "Gentle / Soothing",
  "Neutral / Storytelling", "Sarcastic / Playful", "Hopeful / Uplifting", "Despairing / Somber"
].sort();

type SynthesizeVocalsFormValues = z.infer<typeof SynthesizeVocalsInputSchema>;

export function SynthesizeVocalsForm() {
  const { firebaseUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [synthesisOutput, setSynthesisOutput] = useState<SynthesizeVocalsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SynthesizeVocalsFormValues>({
    resolver: zodResolver(SynthesizeVocalsInputSchema),
    defaultValues: {
      lyrics: "",
      vocalStyle: "",
      emotionalTone: "",
      referenceAudioUrl: undefined,
      referenceAudioFileName: undefined,
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (form.getValues("referenceAudioUrl")) { // If a file was previously uploaded and its URL is stored
      const previousFileUrl = form.getValues("referenceAudioUrl");
      if (previousFileUrl) {
        const fileRef = storageRef(storage, previousFileUrl);
        deleteObject(fileRef).catch(error => console.warn("Could not delete previous file from storage:", error));
      }
      form.setValue("referenceAudioUrl", undefined);
      form.setValue("referenceAudioFileName", undefined);
    }
    setSelectedFile(event.target.files ? event.target.files[0] : null);
    setSynthesisOutput(null); // Clear previous synthesis if new file is chosen
  };

  const removeSelectedFile = () => {
    if (form.getValues("referenceAudioUrl")) {
      const fileUrlToDelete = form.getValues("referenceAudioUrl");
      if(fileUrlToDelete){
        const fileRef = storageRef(storage, fileUrlToDelete);
        deleteObject(fileRef).then(() => {
          toast({ title: "Reference audio removed from storage."});
        }).catch(error => {
          console.warn("Could not delete file from storage during removal:", error);
          toast({ title: "Could not remove file from storage", description: "Please try again.", variant: "destructive"});
        });
      }
    }
    setSelectedFile(null);
    form.setValue("referenceAudioUrl", undefined);
    form.setValue("referenceAudioFileName", undefined);
    const fileInput = document.getElementById('referenceAudioFile') as HTMLInputElement;
    if (fileInput) fileInput.value = ""; // Reset file input
  }

  async function onSubmit(values: SynthesizeVocalsFormValues) {
    setIsLoading(true);
    setSynthesisOutput(null);
    let currentValues = { ...values };

    if (selectedFile && !currentValues.referenceAudioUrl) { // File selected but not yet uploaded
      setIsUploading(true);
      setUploadProgress(0);
      const uniqueFileName = `referenceAudio/${firebaseUser?.uid || 'unknown_user'}/${Date.now()}_${selectedFile.name}`;
      const fileRef = storageRef(storage, uniqueFileName);

      try {
        const uploadTask = uploadBytesResumable(fileRef, selectedFile);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
              setIsUploading(false);
              setIsLoading(false);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              form.setValue("referenceAudioUrl", downloadURL);
              form.setValue("referenceAudioFileName", selectedFile.name);
              currentValues.referenceAudioUrl = downloadURL;
              currentValues.referenceAudioFileName = selectedFile.name;
              toast({ title: "File Uploaded", description: `${selectedFile.name} uploaded successfully.` });
              setIsUploading(false);
              setUploadProgress(100);
              resolve();
            }
          );
        });
      } catch (uploadError) {
        // Error already handled by toast in uploadTask's error callback
        setIsLoading(false);
        return; // Stop submission if upload failed
      }
    } else if (!selectedFile) { // No file selected, ensure URL fields are undefined
        currentValues.referenceAudioUrl = undefined;
        currentValues.referenceAudioFileName = undefined;
        form.setValue("referenceAudioUrl", undefined);
        form.setValue("referenceAudioFileName", undefined);
    }


    try {
      const result = await synthesizeVocals(currentValues);
      setSynthesisOutput(result);
      toast({
        title: "Vocal Synthesis Described!",
        description: "AI has generated a description of the conceptual vocal performance.",
      });
    } catch (error) {
      console.error("Error describing vocal synthesis:", error);
      toast({
        title: "Error",
        description: "Failed to describe vocal synthesis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  }

  return (
    <Card className="mt-0">
      <CardHeader>
        <CardTitle className="font-headline flex items-center">
          <Voicemail className="mr-2 h-6 w-6 text-primary" />
          Conceptual Vocal Synthesis
        </CardTitle>
        <CardDescription>
          Describe the ideal vocal performance for your lyrics. This tool generates a textual description of how an AI might synthesize these vocals, not actual audio.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="default" className="mb-6 bg-accent/20">
          <Info className="h-5 w-5 text-accent" />
          <AlertTitle className="font-semibold text-accent">Conceptual Tool Only</AlertTitle>
          <AlertDescription className="text-accent/80">
            This tool does not generate audible vocal tracks. It provides a detailed textual description to help you conceptualize and articulate your desired vocal sound and performance. Uploaded audio is for conceptual reference by the AI.
          </AlertDescription>
        </Alert>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="lyrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lyrics to Synthesize</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter the lyrics you want the AI to 'sing'..."
                      {...field}
                      rows={6}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide the full lyrical content.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="vocalStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Vocal Style</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a vocal style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vocalStylesList.map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emotionalTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desired Emotional Tone</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an emotional tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emotionalTonesList.map((tone) => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel htmlFor="referenceAudioFile">Conceptual Voice Reference Audio (Optional)</FormLabel>
              <FormControl>
                <ShadcnInput 
                  id="referenceAudioFile"
                  type="file" 
                  accept="audio/wav, audio/mpeg, audio/mp3" // Common audio types
                  onChange={handleFileChange}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  disabled={isUploading}
                />
              </FormControl>
              <FormDescription>
                Upload a short audio file (WAV, MP3) as a conceptual reference. The AI will describe how it might be inspired by it. Max 5MB.
              </FormDescription>
              {selectedFile && (
                <div className="mt-2 p-3 border rounded-md bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={removeSelectedFile} disabled={isUploading}>
                      <XCircle className="h-4 w-4 mr-1" /> Remove
                    </Button>
                  </div>
                  {isUploading && uploadProgress !== null && (
                    <Progress value={uploadProgress} className="w-full h-2 mt-2" />
                  )}
                  {form.getValues("referenceAudioUrl") && !isUploading && uploadProgress === 100 && (
                     <p className="text-xs text-green-600 mt-1">File uploaded and linked.</p>
                  )}
                </div>
              )}
              <FormMessage />
            </FormItem>
            
            {/* Hidden fields for RHF to track URL and FileName, populated by upload logic */}
            <FormField control={form.control} name="referenceAudioUrl" render={({ field }) => <ShadcnInput type="hidden" {...field} />} />
            <FormField control={form.control} name="referenceAudioFileName" render={({ field }) => <ShadcnInput type="hidden" {...field} />} />


            <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : isLoading ? (
                 <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Describing Vocals...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Describe Vocal Synthesis
                </>
              )}
            </Button>
          </form>
        </Form>

        {synthesisOutput && (
          <div className="mt-8 p-6 bg-secondary/30 rounded-lg">
            <h3 className="text-xl font-headline mb-4">AI Vocal Synthesis Description:</h3>
            
            <Card className="mb-4">
              <CardHeader><CardTitle>Synthesis Description</CardTitle></CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto bg-muted/50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm">{synthesisOutput.synthesisDescription}</pre>
              </CardContent>
            </Card>
            
            {synthesisOutput.performanceNotes && (
              <Card>
                <CardHeader><CardTitle>Performance Notes</CardTitle></CardHeader>
                <CardContent className="max-h-[300px] overflow-y-auto bg-muted/50 p-4 rounded">
                  <pre className="whitespace-pre-wrap text-sm">{synthesisOutput.performanceNotes}</pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
