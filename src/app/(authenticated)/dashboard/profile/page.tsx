import ArtistProfileForm from "@/components/forms/ArtistProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function ArtistProfilePage() {
  return (
    <div>
      <PageHeader
        title="My Artist Profile"
        description="Keep your profile updated to attract event organizers."
      />
      <Card>
        <CardContent className="pt-6">
          <ArtistProfileForm />
        </CardContent>
      </Card>
    </div>
  );
}
