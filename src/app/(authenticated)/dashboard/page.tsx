
"use client";

import { useUser } from '@/contexts/UserContext';
import { UserType } from '@/lib/constants';
import OrganizerDashboard from '@/components/dashboard/OrganizerDashboard';
import ArtistDashboard from '@/components/dashboard/ArtistDashboard';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { userRole, isLoading } = useUser(); // Changed from userType

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }
  
  const dashboardTitle = userRole === UserType.ORGANIZER ? "Organizer Dashboard" : "Artist Dashboard";
  const dashboardDescription = userRole === UserType.ORGANIZER 
    ? "Manage your events and find talented artists." 
    : "Showcase your talent and create music with AI.";

  return (
    <div>
      <PageHeader title={dashboardTitle} description={dashboardDescription} />
      {userRole === UserType.ORGANIZER && <OrganizerDashboard />}
      {userRole === UserType.ARTIST && <ArtistDashboard />}
      {userRole === UserType.NONE && (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Unable to determine user role. Please try logging out and back in.</p>
        </div>
      )}
    </div>
  );
}
