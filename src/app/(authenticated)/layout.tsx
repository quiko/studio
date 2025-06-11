
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react'; // Added useEffect
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { NAV_ITEMS, UserType, APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { firebaseUser, userRole, loading, logout, getArtistProfile, totalUnreadMessagesCount } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !firebaseUser && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [loading, firebaseUser, router, pathname]);


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Skeleton className="h-12 w-12 rounded-full bg-muted" />
        <Skeleton className="h-4 w-[250px] ml-4 bg-muted" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  
  const handleLogout = async () => {
    await logout(); // eslint-disable-line @typescript-eslint/no-floating-promises
    router.push('/login'); 
  };

  const filteredNavItems = NAV_ITEMS.filter(item => item.allowedUsers.includes(userRole));
  
  const userInitial = firebaseUser?.email?.charAt(0).toUpperCase() || (userRole === UserType.ARTIST ? 'A' : userRole === UserType.ORGANIZER ? 'O' : 'U');
  const userRoleDisplay = userRole.charAt(0).toUpperCase() + userRole.slice(1);
  
  // ... rest of the component code
  let avatarSrc = `https://placehold.co/40x40.png?text=${userInitial}`;
  let avatarHint = "abstract initial";

  if (firebaseUser && userRole === UserType.ARTIST) {
    const artistProfile = getArtistProfile(firebaseUser.uid);
    if (artistProfile && artistProfile.profileImage && artistProfile.profileImage !== 'https://placehold.co/150x150.png') { // Check against default placeholder
      avatarSrc = artistProfile.profileImage;
      avatarHint = artistProfile.dataAiHint || "musician portrait";
    }
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-headline font-semibold">{APP_NAME}</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={{ children: item.label, side: 'right' }}
                >
                  <Link href={item.href} className="flex items-center w-full">
                    <item.icon />
                    <span className="flex-1 flex items-center">
                      {item.label}
                      {item.label === 'Messages' && totalUnreadMessagesCount > 0 && (
                        <span className="indicator"></span>
                      )}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <div className="flex items-center gap-2 mb-2">
            <Avatar>
              <AvatarImage src={avatarSrc} alt={userRoleDisplay} data-ai-hint={avatarHint} />
              <AvatarFallback>{ userInitial }</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium capitalize">{userRoleDisplay}</span>
              <span className="text-xs text-muted-foreground">
                {firebaseUser.email}
              </span>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="md:hidden" />
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
