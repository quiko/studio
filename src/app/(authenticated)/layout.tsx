
"use client";

import type { ReactNode } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { userType, setUserType, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If loading is finished and there's no user type, redirect to login.
    // This check ensures we don't redirect during initial load or if already on login/signup.
    if (!isLoading && userType === UserType.NONE && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [isLoading, userType, router, pathname]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        {/* You can put a more sophisticated global loader here */}
        <Skeleton className="h-12 w-12 rounded-full bg-muted" />
        <Skeleton className="h-4 w-[250px] ml-4 bg-muted" />
      </div>
    );
  }

  // If still no user type after loading (and redirect hasn't happened yet or is in progress),
  // show a minimal loading state or null to prevent flashing content.
  if (userType === UserType.NONE) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }
  

  const handleLogout = () => {
    setUserType(UserType.NONE);
    router.push('/login'); // Redirect to login page after logout
  };

  const filteredNavItems = NAV_ITEMS.filter(item => item.allowedUsers.includes(userType));
  
  const userInitial = userType === UserType.ARTIST ? 'A' : userType === UserType.ORGANIZER ? 'O' : 'U';

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
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
           <div className="flex items-center gap-2 mb-2">
            <Avatar>
              <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={userType} data-ai-hint="abstract initial"/>
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium capitalize">{userType}</span>
              <span className="text-xs text-muted-foreground">
                {userType === UserType.ARTIST ? "Artist View" : "Organizer View"}
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
          {/* Breadcrumbs or other header content can go here */}
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

