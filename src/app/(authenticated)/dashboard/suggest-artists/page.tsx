import SuggestArtistsForm from "@/components/forms/SuggestArtistsForm";
import { PageHeader } from "@/components/ui/PageHeader";

export default function SuggestArtistsPage() {
  return (
    <div>
      <PageHeader
        title="AI Artist Matchmaking"
        description="Let AI help you find the perfect artists for your event."
      />
      <SuggestArtistsForm />
    </div>
  );
}
