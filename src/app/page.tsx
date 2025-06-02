import Link from 'next/link';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Home, Info, Users, Album, Mail, UserCircle, ArrowRight, BookOpen } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-background text-foreground overflow-hidden p-4 md:p-8 grid-background">
      
      <Link href="#" className="absolute top-6 right-6 md:top-8 md:right-8 text-sm text-primary hover:underline z-20 flex items-center group">
        Send your demos <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>

      {/* Decorative Images */}
      <div className="absolute top-10 left-10 md:top-16 md:left-16 w-28 h-44 md:w-32 md:h-48 z-0 opacity-30 transform -rotate-6">
        <Image 
          src="https://placehold.co/200x300.png" 
          alt="Singer silhouette" 
          layout="fill" 
          objectFit="cover" 
          className="rounded-lg shadow-xl"
          data-ai-hint="singer silhouette stage" 
        />
      </div>
      <div className="absolute top-16 right-10 md:top-24 md:right-20 w-36 h-28 md:w-40 md:h-32 z-0 opacity-30 transform rotate-4">
        <Image 
          src="https://placehold.co/300x200.png" 
          alt="Singer with microphone" 
          layout="fill" 
          objectFit="cover" 
          className="rounded-lg shadow-xl"
          data-ai-hint="singer microphone dark"
        />
      </div>

      <header className="relative z-10 flex flex-col items-center text-center my-auto">
        <h1 className="text-8xl sm:text-9xl md:text-[10rem] lg:text-[12rem] font-headline font-bold text-foreground select-none">
          {APP_NAME}
        </h1>
        <p className="mt-2 md:mt-4 text-base md:text-lg text-muted-foreground max-w-md">
          (Body Text) Discover, create, and connect. The future of music curation.
        </p>
      </header>
      
      <div className="absolute bottom-[28%] md:bottom-1/4 left-1/2 transform -translate-x-1/2 w-4/5 sm:w-3/5 md:w-2/5 aspect-[16/9] z-0 opacity-50 shadow-2xl rounded-lg overflow-hidden">
        <Image 
          src="https://placehold.co/800x450.png" 
          alt="Music concert" 
          layout="fill" 
          objectFit="cover"
          data-ai-hint="music concert crowd"
        />
      </div>

      <div className="absolute bottom-[28%] md:bottom-1/4 left-8 md:left-16 lg:left-24 w-28 h-28 md:w-32 md:h-32 z-10 flex flex-col items-center justify-center">
        <div className="w-24 h-24 md:w-28 md:h-28 border-2 border-primary rounded-full flex items-center justify-center p-2">
          <p className="text-primary uppercase text-[0.6rem] md:text-xs leading-tight text-center font-medium tracking-wider">
            Scroll <br /> To <br /> Explore
          </p>
        </div>
      </div>
      
      <Link href="#" className="absolute bottom-6 right-6 md:bottom-8 md:right-8 text-sm text-muted-foreground hover:text-primary z-20 flex items-center group">
        <BookOpen className="mr-1.5 h-4 w-4" /> Wiki
      </Link>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 mb-3 md:mb-5 w-[calc(100%-2rem)] max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg z-20">
        <div className="bg-black/60 backdrop-blur-lg rounded-xl shadow-2xl p-2 flex items-center justify-around text-sm">
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Home className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Home</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Info className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">About</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Artists</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Album className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Releases</span>
          </Link>
          <Link href="#" className="flex flex-col items-center text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-md">
            <Mail className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs mt-0.5">Contact</span>
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors p-1.5 sm:p-2 rounded-full">
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
