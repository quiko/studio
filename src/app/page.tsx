import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Users, Lightbulb, Mail, UserCircle, ArrowRight, BookOpen } from 'lucide-react'; // Changed Info to Lightbulb
import { ObsessionFullTextLogo } from '@/components/icons/ObsessionFullTextLogo';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden p-4 md:p-8 grid-background">

      <Link href="/signup" className="absolute top-6 right-6 md:top-8 md:right-8 text-sm text-primary hover:underline z-20 flex items-center group">
        Sign Up <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>

      <header className="relative z-10 flex flex-col items-center text-center my-auto">
        <ObsessionFullTextLogo className="text-foreground w-auto h-20 sm:h-24 md:h-32 lg:h-40 select-none" />
        <p className="mt-2 md:mt-4 text-base md:text-lg text-muted-foreground max-w-md">
          (Body Text) Discover, create, and connect. The future of music curation.
        </p>
      </header>

      <Link href="#" className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-sm text-muted-foreground hover:text-primary z-20 flex items-center group">
        <BookOpen className="mr-1.5 h-4 w-4" /> Wiki
      </Link>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 md:mb-5 w-[calc(100%-2rem)] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-20">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl shadow-2xl p-2 flex items-center justify-around text-sm">
          <Link href="/" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Home</span>
          </Link>
          <Link href="/login" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Login</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Artists</span>
          </Link>
          <Link href="/how-it-works" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">How it works</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Contact</span>
          </Link>
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-full"> {/* Point avatar to dashboard or profile */}
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-transparent hover:border-primary">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="profile abstract" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </nav>

      <footer className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground/50 z-0 pointer-events-none">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
