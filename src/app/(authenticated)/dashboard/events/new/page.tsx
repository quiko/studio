import EventForm from "@/components/forms/EventForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function NewEventPage() {
  return (
    <div>
      <PageHeader
        title="Create New Event"
        description="Fill in the details below to create your event."
      />
      <Card>
        <CardContent className="pt-6">
          <EventForm />
        </CardContent>
      </Card>
    </div>
  );
}
