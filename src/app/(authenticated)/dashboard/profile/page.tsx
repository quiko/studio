
"use client";

import ArtistProfileForm from "@/components/forms/ArtistProfileForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useState, useEffect } from "react"; // Added useEffect
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useUser } from "@/contexts/UserContext"; // Added useUser
import type { ArtistAvailabilitySlot } from "@/lib/constants"; // Added ArtistAvailabilitySlot

export default function ArtistProfilePage() {
  const { firebaseUser, getArtistProfile } = useUser(); // Get user and profile getter
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>([]);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const profileFormId = "artist-profile-main-form";

  // Get the form instance from ArtistProfileForm (if it were to expose it, not standard)
  // For now, we'll rely on useEffect to sync selectedDates to the form's values
  // This requires ArtistProfileForm to be able to accept 'availability' as a default value.

  useEffect(() => {
    if (firebaseUser) {
      const profile = getArtistProfile(firebaseUser.uid);
      if (profile && profile.availability) {
        const initialDates = profile.availability.map(slot => 
          slot.startDate instanceof Date ? slot.startDate : new Date(slot.startDate)
        );
        setSelectedDates(initialDates);
      }
    }
  }, [firebaseUser, getArtistProfile]);

  // This effect will update the form's 'availability' field whenever selectedDates changes.
  // This assumes that the `ArtistProfileForm` is rendered and its `form` object is accessible
  // or that `ArtistProfileForm` can react to changes in `defaultValues` if re-rendered.
  // A more robust way would be to lift the form state or use a shared context/zustand store.
  // For this implementation, we'll rely on the parent controlling a key part of form's data via props.
  // This is implicitly handled because ArtistProfileForm's useEffect will re-evaluate defaultValues
  // when `getArtistProfile(firebaseUser.uid)` changes due to an update.
  // However, to make the calendar sync directly *into* the form instance used by ArtistProfileForm,
  // we'd need a more coupled solution or direct form instance sharing.

  // For now, we'll assume the profile data in UserContext is the single source of truth that the form reads on init.
  // The "Save Profile" button will submit the form, which should include availability if it's part of form values.
  // We need to ensure ArtistProfileForm properly picks up availability.

  // Let's try to get the form instance from the form component to call setValue.
  // This is not typical, usually, the form is self-contained or state is lifted.
  // As an alternative, we will manage `availability` in ArtistProfileForm directly reacting to UserContext
  // and let this page focus on the calendar UI part, then pass the selected dates TO the form submission process.

  // The current approach with `ArtistProfileForm` re-initializing from context on profile update
  // means we don't directly call `form.setValue` from here.
  // The `ArtistProfileForm` needs to be the one handling the `availability` field's state.

  // The calendar on this page will update `selectedDates`.
  // When "Save Profile" (which triggers ArtistProfileForm's onSubmit) is clicked,
  // the `ArtistProfileForm`'s `onSubmit` needs to somehow get these `selectedDates`.

  // Solution:
  // 1. `ArtistProfilePage` manages `selectedDates` from the Calendar.
  // 2. When `ArtistProfileForm` is submitted, `ArtistProfilePage` will provide `selectedDates` to it.
  // This is a bit tricky without direct communication.
  // Simpler: `ArtistProfileForm` will also render its own calendar or receive `selectedDates` as a prop.

  // Revised strategy: `ArtistProfilePage` will pass `selectedDates` to `ArtistProfileForm`
  // `ArtistProfileForm` will use these to set its `availability` field.

  const handleSaveProfileWithAvailability = () => {
    // This function will be passed to ArtistProfileForm to be called before its internal submit.
    // Or, ArtistProfileForm's submit button will be here.
    // The current setup has the submit button here.
    // So, when this button is clicked, it needs to trigger the form's submit AND pass selectedDates.
    
    // The `form` attribute on the button links it to the form in `ArtistProfileForm`.
    // We need to ensure `ArtistProfileForm` is aware of `selectedDates` when its `onSubmit` is called.
    // This will be handled by `ArtistProfileForm` having `selectedDates` passed as a prop.
    // The form submission logic in ArtistProfileForm will then include these.
    // This seems like the most direct way given the current structure.

    // Trigger the form submission programmatically (if the button is not type="submit" for that form)
    // Or, ensure the form state includes availability derived from selectedDates by the time submit is called.
    // The current `Save Profile` button is already linked to the form in `ArtistProfileForm` via `form={profileFormId}`.
    // So, `ArtistProfileForm`'s `onSubmit` will be called. We need to ensure it has the latest availability.
    // This means `ArtistProfileForm` needs to be aware of `selectedDates` from this parent page.
    // We will pass `selectedDates` as a prop to `ArtistProfileForm`.
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
          {/* Pass selectedDates and the setter for loading state */}
          <ArtistProfileForm 
            formId={profileFormId} 
            onSetIsLoading={setIsProfileSaving}
            currentAvailabilityDates={selectedDates} // Pass current calendar selection
          />
        </CardContent>
      </Card>

      <Card id="manage-availability">
        <CardHeader>
          <CardTitle className="font-headline">Manage Availability</CardTitle>
          <CardDescription>Select the dates you are available for bookings. Click a date to select or deselect it.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-2">
          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates} // This updates selectedDates state in this component
            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
            className="rounded-md border shadow-sm"
          />
          {selectedDates && selectedDates.length > 0 && (
            <div className="mt-4 p-4 bg-muted/50 rounded-md w-full max-w-md">
              <h4 className="font-semibold mb-2 text-sm">Selected Dates on Calendar:</h4>
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
      </Card>

      <div className="flex justify-end pt-4 border-t">
        <Button
          type="submit" // This button submits the form defined in ArtistProfileForm
          form={profileFormId} // Links this button to that form
          disabled={isProfileSaving}
          className="min-w-[150px]"
          onClick={handleSaveProfileWithAvailability} // This might be redundant if type="submit" form="id" works as expected
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
