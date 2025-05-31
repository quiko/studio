import { UserTypeSelector } from '@/components/auth/UserTypeSelector';
import { LogoIcon } from '@/components/icons/LogoIcon';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-slate-900 p-6 text-center">
      <header className="mb-12">
        <LogoIcon className="h-24 w-24 text-primary mx-auto mb-4" />
        <h1 className="text-6xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-primary to-purple-600 mb-4">
          {APP_NAME}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock your creative potential. {APP_NAME} connects event organizers with talented artists and empowers musicians with AI-driven composition tools.
        </p>
      </header>

      <div className="w-full max-w-md mb-12 p-8 bg-card rounded-xl shadow-2xl">
        <h2 className="text-2xl font-headline font-semibold mb-6 text-foreground">Get Started</h2>
        <UserTypeSelector />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto text-left">
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline font-semibold mb-2 text-primary">AI Artist Matchmaking</h3>
          <p className="text-sm text-muted-foreground">Find the perfect artists for your events with intelligent suggestions based on genre, budget, and event type.</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline font-semibold mb-2 text-accent">AI Music Generation</h3>
          <p className="text-sm text-muted-foreground">Compose original music, experiment with melodies, and explore new harmonies with our AI-assisted studio.</p>
        </div>
        <div className="bg-card p-6 rounded-lg shadow-lg">
          <h3 className="text-xl font-headline font-semibold mb-2 text-green-500">Seamless Collaboration</h3>
          <p className="text-sm text-muted-foreground">Connect, message, and generate draft contracts easily for smooth event bookings and collaborations.</p>
        </div>
      </section>
      
      <footer className="mt-16 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
      </footer>
    </div>
  );
}
