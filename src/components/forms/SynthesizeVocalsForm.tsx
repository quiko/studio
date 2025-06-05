
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
import { synthesizeVocals } from "@/ai/flows/synthesize-vocals";
import { SynthesizeVocalsInputSchema, type SynthesizeVocalsInput, type SynthesizeVocalsOutput } from "@/ai/types";
import { useState, type ChangeEvent } from "react";
import { Loader2, Wand2, Voicemail, UploadCloud, FileAudio, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useUser } from "@/contexts/UserContext";

const vocalStyles = [
  "Male Tenor", "Female Alto", "Robotic", "Ethereal Whisper", "Operatic Soprano",
  "Deep Bass", "Childlike", "Spoken Word", "Rapping Flow", "Folk Ballad Singer"
].sort();

const emotionalTones = [
  "Joyful", "Melancholic", "Powerful", "Gentle", "Angry", "Sarcastic",
  "Hopeful", "Despairing", "Neutral", "Passionate", "Playful"
].sort();

const SynthesizeVocalsFormSchema = SynthesizeVocalsInputSchema;
type SynthesizeVocalsFormValues = z.infer<typeof SynthesizeVocalsFormSchema>;

export default function SynthesizeVocalsForm() {
  const { firebaseUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [synthesisOutput, setSynthesisOutput] = useState<SynthesizeVocalsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SynthesizeVocalsFormValues>({
    resolver: zodResolver(SynthesizeVocalsFormSchema),
    defaultValues: {
      lyrics: "",
      vocalStyle: "",
      emotionalTone: "",
      referenceAudioUrl: undefined,
      referenceAudioFileName: undefined,
    },
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: "File Too Large", description: "Please select a file smaller than 5MB.", variant: "destructive"});
        event.target.value = ""; // Reset file input
        return;
      }
      setSelectedFile(file);
      form.setValue("referenceAudioFileName", file.name);
    } else {
      setSelectedFile(null);
      form.setValue("referenceAudioFileName", undefined);
      form.setValue("referenceAudioUrl", undefined);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    form.setValue("referenceAudioFileName", undefined);
    form.setValue("referenceAudioUrl", undefined);
    const fileInput = document.getElementById('reference-audio-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = "";
    setUploadProgress(0);
  };

  async function onSubmit(values: SynthesizeVocalsFormValues) {
    setIsLoading(true);
    setSynthesisOutput(null);
    let submissionValues = { ...values };

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      const userId = firebaseUser?.uid || 'unknown_user';
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, `referenceAudio/${userId}/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      try {
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              console.error("Upload failed:", error);
              toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              form.setValue("referenceAudioUrl", downloadURL);
              submissionValues.referenceAudioUrl = downloadURL;
              submissionValues.referenceAudioFileName = selectedFile.name;
              toast({ title: "Upload Successful", description: `${selectedFile.name} uploaded.` });
              resolve();
            }
          );
        });
      } catch (error) {
        setIsUploading(false);
        setIsLoading(false);
        return; // Stop submission if upload fails
      }
      setIsUploading(false);
    }

    try {
      const result = await synthesizeVocals(submissionValues);
      setSynthesisOutput(result);
      toast({
        title: "Vocal Synthesis Described!",
        description: "AI has provided a conceptual description of the vocals.",
      });
    } catch (error) {
      console.error("Error synthesizing vocals:", error);
      toast({
        title: "Error",
        description: "Failed to describe vocal synthesis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
          Define lyrics, style, and emotion. Optionally upload reference audio (WAV/MP3, max 5MB) for conceptual inspiration.
          The AI will generate a textual description of how the synthesized vocals might sound. <span className="font-semibold text-destructive-foreground/80">This tool does NOT produce actual audio.</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="lyrics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lyrics</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the lyrics to be 'sung'..." {...field} rows={5} />
                  </FormControl>
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
                        {vocalStyles.map((style) => (
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
                    <FormLabel>Emotional Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an emotional tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {emotionalTones.map((tone) => (
                          <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="reference-audio-upload">Reference Audio for Conceptual Cloning (Optional)</FormLabel>
               <FormControl>
                  <Input
                    id="reference-audio-upload"
                    type="file"
                    accept="audio/wav, audio/mpeg, audio/mp3"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    disabled={isUploading || isLoading}
                  />
              </FormControl>
              <FormDescription>Upload a short audio clip (WAV or MP3, max 5MB) as conceptual inspiration for the vocal style.</FormDescription>
              {selectedFile && (
                <div className="mt-2 p-3 border rounded-md bg-muted/50 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileAudio className="h-5 w-5 text-primary" />
                      <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleRemoveFile} disabled={isUploading || isLoading}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {isUploading && (
                    <Progress value={uploadProgress} className="w-full h-2 mt-2" />
                  )}
                </div>
              )}
              <FormField
                control={form.control}
                name="referenceAudioUrl"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Hidden field to store URL */}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="referenceAudioFileName"
                render={({ field }) => (
                  <FormItem className="hidden"> {/* Hidden field to store file name */}
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" disabled={isLoading || isUploading} className="w-full sm:w-auto">
              {isLoading || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? 'Uploading...' : 'Describing...'}
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
            <h3 className="text-xl font-headline mb-2">AI Vocal Synthesis Description:</h3>
            <Card className="mb-4">
              <CardHeader><CardTitle>Conceptual Performance</CardTitle></CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto bg-muted/50 p-4 rounded">
                <pre className="whitespace-pre-wrap text-sm font-mono">{synthesisOutput.synthesisDescription}</pre>
              </CardContent>
            </Card>
            {synthesisOutput.performanceNotes && (
              <>
                <h4 className="text-lg font-headline mt-4 mb-2">Performance Notes:</h4>
                <p className="text-muted-foreground whitespace-pre-wrap text-sm">{synthesisOutput.performanceNotes}</p>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
