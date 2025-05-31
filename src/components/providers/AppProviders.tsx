"use client";

import type { ReactNode } from 'react';
import { UserProvider } from '@/contexts/UserContext';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // If needed for GenAI flows with react-query

// const queryClient = new QueryClient(); // If needed

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    // <QueryClientProvider client={queryClient}> // If needed
      <UserProvider>
        {children}
      </UserProvider>
    // </QueryClientProvider> // If needed
  );
}
