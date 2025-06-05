
"use client";

import CreateMusicForm from "@/components/forms/CreateMusicForm";
import GenerateLyricsForm from "@/components/forms/GenerateLyricsForm";
import SynthesizeVocalsForm from "@/components/forms/SynthesizeVocalsForm"; // Changed to default import
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Edit, Voicemail } from "lucide-react"; // Voicemail can represent synthesized voice

export default function CreateMusicPage() {
  return (
    <div>
      <PageHeader
        title="AI Music & Lyric Studio"
        description="Compose original music, generate lyrics, describe vocal synthesis, and experiment with AI assistance."
      />
      <Tabs defaultValue="music_composition" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 md:w-auto mb-6">
          <TabsTrigger value="music_composition">
            <Music2 className="mr-2 h-4 w-4" />
            Music Composition
          </TabsTrigger>
          <TabsTrigger value="lyric_generation">
            <Edit className="mr-2 h-4 w-4" />
            Lyric Generation
          </TabsTrigger>
          <TabsTrigger value="vocal_synthesis">
            <Voicemail className="mr-2 h-4 w-4" />
            Vocal Synthesis (Conceptual)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="music_composition">
          <CreateMusicForm />
        </TabsContent>
        <TabsContent value="lyric_generation">
          <GenerateLyricsForm />
        </TabsContent>
        <TabsContent value="vocal_synthesis">
          <SynthesizeVocalsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
