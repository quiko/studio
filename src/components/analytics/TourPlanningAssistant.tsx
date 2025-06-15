
"use client";


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn
 } from "@/lib/utils"; // Utility for conditional class names

// Define types for city data
interface CitySuggestion {
  city: string;
  listeners: string;
  venue: string;
}

// Define city data for each region
const suggestedCities: Record<string, CitySuggestion[]> = {
  "north-america": [
    { city: "New York, NY", listeners: "12,000", venue: "Brooklyn Steel (1,800 capacity)" },
    { city: "Los Angeles, CA", listeners: "8,500", venue: "The Fonda Theatre (1,200 capacity)" },
    { city: "Chicago, IL", listeners: "4,200", venue: "Thalia Hall (800 capacity)" },
    { city: "Toronto, ON", listeners: "6,500", venue: "The Danforth Music Hall (1,500 capacity)" },
    { city: "Austin, TX", listeners: "3,800", venue: "Emo's (1,700 capacity)" },
  ],
  "europe": [
    { city: "London, UK", listeners: "10,000", venue: "O2 Academy Brixton (4,900 capacity)" },
    { city: "Berlin, DE", listeners: "7,800", venue: "Astra Kulturhaus (1,500 capacity)" },
    { city: "Paris, FR", listeners: "4,800", venue: "La Cigale (1,000 capacity)" },
    { city: "Amsterdam, NL", listeners: "3,200", venue: "Paradiso (1,500 capacity)" },
    { city: "Barcelona, ES", listeners: "2,900", venue: "Razzmatazz (1,700 capacity)" },
  ],
  // Add data for other regions if needed
  "asia": [],
  "latin-america": [],
  "australia-new-zealand": []
};


export default function TourPlanningAssistant() {
  // State for the "Suggested Tour" tab
  const [region, setRegion] = useState<string>("north-america");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [planGenerated, setPlanGenerated] = useState<boolean>(false);

  // Function to simulate generating the plan
  const handleGeneratePlan = () => {
    setIsGenerating(true);
    setPlanGenerated(false); // Reset planGenerated before starting
    // Simulate a delay (e.g., fetching data from an API)
    setTimeout(() => {
      setIsGenerating(false);
      setPlanGenerated(true); // Mark plan as generated after delay
    }, 1500); // 1.5 seconds delay
  };

  // Function to reset the suggested plan state
  const handleResetPlan = () => {
    setPlanGenerated(false);
    setRegion("north-america"); // Reset region to default
  };

  // Get the list of cities based on the selected region
  const currentSuggestedCities = suggestedCities[region] || [];

  return (
    <Card className="w-full"> {/* Card wraps the entire component */}
      <CardHeader>
        <CardTitle>Tour Planning Assistant</CardTitle>
        <CardDescription>Plan your tour based on your audience
 data</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="suggested-tour" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="suggested-tour">Suggested Tour</TabsTrigger>
            <TabsTrigger value="custom-planning">Custom Planning</TabsTrigger>
          </TabsList>
          <TabsContent value="suggested-tour" className="mt-4">
            {/* Controls for Suggested Tour Tab */}
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
              {/* Region Select */}
              <div className="flex-1 w-full sm:w-auto"> {/* Make select full width on small screens */}
                <Label htmlFor="region-select" className="sr-only">Select Region</Label>
                <Select value={region} onValueChange={setRegion} disabled={isGenerating}>
                  <SelectTrigger id="region-select">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="latin-america">Latin America</SelectItem>
                    <SelectItem value="australia-new-zealand">Australia & New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Generate Button */}
              <Button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? "Generating..." : "Generate Tour Plan"}
              </Button>
              {/* Reset Button (conditionally rendered) */}
              {planGenerated && (
                <Button variant="outline" onClick={handleResetPlan} className="w-full sm:w-auto">Reset</Button>
              )}
            </div>

            {/* Display Logic for Suggested Cities */}
            {planGenerated ? (
              // If plan generated
              currentSuggestedCities.length > 0 ? (
                // If cities exist for the region
                <div className="space-y-4">
                  {currentSuggestedCities.map((item, index) => (
                    <div key={index} className={cn(
                      "flex justify-between items-start pb-4",
                      index < currentSuggestedCities.length - 1 && "border-b border-gray-200 dark:border-gray-700" // Add bottom border except for the last item
                    )}>
                      <div className="flex-1 pr-4">
                        <div className="font-bold">{item.city}</div>
                        <div className="text-sm text-muted-foreground">{item.venue}</div>
                      </div>
                      <div className="text-right font-semibold text-gray-800 dark:text-gray-200">{item.listeners}</div>
                    </div>
                  ))}
                </div>
              ) : (
                // If no cities for the selected region after generation
                <div className="text-center text-muted-foreground italic py-8">
                  No suggested cities available for this region.
                </div>
              )
            ) : (
              // Placeholder message before generation
              <div className="text-center text-muted-foreground italic py-8">
                Select a region and click "Generate Tour Plan" to see suggested cities...
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom-planning" className="mt-4">
            {/* Form for Custom Planning Tab */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tour Name */}
              <div className="grid gap-2">
                <Label htmlFor="tour-name">Tour Name</Label>
                <Input id="tour-name" placeholder="Enter tour name" />
              </div>
              {/* Start Date */}
              <div className="grid gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="date" />
              </div>
              {/* End Date */}
              <div className="grid gap-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input id="end-date" type="date" />
              </div>
              {/* Regions Select */}
              <div className="grid gap-2">
                <Label htmlFor="regions">Regions</Label>
                <Select>
                  <SelectTrigger id="regions">
                    <SelectValue placeholder="Select regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="north-america">North America</SelectItem>
                    <SelectItem value="europe">Europe</SelectItem>
                    <SelectItem value="asia">Asia</SelectItem>
                    <SelectItem value="latin-america">Latin America</SelectItem>
                    <SelectItem value="australia-new-zealand">Australia & New Zealand</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Venue Size Select */}
              <div className="grid gap-2">
                <Label htmlFor="venue-size">Venue Size</Label>
                <Select>
                  <SelectTrigger id="venue-size">
                    <SelectValue placeholder="Select venue size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (up to 500 capacity)</SelectItem>
                    <SelectItem value="medium">Medium (500-1,500 capacity)</SelectItem>
                    <SelectItem value="large">Large (1,500-5,000 capacity)</SelectItem>
                    <SelectItem value="extra-large">Extra Large (5,000+ capacity)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row space-y-4 sm:space-y-0">
        <Button variant="outline" className="w-full sm:w-auto">Export Plan</Button>
        <Button className="w-full sm:w-auto">Save Plan</Button>
      </CardFooter>
    </Card>
  );
}
