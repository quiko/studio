
"use client";

import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { UserType } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { User, Building } from 'lucide-react';

/**
 * @deprecated This component is no longer used directly on the landing page.
 * Its functionality has been integrated into dedicated Login and Sign Up forms.
 * It's kept here for potential future reuse or reference if a simpler selection
 * mechanism is needed elsewhere.
 */
export function UserTypeSelector() {
  const { setUserType } = useUser();
  const router = useRouter();

  const handleSelectUserType = (type: UserType) => {
    setUserType(type);
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button
        size="lg"
        onClick={() => handleSelectUserType(UserType.ORGANIZER)}
        className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
      >
        <Building className="mr-2 h-5 w-5" />
        Event Organizer
      </Button>
      <Button
        size="lg"
        onClick={() => handleSelectUserType(UserType.ARTIST)}
        className="bg-accent hover:bg-accent/90 text-accent-foreground flex-1"
      >
        <User className="mr-2 h-5 w-5" />
        Artist
      </Button>
    </div>
  );
}
