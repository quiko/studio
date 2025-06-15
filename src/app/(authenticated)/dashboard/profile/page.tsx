
"use client";

import ArtistProfileForm from "@/components/forms/ArtistProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react"; // Added Loader2 and Save

export default function ArtistProfilePage() {
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const profileFormId = "artist-profile-main-form";
  // In a real scenario, you would fetch and set existing availability here.

  // Handler for saving availability (to be implemented later)
  const handleSaveAvailability = () => {
    // Logic to save selectedDates to Firestore or your backend
    console.log("Selected dates to save:", selectedDates);
    // Example: toast({ title: "Availability Saved", description: "Your available dates have been updated." });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="My Artist Profile"
        description="Keep your profile updated to attract event organizers."
      />
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Profile Information</CardTitle>
            <CardDescription>Edit your public artist details and portfolio.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ArtistProfileForm formId={profileFormId} onSetIsLoading={setIsProfileSaving} />
        </CardContent>
      </Card>

      <Card id="manage-availability"> {/* Added id here */}
        <CardHeader>
          <CardTitle className="font-headline">Manage Availability</CardTitle>
          <CardDescription>Select the dates you are available for bookings. Click a date to select or deselect it.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-2">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates}
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} // Disables all days before today
            className="rounded-md border shadow-sm"
          />
          {selectedDates && selectedDates.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md w-full max-w-md">
              <h4 className="font-semibold mb-2 text-sm">Selected Dates:</h4>
              <ul className="list-disc list-inside text-sm space-y-1">
                {selectedDates
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map((date) => (
                    <li key={date.toISOString()}>{date.toLocaleDateString()}</li>
                  ))}
              </ul>
            </div>
          )}
        </CardContent>
        {/* 
        <CardFooter className="flex justify-end">
          <Button onClick={handleSaveAvailability} disabled={!selectedDates || selectedDates.length === 0}>
            Save Availability
          </Button>
        </CardFooter>
        */}
      </Card>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit"
          form={profileFormId}
          disabled={isProfileSaving}
          className="min-w-[150px]"
        >
          {isProfileSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isProfileSaving ? "Saving Profile..." : "Save Profile"}
        </Button>
      </div>
    </div>
  );
}

