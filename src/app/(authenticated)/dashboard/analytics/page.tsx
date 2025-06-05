
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Music Industry Analytics"
        description="Explore trends, insights, and data related to the music industry."
      />
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center">
            <Lightbulb className="mr-2 h-5 w-5 text-primary" />
            Coming Soon!
          </CardTitle>
          <CardDescription>
            This section will provide valuable analytics and insights. Stay tuned for updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We are working hard to bring you features like:
          </p>
          <ul className="list-disc list-inside text-muted-foreground ml-4 mt-2 space-y-1">
            <li>Popular genre trends by region.</li>
            <li>Average booking rates analysis.</li>
            <li>Event attendance forecasts (experimental).</li>
            <li>Artist discovery growth metrics.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
