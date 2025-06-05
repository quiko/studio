
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
import { type SynthesizeVocalsOutput, SynthesizeVocalsInputSchema, type SynthesizeVocalsInput } from "@/ai/types";
import { useState } from "react";
import { Loader2, Wand2, Voicemail, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function SynthesizeVocalsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [synthesisOutput, setSynthesisOutput] = useState<SynthesizeVocalsOutput | null>(null);
  const { toast } = useToast();

  const form = useForm<SynthesizeVocalsFormValues>({
    resolver: zodResolver(SynthesizeVocalsInputSchema),
    defaultValues: {
      lyrics: "",
      vocalStyle: "",
      emotionalTone: "",
      voiceCloningReference: "",
    },
  });

  async function onSubmit(values: SynthesizeVocalsFormValues) {
    setIsLoading(true);
    setSynthesisOutput(null);
    try {
      const result = await synthesizeVocals(values);
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
            This tool does not generate audible vocal tracks. It provides a detailed textual description to help you conceptualize and articulate your desired vocal sound and performance.
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
                        </Trigger>
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
            
            <FormField
              control={form.control}
              name="voiceCloningReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conceptual Voice Cloning Reference (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'A young female pop singer like Olivia Rodrigo', 'A classic 70s rock tenor'" {...field} />
                  </FormControl>
                   <FormDescription>
                    Describe a voice you'd like the AI to conceptually emulate. This is for descriptive inspiration only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
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
