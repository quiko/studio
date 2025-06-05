
"use client";

import CreateMusicForm from "@/components/forms/CreateMusicForm";
import GenerateLyricsForm from "@/components/forms/GenerateLyricsForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music2, Edit } from "lucide-react";

export default function CreateMusicPage() {
  return (
    <div>
      <PageHeader
        title="AI Music & Lyric Studio"
        description="Compose original music, generate lyrics, and experiment with AI assistance."
      />
      <Tabs defaultValue="music_composition" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-6">
          <TabsTrigger value="music_composition">
            <Music2 className="mr-2 h-4 w-4" />
            Music Composition
          </TabsTrigger>
          <TabsTrigger value="lyric_generation">
            <Edit className="mr-2 h-4 w-4" />
            Lyric Generation
          </TabsTrigger>
        </TabsList>
        <TabsContent value="music_composition">
          <CreateMusicForm />
        </TabsContent>
        <TabsContent value="lyric_generation">
          <GenerateLyricsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
