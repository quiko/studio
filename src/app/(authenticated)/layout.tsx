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
import { LogOut, Home } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  const { userType, setUserType, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-4 w-[250px] ml-4" />
      </div>
    );
  }

  if (userType === UserType.NONE) {
    if (typeof window !== 'undefined') router.push('/');
    return (
       <div className="flex items-center justify-center min-h-screen">
        <p>Redirecting to login...</p>
      </div>
    );
  }

  const handleLogout = () => {
    setUserType(UserType.NONE);
    router.push('/');
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
              <AvatarImage src={`https://placehold.co/40x40.png?text=${userInitial}`} alt={userType} />
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
