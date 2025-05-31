import CreateMusicForm from "@/components/forms/CreateMusicForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function CreateMusicPage() {
  return (
    <div>
      <PageHeader
        title="AI Music Studio"
        description="Compose original music with the help of AI. Experiment with genres, moods, and instruments."
      />
      <CreateMusicForm />
    </div>
  );
}
